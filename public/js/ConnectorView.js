import { PersistentViewModel } from "./PersistentViewModel.js";

export class ConnectorView {
	constructor(socket, pvm, tvm) {
		this.socket = socket;
		this.pvm = pvm;
		this.tvm = tvm;
		this.element = document.querySelector(".connections");
		this.userNameEl = document.querySelector("#username input");
		this.gameNameEl = document.querySelector("#gamename input");
		this.joinEl = document.querySelector("#join");
		this.joiningEl = document.querySelector("#joining");
		this.leaveEl = document.querySelector("#leave");
		this.bindInput("username", this.userNameEl);
		this.bindInput("gamename", this.gameNameEl);
		this.state = this.tvm.state;
		this.tvm.bind("state", this.element, this.updateState.bind(this));

		this.joinEl.addEventListener('click', () => this.tvm.join += 1);
		this.leaveEl.addEventListener('click', () => {
			if (window.confirm("Really leave the game?")) {
				this.tvm.leave += 1;
			}
		});
	}
	/*
	 * bind input in both directions
	 */
	bindInput(key, element) {
		this.pvm.bind(key, element, PersistentViewModel.bindInput);
		element.addEventListener('blur', () => {
			this.pvm[key] = element.value;
			this.pvm.persist();
		});
	}
	updateState() {
		if (this.tvm.state != this.state) {
			this.element.classList.remove(this.state);
			this.element.classList.add(this.tvm.state);
			this.state = this.tvm.state;
			this.userNameEl.readOnly = this.state != "left";
			this.gameNameEl.readOnly = this.state != "left";
		}
	}
}
