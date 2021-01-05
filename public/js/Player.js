import { d10 } from "./d10.js";
import { PersistentViewModel } from "./PersistentViewModel.js";
import { ViewModel } from "./ViewModel.js";
import { RNG } from "./RNG.js";
import { PlayerView } from "./PlayerView.js";

const defaultIvm = {
	"username": "",
	"gamename": "",
	"difficulty": 6,
	"dicePool": 4,
	"bestialPool": 1,
	"roll": 0,
	"seed": 0,
	"locked": false,
	"secret": false
};

export class Player {
	constructor (id, isMyself, ivm = defaultIvm) {
		this.id = id;
		this.rng = new RNG();
		var iname = isMyself ? "wodice" : null;
		this.ivm = new PersistentViewModel(iname, ivm);
		this.ovm = new ViewModel([
			"rolling",
			"successCount",
			"success",
			"fail",
			"botch",
			"bestialFailure",
			"messyCritical"
		]);
		this.view = new PlayerView(isMyself, id, this.ivm, this.ovm);
		this.normalPool = [];
		this.bestialPool = [];
		["difficulty", "dicePool", "bestialPool"].forEach(key => this.ivm.bind(key, null, this.constrain.bind(this)));
		if (isMyself) {
			this.ivm.bind("roll", null, this.roll.bind(this));
		}
		this.ivm.bind("seed", null, this.doRoll.bind(this));
	}
	constrain() {
		if (this.ivm.dicePool < 1) {
			this.ivm.dicePool = 1;
		}
		if (this.ivm.dicePool > 20) {
			this.ivm.dicePool = 20;
		}
		if (this.ivm.difficulty < 2) {
			this.ivm.difficulty = 2;
		}
		if (this.ivm.difficulty > 10) {
			this.ivm.difficulty = 10;
		}
		if (this.ivm.bestialPool < 0) {
			this.ivm.bestialPool = 0;
		}
		if (this.ivm.bestialPool > this.ivm.dicePool) {
			this.ivm.bestialPool = this.ivm.dicePool;
		}
		this.updatePools();
	}
	updatePool(pool, color, size) {
		while(pool.length < size) {
			pool.push(new d10(color, this.rng, null, this.view.displayElement));
		}
		while(pool.length > size) {
			pool.pop().destruct();
		}
	}
	updatePools() {
		let normalSize = this.ivm.dicePool - this.ivm.bestialPool;
		let beastSize = this.ivm.bestialPool;
		this.updatePool(this.normalPool, "normal", normalSize);
		this.updatePool(this.bestialPool, "bestial", beastSize);
	}
	roll(el, value) {
		if (this.ivm.locked) {
			return;
		}
		if (value == 0 || this.ovm.rolling) {
			return;
		}

		// Re-seed with current moment so when you click matters,
		// even though it's all random anyway.
		this.ivm.seed = this.rng.reset();
	}
	doRoll(el, value) {
		console.log("DO ROLL", value);
		if (value == 0) {
			return;
		}

		this.ovm.success = false;
		this.ovm.fail = false;
		this.ovm.botch = false;
		this.ovm.bestialFailure = false;
		this.ovm.messyCritical = false;
		this.ovm.rolling = true;

		let threshold = this.ivm.difficulty;
		this.updatePools();
		let rollPromises = [].concat(this.normalPool.map(d => d.roll(threshold)), this.bestialPool.map(d => d.roll(threshold)));
		Promise.all(rollPromises).then(() => {
			this.analyze();
			this.ovm.rolling = false;
			this.ivm.seed = 0;
			this.ivm.roll = 0;
			this.ivm.persist();
		});
	}
	analyze() {
		let normalValues = Array.prototype.concat.apply([], this.normalPool.map(d => d.values()));
		let beastValues = Array.prototype.concat.apply([], this.bestialPool.map(d => d.values()));

		let d = this.analyzeSet(normalValues);
		let b = this.analyzeSet(beastValues);

		console.log("normalValues", normalValues);
		console.log("beastValues", beastValues);
		console.log("normalAnalysis", d);
		console.log("beastAnalysis", b);

		this.ovm.successCount = d.successes + b.successes + d.failures + b.failures;
		if (this.ovm.successCount > 0) {
			this.ovm.success = true;
			// It's a success ... is it a messy critical?
			if (b.criticals >= 1 && b.criticals + d.criticals >= 2) {
				this.ovm.messyCritical = true;
			}
		} else {
			// If we got here, it's a failure.  But what kind of failure?
			this.ovm.fail = true;
			if (d.successes == 0 && b.successes == 0) {
				if (b.failures < 0) {
					this.ovm.bestialFailure = true;
				}
				if (d.failures < 0) {
					this.ovm.botch = true;
				}
			}
		}
	}
	analyzeSet(numbers) {
		let failures = 0, successes = 0, criticals = 0;
		let difficulty = this.ivm.difficulty;
		numbers.forEach(n => {
			if (n == 1) {
				failures--;
			}
			if (n == 10) {
				criticals++;
			}
			if (n >= difficulty) {
				successes++;
			}
		});
		return { criticals, failures, successes };
	}
	destruct() {
		this.view.destruct();
	}
}
