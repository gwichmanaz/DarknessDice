export class OutputView {
	constructor(vm) {
		this.element = document.querySelector(".outputs");
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
