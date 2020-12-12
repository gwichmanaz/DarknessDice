import { d10 } from "./d10.js";
import { ViewModel } from "./ViewModel.js";
import { InputView } from "./InputView.js";

export class WoDiceRoller {
	constructor() {
		this.vm = new ViewModel(["difficulty", "dicePool", "bestialPool", "rollOutput", "messyCritical", "roll"]);
		this.view = new InputView(this.vm);
		this.normalPool = [];
		this.bestialPool = [];
		["difficulty", "dicePool", "bestialPool"].forEach(key => this.vm.bind(key, null, this.constrain.bind(this)));
		this.vm.difficulty = 6;
		this.vm.dicePool = 1;
		this.vm.bestialPool = 0;
		this.vm.roll = 0;
		this.vm.bind("roll", null, this.roll.bind(this));
	}
	constrain() {
		if (this.vm.dicePool < 1) {
			this.vm.dicePool = 1;
		}
		if (this.vm.dicePool > 20) {
			this.vm.dicePool = 20;
		}
		if (this.vm.difficulty < 2) {
			this.vm.difficulty = 2;
		}
		if (this.vm.difficulty > 10) {
			this.vm.difficulty = 10;
		}
		if (this.vm.bestialPool < 0) {
			this.vm.bestialPool = 0;
		}
		if (this.vm.bestialPool > this.vm.dicePool) {
			this.vm.bestialPool = this.vm.dicePool;
		}
		this.updatePools();
	}
	updatePool(pool, color, size) {
		while(pool.length < size) {
			pool.push(new d10(color));
		}
		while(pool.length > size) {
			pool.pop().destruct();
		}
	}
	updatePools() {
		let normalSize = this.vm.dicePool - this.vm.bestialPool;
		let beastSize = this.vm.bestialPool;
		this.updatePool(this.normalPool, "normal", normalSize);
		this.updatePool(this.bestialPool, "bestial", beastSize);
	}
	roll(el, value) {
		if (value == 0 || this.rolling) {
			return;
		}
		this.rolling = true;
		console.log("ROLLING");
		this.vm.rollOutput = "(rolling)";
		this.vm.messyCritical = "";
		let threshold = this.vm.difficulty;
		this.updatePools();
		let rollPromises = [].concat(this.normalPool.map(d => d.roll(threshold)), this.bestialPool.map(d => d.roll(threshold)));
		Promise.all(rollPromises).then(() => {
			this.analyze();
			this.rolling = false;
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

		let success, isFail = false, isBotch = false, isBestialFailure = false, isMessyCritical = false;

		success = d.successes + b.successes + d.failures + b.failures;
		if (success > 0) {
			// It's a success ... is it a messy critical?
			if (b.criticals >= 1 && b.criticals + d.criticals >= 2) {
				isMessyCritical = true;
			}
		} else {
			// If we got here, it's a failure.  But what kind of failure?
			isFail = true;
			if (d.successes == 0 && b.successes == 0) {
				if (b.failures < 0) {
					isBestialFailure = true;
				}
				if (d.failures < 0) {
					isBotch = true;
				}
			}
		}
		//update vm accordingly...
		this.vm.messyCritical = isMessyCritical ? "Messy Critical" : "";
		this.vm.rollOutput = isBestialFailure ? "Bestial Failure" :
			isBotch ? "Botch" :
			isFail ? "Fail" :
			success > 1 ? `${success} Successes` :
				"1 Success"
	}
	analyzeSet(numbers) {
		let failures = 0, successes = 0, criticals = 0;
		let difficulty = this.vm.difficulty;
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
