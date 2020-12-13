import { ViewModel } from "./ViewModel.js";

var prefix = "pvm-";

function loadPersist(pvm, initial) {
	var pvs = localStorage.getItem(prefix + pvm.__name);
	if (pvs) {
		initial = JSON.parse(pvs);
	}
	Object.keys(initial).forEach(key => {
		if (pvm.hasOwnProperty(key)) {
			pvm[key] = initial[key];
		}
	});
}

function savePersist(pvm) {
	var pvs = JSON.stringify(pvm._vmObject);
	localStorage.setItem(prefix + pvm.__name, pvs);
}

export class PersistentViewModel extends ViewModel {
	static setPrefix(s) {
		prefix = s;
	}
	constructor(name, initial) {
		super(Object.keys(initial));
		this.__name = name;
		loadPersist(this, initial);
	}
	persist() {
		savePersist(this);
	}
}
