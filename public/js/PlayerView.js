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
		} else {
			let parentElement = document.querySelector(".players");
			this.element = document.createElement("div");
			this.element.id = id;
			this.element.innerHTML = document.querySelector("#others").innerHTML;
			parentElement.appendChild(this.element);
			this.element.querySelector(".username").innerHTML = ivm.username;
		}
		new InputView(this.ivm, this.element);
		new OutputView(this.ovm, this.element);
		this.displayElement = this.element.querySelector(".display");
	}
	destruct() {
		if (!this.isMyself) {
			this.element.parentElement.removeChild(this.element);
		}
	}
}
