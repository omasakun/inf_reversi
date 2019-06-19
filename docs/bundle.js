function isChrome() {
    return navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
}
function showConsoleBanner() {
    if (isChrome()) {
        console.log("\n" +
            "%c %c Infinite Reversi \n" +
            "%c %c Made by omasakun on 2019\n" +
            "%c %c GitHub: https://github.com/omasakun/inf_reversi\n" +
            "%c %c Enjoy!\n", "color: #130f40; background-color: #a799ef; line-height: 2;", "color: #ddd6ff; background-color: #524983; line-height: 2;", "color: #130f40; background-color: #a799ef; line-height: 1.5;", "", "color: #130f40; background-color: #a799ef; line-height: 1.5;", "", "color: #130f40; background-color: #a799ef; line-height: 1.5;", "font-weight: bold");
    }
    else {
        console.log("\n" +
            "┃ ### Infinite Reversi ### \n" +
            "┃ \n" +
            "┃ Made by omasakun on 2019\n" +
            "┃ GitHub: https://github.com/omasakun\n" +
            "┃ Enjoy!\n");
    }
}
showConsoleBanner();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlcyI6WyIuLi9zcmMvdHMvaW5kZXgudHMiXSwic291cmNlc0NvbnRlbnQiOlsiZnVuY3Rpb24gaXNDaHJvbWUoKSB7XG5cdHJldHVybiBuYXZpZ2F0b3IudXNlckFnZW50LnRvTG93ZXJDYXNlKCkuaW5kZXhPZignY2hyb21lJykgPiAtMTtcbn1cbmZ1bmN0aW9uIHNob3dDb25zb2xlQmFubmVyKCkge1xuXHRpZiAoaXNDaHJvbWUoKSkge1xuXHRcdGNvbnNvbGUubG9nKFxuXHRcdFx0XCJcXG5cIiArXG5cdFx0XHRcIiVjICVjIEluZmluaXRlIFJldmVyc2kgXFxuXCIgK1xuXHRcdFx0XCIlYyAlYyBNYWRlIGJ5IG9tYXNha3VuIG9uIDIwMTlcXG5cIiArXG5cdFx0XHRcIiVjICVjIEdpdEh1YjogaHR0cHM6Ly9naXRodWIuY29tL29tYXNha3VuL2luZl9yZXZlcnNpXFxuXCIgK1xuXHRcdFx0XCIlYyAlYyBFbmpveSFcXG5cIixcblx0XHRcdFwiY29sb3I6ICMxMzBmNDA7IGJhY2tncm91bmQtY29sb3I6ICNhNzk5ZWY7IGxpbmUtaGVpZ2h0OiAyO1wiLFxuXHRcdFx0XCJjb2xvcjogI2RkZDZmZjsgYmFja2dyb3VuZC1jb2xvcjogIzUyNDk4MzsgbGluZS1oZWlnaHQ6IDI7XCIsXG5cdFx0XHRcImNvbG9yOiAjMTMwZjQwOyBiYWNrZ3JvdW5kLWNvbG9yOiAjYTc5OWVmOyBsaW5lLWhlaWdodDogMS41O1wiLFxuXHRcdFx0XCJcIixcblx0XHRcdFwiY29sb3I6ICMxMzBmNDA7IGJhY2tncm91bmQtY29sb3I6ICNhNzk5ZWY7IGxpbmUtaGVpZ2h0OiAxLjU7XCIsXG5cdFx0XHRcIlwiLFxuXHRcdFx0XCJjb2xvcjogIzEzMGY0MDsgYmFja2dyb3VuZC1jb2xvcjogI2E3OTllZjsgbGluZS1oZWlnaHQ6IDEuNTtcIixcblx0XHRcdFwiZm9udC13ZWlnaHQ6IGJvbGRcIlxuXHRcdCk7XG5cdH0gZWxzZSB7XG5cdFx0Y29uc29sZS5sb2coXG5cdFx0XHRcIlxcblwiICtcblx0XHRcdFwi4pSDICMjIyBJbmZpbml0ZSBSZXZlcnNpICMjIyBcXG5cIiArXG5cdFx0XHRcIuKUgyBcXG5cIiArXG5cdFx0XHRcIuKUgyBNYWRlIGJ5IG9tYXNha3VuIG9uIDIwMTlcXG5cIiArXG5cdFx0XHRcIuKUgyBHaXRIdWI6IGh0dHBzOi8vZ2l0aHViLmNvbS9vbWFzYWt1blxcblwiICtcblx0XHRcdFwi4pSDIEVuam95IVxcblwiXG5cdFx0KTtcblx0fVxufVxuXG5zaG93Q29uc29sZUJhbm5lcigpOyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxTQUFTLFFBQVE7SUFDaEIsT0FBTyxTQUFTLENBQUMsU0FBUyxDQUFDLFdBQVcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztDQUNoRTtBQUNELFNBQVMsaUJBQWlCO0lBQ3pCLElBQUksUUFBUSxFQUFFLEVBQUU7UUFDZixPQUFPLENBQUMsR0FBRyxDQUNWLElBQUk7WUFDSiwyQkFBMkI7WUFDM0Isa0NBQWtDO1lBQ2xDLHlEQUF5RDtZQUN6RCxnQkFBZ0IsRUFDaEIsNERBQTRELEVBQzVELDREQUE0RCxFQUM1RCw4REFBOEQsRUFDOUQsRUFBRSxFQUNGLDhEQUE4RCxFQUM5RCxFQUFFLEVBQ0YsOERBQThELEVBQzlELG1CQUFtQixDQUNuQixDQUFDO0tBQ0Y7U0FBTTtRQUNOLE9BQU8sQ0FBQyxHQUFHLENBQ1YsSUFBSTtZQUNKLCtCQUErQjtZQUMvQixNQUFNO1lBQ04sOEJBQThCO1lBQzlCLHlDQUF5QztZQUN6QyxZQUFZLENBQ1osQ0FBQztLQUNGO0NBQ0Q7QUFFRCxpQkFBaUIsRUFBRSxDQUFDIn0=
