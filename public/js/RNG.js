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
	mulberry() {
		this.uses++;
		this.seed |= 0; this.seed = this.seed + 0x6D2B79F5 | 0;
		let a = this.seed;
		let t = Math.imul(a ^ a >>> 15, 1 | a);
		t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
		return ((t ^ t >>> 14) >>> 0);
	}
	minmax(min, max) {
		return min + (Math.abs(this.mulberry()) % (1 + max - min));
	}
	test(min, max, tries = 1000000) {
		let r = {};
		while(tries--) {
			let a = this.minmax(min, max);
			r[a] = r[a] || 0;
			r[a]++;
		}
		return r;
	}
}
