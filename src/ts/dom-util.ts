// ge geqa geq ce cLI remC addC remAll onClick onLoad

// getElementById
export function ge<T extends HTMLElement = HTMLElement>(id: string) {
	return document.getElementById(id) as T;
}
// getAllElementsByQuery
export function geqa(selectors: string) {
	return Array.from(document.querySelectorAll(selectors))
}
// getElementByQuery
export function geq(selectors: string) {
	return document.querySelector(selectors)
}
// createElement
export function ce<K extends keyof HTMLElementTagNameMap>(tagName: K, classes: string[] = [], children: HTMLElement[] = []): HTMLElementTagNameMap[K] {
	const e = document.createElement(tagName);
	classes.forEach(_ => addC(e, _));
	children.forEach(_ => e.appendChild(_));
	return e;
}
// createLiElement
export function cLI(innerText: string, classes: string[], id?: string, onClickFn?: () => any) {
	const li = ce("li");
	li.innerText = innerText;
	classes.forEach(_ => addC(li, _));
	if (id) li.id = id;
	if (onClickFn) onClick(li, onClickFn);
	return li;
}
// removeClassFromElement
export function remC(elm: HTMLElement, cls: string) {
	elm.classList.remove(cls);
}
// addClassToElement
export function addC(elm: HTMLElement, cls: string) {
	elm.classList.add(cls);
}
// removeAllChildren
export function remAll(elm: HTMLElement) {
	while (elm.firstChild)
		elm.removeChild(elm.firstChild);
}
// addOnClickEventListener
export function onClick(elm: HTMLElement, fn: (ev: HTMLElementEventMap["click"]) => any) {
	elm.addEventListener("click", fn);
}