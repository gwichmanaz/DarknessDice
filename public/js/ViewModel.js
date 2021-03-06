import { EventBus } from "./EventBus.js";

function checkValue(vm, key, value) {
	if (value !== vm._vmObject[key]) {
		vm.fire("VM_CHANGED", { vm: vm, key: key, from: vm._vmObject[key], to: value });
		vm._vmObject[key] = value;
		vm.fire("UPDATE_BINDING-" + key, value);
	}
}

function defaultUpdateFunc(element, value) {
	element.innerHTML = value;
}

export class ViewModel extends EventBus {
	constructor (keys) {
		super();
		this._vmObject = {};
		keys && this.addKeys(keys);
	}
	static bindCss (element, value) {
		element.className = value;
	}
	static bindInput (element, value) {
		element.value = value;
	}
	addKeys (key) {
		if (Array.isArray(key)) {
			key.forEach(this.addKeys.bind(this));
			return;
		}
		if (this.hasOwnProperty(key)) {
			return;
		}
		Object.defineProperty(this, key, {
			get: () => this._vmObject[key],
			set: (value) => {
				checkValue(this, key, value);
			}
		});
	}
	bind (key, element, updateFunc = defaultUpdateFunc) {
		this.on("UPDATE_BINDING-" + key, (value) => {
			updateFunc(element, value);
		});
	}
	onChange(updateFunc) {
		this.on("VM_CHANGED", updateFunc);
	}
	getKeys () {
		return Object.keys(this._vmObject);
	}
};
