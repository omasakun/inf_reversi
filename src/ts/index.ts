import { UI } from "./ui";
import { onLoad, isChrome } from "./util";
import { DrawableReversiBoard, Cell, opponentPiece } from "./reversi";

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


//#endregion

showConsoleBanner();
onLoad(() => {
	const ui = new UI();
	let board = new DrawableReversiBoard();
	console.log(window["ui"] = ui, window["board"] = board);

	let currentTurn = 1;
	let maxTurnCount = -1;
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
		return board.isFinished() || currentTurn > maxTurnCount;
	}

	board.bindCanvas(ui.getCanvas());
	board.setPlayerPiece(Cell.black);
	board.setCellSize(64);
	board.reset();
	board.onAfterPut = (x, y, piece) => {
		ui.addLog(`${piece === Cell.black ? "●" : "○"} (${x}, ${y})`);
		currentTurn++;
		updateShortMsg();
	};

	ui.onZoomInClicked = () => board.setCellSize(board.getCellSize() * 1.2);
	ui.onZoomOutClicked = () => board.setCellSize(board.getCellSize() / 1.2);
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
		board.setPlayerPiece(opponentPiece(player));
		updateMsg();
	}
	ui.onPlayClicked = (turnCount, isOnline) => {
		if (isOnline) {
			// TODO
			alert("Online mode is not supported yet... Please enjoy offline mode!");
			location.reload();
		} else {
			maxTurnCount = turnCount;
			ui.clearLog();
			ui.showGame();
			ui.getCanvas().onResize();
			board.render();
			updateShortMsg();
			updateMsg();
		}
	};
	ui.onJoinClicked = () => {
		// TODO
		alert("Online mode is not supported yet... Please enjoy offline mode!");
	};

	ui.showMenu();
});