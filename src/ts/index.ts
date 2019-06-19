function isChrome() {
	return navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
}
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

showConsoleBanner();