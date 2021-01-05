export class d10View {
	constructor(vm, parentElement) {
		this.parentElement = parentElement;
		this.element = document.createElement('div');
		this.faceElement = document.createElement('div');
		this.element.classList.add('d10');
		this.faceElement.classList.add('face');
		this.element.appendChild(this.faceElement);
		this.parentElement.appendChild(this.element);
		vm.bind("face", this.faceElement);
		vm.bind("spinning", this.element, (e, v) => e.classList.toggle("spinning", v));
		vm.bind("success", this.element, (e, v) => e.classList.toggle("success", v));
		vm.bind("critical", this.element, (e, v) => e.classList.toggle("critical", v));
		vm.bind("fail", this.element, (e, v) => e.classList.toggle("fail", v));
		vm.bind("color", this.element, this.setColor.bind(this));
	}
	setColor(e, v) {
		if (v != this.color) {
			this.element.classList.remove(this.color);
			this.element.classList.add(this.color = v);
		}
	}
	destruct() {
		this.parentElement.removeChild(this.element);
	}
}
