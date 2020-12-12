/**
 * miscellaneous utility routines
 */

const ONE_DAY = 1000 * 60 * 60 * 24;

export class Utils {
	static randRange(min, max) {
		return min + Math.floor(Math.random() * (1 + max - min));
	}
	/**
	 * filter duplicate entries from an @array
	 */
	static distinct(array) {
		return array.filter((value, index, self) => self.indexOf(value) == index);
	}
	/**
	 * return a promise that resolves after waiting @milliseconds
	 */
	static wait(milliseconds) {
		return new Promise(function (resolve) {
			setTimeout(resolve, milliseconds);
		});
	}

	static waitMax(promise, milliseconds) {
		return Promise.race([promise, Utils.wait(milliseconds)]);
	}
	/**
	 * choose an element at random from an array
	 */
	static randomElement(array) {
		return array[Math.floor(Math.random() * array.length)];
	}

	static shuffle(array) {
		var temp = array.slice();
		for(var i = temp.length - 1; i > 0; i--) {
			// Get random index to swap the tiles with
			let j = Math.floor(Math.random() * (i + 1));
			let t = temp[i];
			temp[i] = temp[j];
			temp[j] = t;
		}
		return temp;
	}
}
