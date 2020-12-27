var salt = 0;

var saltSeed = () => {
	return Date.now() + ++salt;
}

export class RNG {
	constructor(seed) {
		seed = seed || saltSeed();
		this.seed = Math.floor(Math.abs(seed));
		this.uses = 0;
	}
	next() {
		this.uses++;
		this.seed = Math.imul(48271, this.seed) | 0 % 2147483647;
		return this.seed;
	}
	minmax(min, max) {
		return min + (Math.abs(this.next()) % (1 + max - min));
	}
}
