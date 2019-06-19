export function isChrome() {
	return navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
}

// onWindowLoaded
export function onLoad(fn: () => any) {
	window.addEventListener("load", fn);
}
// onAnimationFrame
export function onAnim(fn: () => { continue: boolean }) {
	requestAnimationFrame(function tmp() {
		if (fn().continue) requestAnimationFrame(tmp);
	});
}