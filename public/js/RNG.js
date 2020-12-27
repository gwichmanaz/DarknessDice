var salt = 0;

var saltSeed = () => {
	salt += 1000 * 60 * 60 * 24;
	return Date.now() - salt;
}

export class RNG {
	constructor(seed) {
		seed = seed || saltSeed();
		this.seed = Math.floor(Math.abs(seed)) % 2147483647;
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
