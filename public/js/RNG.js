export class RNG {
	constructor(seed) {
		seed = seed || Date.now();
		this.seed = Math.floor(Math.abs(seed));
		this.uses = 0;
	}
	next() {
		this.uses++;
		this.seed = Math.abs(Math.imul(48271, this.seed) | 0 % 2147483647);
		return this.seed;
	}
	minmax(min, max) {
		return min + (this.next() % (1 + max - min));
	}
}
