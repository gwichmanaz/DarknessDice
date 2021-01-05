export class InputView {
	constructor(vm, parentElement = document) {
		this.element = parentElement.querySelector(".inputs");
		this.difficultyEl = this.element.querySelector(".difficulty");
		this.dicePoolEl = this.element.querySelector(".dicePool");
		this.bestialPoolEl = this.element.querySelector(".bestialPool");
		["difficulty", "dicePool", "bestialPool"].forEach(key => this.bindNumericKey(vm, key));
		this.rollEl = this.element.querySelector(".roll");
		if (this.rollEl) {
			this.rollEl.addEventListener('click', () => vm.roll++);
		}
		["locked", "secret"].forEach(k => {
			vm.bind(k, this.element, (e, v) => e.classList.toggle(k, v));
		});
	}
	bindNumericKey(vm, key) {
		let el = this.element.querySelector(`.${key}`);
		vm.bind(key, el.querySelector(".value"));
		el.querySelector(".plus").addEventListener('click', () => vm[key]++);
		el.querySelector(".minus").addEventListener('click', () => vm[key]--);
	}
}
