import { ViewModel } from "./ViewModel.js";
import { d10View } from "./d10View.js";
import { Utils } from "./Utils.js";

const MIN_SPIN_MS = 500, MAX_SPIN_MS = 1500;
const SPINTERVAL_MS = 30;
const MIN_PIPS = 1, MAX_PIPS = 10;
const SPAWN_PIPS = MAX_PIPS;

export class d10 {
	constructor(color, parent = null) {
		this.generation = parent ? parent.generation + 1 : 0;
		this.vm = new ViewModel(["color", "spinning", "face", "success", "fail", "critical"]);
		this.view = new d10View(this.vm, parent && parent.view);
		this.spawns = [];
		this.vm.color = color;
		this.vm.spinning = false;
		this.vm.success = false;
		this.vm.fail = false;
		this.vm.critical = false;
		this.vm.face = 0;
	}
	_doSpin(bool) {
		clearInterval(this.interval);
		this.vm.spinning = bool;
		if (bool) {
			this.interval = setInterval(this.setFace.bind(this), SPINTERVAL_MS);
		}
	}
	roll(threshold) {
		this.despawn();
		this.vm.success = false;
		this.vm.fail = false;
		this.vm.critical = false;
		this._doSpin(true);
		return Utils.wait(Utils.randRange(MIN_SPIN_MS, MAX_SPIN_MS)).then(() => {
			this._doSpin(false);
			this.vm.success = this.vm.face >= threshold;
			this.vm.fail = this.vm.face == 1 && this.generation == 0;
			this.vm.critical = this.vm.face >= SPAWN_PIPS;
			if (this.vm.face >= SPAWN_PIPS) {
				return this.spawn().roll(threshold).then(() => {
					return this.values();
				});
			}
			return this.values();
		});
	}
	setFace() {
		this.vm.face = Utils.randRange(MIN_PIPS, MAX_PIPS);
	}
	spawn() {
		let newSpawn = new d10(this.vm.color, this);
		this.spawns.push(newSpawn);
		return newSpawn;
	}
	despawn() {
		while (this.spawns.length) {
			this.spawns.pop().destruct();
		}
	}
	values() {
		let myValue = this.vm.face;
		if (myValue == 1 && this.generation > 0) {
			// "1s on rerolled 10s do not subract successes"
			myValue = 1.1;
		}
		let faces = Array.prototype.concat.apply([myValue], this.spawns.map(s => s.values()));
		return faces;
	}
	destruct() {
		this.despawn();
		this.view.destruct();
	}
}