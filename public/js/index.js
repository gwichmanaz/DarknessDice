import { RNG } from "./RNG.js";
import { d10 } from "./d10.js";
import { ViewModel } from "./ViewModel.js";
import { PersistentViewModel } from "./PersistentViewModel.js";
import { InputView } from "./InputView.js";
import { OutputView } from "./OutputView.js";

export class WoDiceRoller {
	constructor() {
		this.rng = new RNG();
		this.pvm = new PersistentViewModel("inputs", {
			"difficulty": 6,
			"dicePool": 4,
			"bestialPool": 1,
			"roll": 0,
		});
		this.vm = new ViewModel([
			"rolling",
			"successCount",
			"success",
			"fail",
			"botch",
			"bestialFailure",
			"messyCritical"
		]);
		new InputView(this.pvm);
		new OutputView(this.vm);
		this.normalPool = [];
		this.bestialPool = [];
		["difficulty", "dicePool", "bestialPool"].forEach(key => this.pvm.bind(key, null, this.constrain.bind(this)));
		this.pvm.bind("roll", null, this.roll.bind(this));
	}
	constrain() {
		if (this.pvm.dicePool < 1) {
			this.pvm.dicePool = 1;
		}
		if (this.pvm.dicePool > 20) {
			this.pvm.dicePool = 20;
		}
		if (this.pvm.difficulty < 2) {
			this.pvm.difficulty = 2;
		}
		if (this.pvm.difficulty > 10) {
			this.pvm.difficulty = 10;
		}
		if (this.pvm.bestialPool < 0) {
			this.pvm.bestialPool = 0;
		}
		if (this.pvm.bestialPool > this.pvm.dicePool) {
			this.pvm.bestialPool = this.pvm.dicePool;
		}
		this.updatePools();
	}
	updatePool(pool, color, size) {
		while(pool.length < size) {
			pool.push(new d10(color, this.rng));
		}
		while(pool.length > size) {
			pool.pop().destruct();
		}
	}
	updatePools() {
		let normalSize = this.pvm.dicePool - this.pvm.bestialPool;
		let beastSize = this.pvm.bestialPool;
		this.updatePool(this.normalPool, "normal", normalSize);
		this.updatePool(this.bestialPool, "bestial", beastSize);
	}
	roll(el, value) {
		if (value == 0 || this.vm.rolling) {
			return;
		}

		this.vm.success = false;
		this.vm.fail = false;
		this.vm.botch = false;
		this.vm.bestialFailure = false;
		this.vm.messyCritical = false;
		this.vm.rolling = true;

		let threshold = this.pvm.difficulty;
		this.updatePools();
		let rollPromises = [].concat(this.normalPool.map(d => d.roll(threshold)), this.bestialPool.map(d => d.roll(threshold)));
		Promise.all(rollPromises).then(() => {
			this.analyze();
			this.vm.rolling = false;
			this.pvm.roll = 0;
			this.pvm.persist();
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

		this.vm.successCount = d.successes + b.successes + d.failures + b.failures;
		if (this.vm.successCount > 0) {
			this.vm.success = true;
			// It's a success ... is it a messy critical?
			if (b.criticals >= 1 && b.criticals + d.criticals >= 2) {
				this.vm.messyCritical = true;
			}
		} else {
			// If we got here, it's a failure.  But what kind of failure?
			this.vm.fail = true;
			if (d.successes == 0 && b.successes == 0) {
				if (b.failures < 0) {
					this.vm.bestialFailure = true;
				}
				if (d.failures < 0) {
					this.vm.botch = true;
				}
			}
		}
	}
	analyzeSet(numbers) {
		let failures = 0, successes = 0, criticals = 0;
		let difficulty = this.pvm.difficulty;
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
}
