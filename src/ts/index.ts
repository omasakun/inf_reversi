import { UI } from "./ui";
import { onLoad, isChrome } from "./util";
import { DrawableReversiBoard, Cell, opponentPiece, ReversiBoard, Piece } from "./reversi";

function showConsoleBanner() {
	if (isChrome()) {
		console.log(
			"\n" +
			"%c %c Infinite Reversi \n" +
			"%c %c Made by omasakun on 2019\n" +
			"%c %c GitHub: https://github.com/omasakun/inf_reversi\n" +
			"%c %c Enjoy!\n",
			"color: #130f40; background-color: #a799ef; line-height: 2;",
			"color: #ddd6ff; background-color: #524983; line-height: 2;",
			"color: #130f40; background-color: #a799ef; line-height: 1.5;",
			"",
			"color: #130f40; background-color: #a799ef; line-height: 1.5;",
			"",
			"color: #130f40; background-color: #a799ef; line-height: 1.5;",
			"font-weight: bold"
		);
	} else {
		console.log(
			"\n" +
			"┃ ### Infinite Reversi ### \n" +
			"┃ \n" +
			"┃ Made by omasakun on 2019\n" +
			"┃ GitHub: https://github.com/omasakun\n" +
			"┃ Enjoy!\n"
		);
	}
}

function getRoomID() {
	if (location.search === "" || location.search.includes("&")) return "";
	else return location.search.substr(1);
}

function id2ws(id: string) {
	const ws = new WebSocket("wss://connect.websocket.in/inf_reversi?room_id=" + id);
	ws.addEventListener("error", e => console.log(e));
	return ws;
}

function uuid() {
	return (Math.random().toString() + Math.random().toString()).replace(/0\./g, "").substr(1, 20);
}

function id2publishURL(id: string) {
	return location.origin + location.pathname + "?" + id;
}

type ReversiHist = { piece: Piece, x: number, y: number };
type WSData = { your_turn: Cell, max_turn_count: number, history: ReversiHist[] };

function autoSyncBoard(ws: WebSocket, board: DrawableReversiBoard, maxTurnCount?: number) {
	let histories: ReversiHist[] = [];
	let enableSend = true;
	let otherPeopleCount = 0;
	let isOpponentConnected = false;
	ws.addEventListener("message", ev => {
		enableSend = false;

		const wsData = JSON.parse(ev.data) as WSData;

		if (wsData.your_turn === Cell.nothing)
			board.setPlayerPiece(undefined);
		else
			board.setPlayerPiece(wsData.your_turn);

		board.maxTurnCount = wsData.max_turn_count;

		if (histories.some((hist, i) => {
			const newHist = wsData.history[i];
			return newHist.x !== hist.x || newHist.y !== hist.y || newHist.piece !== hist.piece;
		})) { // もしも履歴が食い違っていたら、一からボードを操作し直す。
			board.reset();
			histories = [];
		}
		wsData.history.slice(histories.length).forEach(hist => {
			board.put(hist.x, hist.y, hist.piece);
			// histories.push(hist); // this operation is done by board.onAfterPut 
		});

		enableSend = true;
	});
	const _board_onAfterPut = board.onAfterPut;
	board.onAfterPut = (x, y, piece) => {
		_board_onAfterPut(x, y, piece);
		histories.push({ x, y, piece });

		if (!enableSend) return;

		const player = board.getplayerPiece();
		if (!player) return; // 多分傍観者なので。
		if (board.maxTurnCount === undefined) throw "BUG"; // 多分起きないので
		const data2send: WSData = {
			your_turn: opponentPiece(player),
			max_turn_count: board.maxTurnCount,
			history: histories,
		};
		ws.send(JSON.stringify(data2send));
	}
	ws.addEventListener("open", () => {
		otherPeopleCount++;

		const player = board.getplayerPiece();
		if (board.maxTurnCount === undefined) return; // 初回起動時と思われる
		if (!player) return; // 多分傍観者なので。

		const data2send: WSData = {
			your_turn: isOpponentConnected ? Cell.nothing : opponentPiece(player),
			max_turn_count: board.maxTurnCount,
			history: histories,
		};
		ws.send(JSON.stringify(data2send));
		isOpponentConnected = true;
	});
	ws.addEventListener("close", () => {
		otherPeopleCount--;
	});
}

showConsoleBanner();
onLoad(() => {
	const ui = new UI();
	let board = new DrawableReversiBoard();
	console.log(window["ui"] = ui, window["board"] = board);

	let currentTurn = 1;
	const updateShortMsg = () => {
		ui.setShortMsg(`● x ${board.countPiece(Cell.black)} , ○ x ${board.countPiece(Cell.white)}`);
	};
	const updateMsg = () => {
		if (isGameover()) {
			const wCount = board.countPiece(Cell.white);
			const bCount = board.countPiece(Cell.black);
			if (wCount === bCount) {
				ui.setMsg("ゲーム終了。世にも珍しい引き分けです！");
			}
			ui.setMsg(`ゲーム終了。${bCount > wCount ? "●" : "○"} の勝利です！`);
			return;
		}
		const piece = board.getplayerPiece();
		if (!piece) return;
		ui.setMsg(`第${currentTurn}ターン。${piece === Cell.black ? "●" : "○"} のターンです。`);
	}
	const isGameover = () => {
		if (board.maxTurnCount === undefined) return false; // 応急措置
		return board.isFinished() || currentTurn > board.maxTurnCount;
	}

	board.bindCanvas(ui.getCanvas());
	board.setCellSize(64);
	const _board_onAfterPut = board.onAfterPut;
	board.onAfterPut = (x, y, piece) => {
		_board_onAfterPut(x, y, piece);
		ui.addLog(`${piece === Cell.black ? "●" : "○"} (${x}, ${y})`);
		currentTurn++;
		updateShortMsg();
	};

	ui.onZoomInClicked = () => board.setCellSize(board.getCellSize() * 1.2);
	ui.onZoomOutClicked = () => board.setCellSize(board.getCellSize() / 1.2);
	ui.onFullscreenClicked = () => {
		document.body.requestFullscreen();
	};

	let isOnlineMode = false;
	ui.onPutClicked = () => {
		if (isGameover()) {
			alert("ゲームは既に終わったのです。コマを置くことはできないのです。");
			return;
		}
		const selected = board.getSelected();
		const player = board.getplayerPiece();
		if (player === undefined) throw "BUG";
		if (!selected) {
			ui.setMsg("どのマスにコマを置きたいですか？ 置きたいマスをクリックしてください。");
			return;
		}
		if (!board.canPut(selected.x, selected.y, player)) {
			ui.setMsg(`選択したマス (${selected.x}, ${selected.y}) にはあなたのコマは置けないようです。他のマスを選択してください。黒いドットのついたマスならどこでもコマを置けます。`);
			return;
		}
		board.put(selected.x, selected.y, player);
		if (!isOnlineMode)
			board.setPlayerPiece(opponentPiece(player));
		updateMsg();
	};
	ui.onPlayClicked = (turnCount, isOnline) => {
		if (isOnline) {
			alert("Caution: Online game may not works properly... (This is why this game is work-in-progress)");
		}
		board.maxTurnCount = turnCount;
		isOnlineMode = isOnline;
		ui.clearLog();
		ui.showGame();
		ui.getCanvas().onResize();

		if (isOnline) {
			board.reset();
			board.setPlayerPiece(Cell.black);
			const roomId = uuid();
			const ws = id2ws(roomId)
			autoSyncBoard(ws, board);
			updateShortMsg();
			updateMsg();
			prompt("以下のURLを、対戦相手に開いてもらってください", id2publishURL(roomId));
		} else {
			board.reset();
			board.setPlayerPiece(Cell.black);
			updateShortMsg();
			updateMsg();
		}
	};
	if (getRoomID()) {
		alert("Caution: Online game may not works properly... (This is why this game is work-in-progress)");

		const ws = id2ws(getRoomID()!);
		autoSyncBoard(ws, board);
		ui.onPlayClicked(undefined, false);
	} else {
		ui.showMenu();
	}
});

/*
WebSocket で送信するデータ
{
	"your_piece": Cell.black or Cell.white or Cell.nothing,
	"history": [
		{"piece": Cell, "x": number, "y": number}
	]
}


*/