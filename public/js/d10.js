import { ViewModel } from "./ViewModel.js";
import { d10View } from "./d10View.js";
import { RNG } from "./RNG.js";

const MIN_SPINS = 20, MAX_SPINS = 50;
const SPINTERVAL_MS = 30;
const MIN_PIPS = 1, MAX_PIPS = 10;
const SPAWN_PIPS = MAX_PIPS;

var dino = 0;

export class d10 {
	constructor(color, rng = null, parent = null, topElement = null) {
		this.id = dino++;
		this.rng = rng || new RNG();
		this.generation = parent ? parent.generation + 1 : 0;
		this.vm = new ViewModel(["color", "spinning", "face", "success", "fail", "critical"]);
		this.view = new d10View(this.vm, parent ? parent.view.element : topElement);
		this.spawns = [];
		this.vm.color = color;
		this.vm.spinning = false;
		this.vm.success = false;
		this.vm.fail = false;
		this.vm.critical = false;
		this.vm.face = 0;
	}
	_doSpin(numSpins, fast = false) {
		clearInterval(this.interval);
		if (fast) {
			while(numSpins--) {
				this.setFace();
			}
			return Promise.resolve();
		}
		this.vm.spinning = true;
		return new Promise((resolve, reject) => {
			this.interval = setInterval(() => {
				this.setFace();
				numSpins--;
				if (numSpins <= 0) {
					clearInterval(this.interval);
					this.vm.spinning = false;
					resolve();
				}
			}, SPINTERVAL_MS);
		});
	}
	roll(threshold, fast = false) {
		this.despawn();
		this.vm.success = false;
		this.vm.fail = false;
		this.vm.critical = false;
		return this._doSpin(this.rng.minmax(MIN_SPINS, MAX_SPINS), fast).then(() => {
			this.vm.success = this.vm.face >= threshold;
			this.vm.fail = this.vm.face == 1 && this.generation == 0;
			this.vm.critical = this.vm.face >= SPAWN_PIPS;
			if (this.vm.face >= SPAWN_PIPS) {
				return this.spawn().roll(threshold, fast).then(() => {
					return this.values();
				});
			}
			return this.values();
		});
	}
	setFace() {
		this.vm.face = this.rng.minmax(MIN_PIPS, MAX_PIPS);
	}
	spawn() {
		let newSpawn = new d10(this.vm.color, null, this);
		this.rng.mulberry();
		newSpawn.reset(this.rng.seed);
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
	reset(seed) {
		this.rng.reset(seed);
	}
}
