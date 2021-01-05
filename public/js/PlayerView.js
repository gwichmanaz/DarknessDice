import { InputView } from "./InputView.js";
import { OutputView } from "./OutputView.js";

export class PlayerView {
	constructor(isMyself, id, ivm, ovm) {
		this.isMyself = isMyself;
		this.id = id;
		this.ivm = ivm;
		this.ovm = ovm;
		if (isMyself) {
			this.element = document.querySelector("#myself");
			let hiddenEl = document.querySelector("#hidden");
			hiddenEl.addEventListener('click', () => this.ivm.hidden = !this.ivm.hidden);
		} else {
			let parentElement = document.querySelector("#players");
			this.element = document.createElement("div");
			this.element.id = id;
			this.element.innerHTML = document.querySelector("#others").innerHTML;
			parentElement.appendChild(this.element);
			this.element.querySelector(".username").innerHTML = ivm.username;
			let lockedButton = this.element.querySelector(".user .locked");
			let secretButton = this.element.querySelector(".user .secret");
			lockedButton.addEventListener('click', () => this.ivm.locked = !this.ivm.locked);
			secretButton.addEventListener('click', () => this.ivm.secret = !this.ivm.secret);
		}
		new InputView(this.ivm, this.element);
		new OutputView(this.ovm, this.element);
		this.displayElement = this.element.querySelector(".display");
		this.ivm.bind("username", this.element, this.onUserName.bind(this));
		this.ivm.bind("hidden", this.element, (e, v) => e.classList.toggle("hidden", v));
	}
	onUserName(element, value) {
		let isDM = value.match(/^dm(\s.*)?$/i);
		element.classList.toggle("dm", isDM);
		element.classList.toggle("not-dm", !isDM);
		if (this.isMyself) {
			let playersEl = document.querySelector("#players");
			playersEl.classList.toggle("dm", isDM);
			playersEl.classList.toggle("not-dm", !isDM);
		}
	}
	destruct() {
		if (!this.isMyself) {
			this.element.parentElement.removeChild(this.element);
		}
	}
}
