export class OutputView {
	constructor(vm, parentElement = document) {
		this.element = parentElement.querySelector(".outputs");
		for (let el of this.element.querySelectorAll(".successCount")) {
			vm.bind("successCount", el);
		}
		["rolling",
		"success",
		"fail",
		"botch",
		"bestialFailure",
		"messyCritical"].forEach(k => {
			vm.bind(k, this.element, (e, v) => e.classList.toggle(k, v));
		});
	}
}
