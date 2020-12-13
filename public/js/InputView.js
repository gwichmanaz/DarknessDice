export class InputView {
	constructor(vm) {
		this.difficultyEl = document.querySelector("#difficulty");
		this.dicePoolEl = document.querySelector("#dicePool");
		this.bestialPoolEl = document.querySelector("#bestialPool");
		this.rollEl = document.querySelector("#roll");
		["difficulty", "dicePool", "bestialPool"].forEach(key => this.bindNumericKey(vm, key));
		this.rollEl.addEventListener('click', () => vm.roll++);
	}
	bindNumericKey(vm, key) {
		let el = document.querySelector(`#${key}`);
		vm.bind(key, el.querySelector(".value"));
		el.querySelector(".plus").addEventListener('click', () => vm[key]++);
		el.querySelector(".minus").addEventListener('click', () => vm[key]--);
	}
}
