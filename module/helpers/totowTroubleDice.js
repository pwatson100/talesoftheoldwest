export class totowNormalDie extends foundry.dice.terms.Die {
	constructor(termData) {
		termData.faces = 6;
		super(termData);
	}

	/* -------------------------------------------- */

	/** @override */
	static DENOMINATION = 's';

	/** @override */
	get total() {
		return this.results.length;
	}

	/* -------------------------------------------- */

	/** @override */
	getResultLabel(result) {
		return {
			1: '<img src="systems/talesoftheoldwest/ui/DsN/1-normal.webp" />',
			2: '<img src="systems/talesoftheoldwest/ui/DsN/2-normal.webp" />',
			3: '<img src="systems/talesoftheoldwest/ui/DsN/3-normal.webp" />',
			4: '<img src="systems/talesoftheoldwest/ui/DsN/4-normal.webp" />',
			5: '<img src="systems/talesoftheoldwest/ui/DsN/5-normal.webp" />',
			6: '<img src="systems/talesoftheoldwest/ui/DsN/6-normal.webp" />',
		}[result.result];
	}
}
export class totowTroubleDie extends foundry.dice.terms.Die {
	constructor(termData) {
		termData.faces = 6;
		super(termData);
	}

	/* -------------------------------------------- */

	/** @override */
	static DENOMINATION = 't';

	/** @override */
	get total() {
		return this.results.length;
	}

	/* -------------------------------------------- */

	/** @override */
	getResultLabel(result) {
		return {
			1: '<img src="systems/talesoftheoldwest/ui/DsN/trouble-face.webp" />',
			2: '<img src="systems/talesoftheoldwest/ui/DsN/2-face.webp" />',
			3: '<img src="systems/talesoftheoldwest/ui/DsN/3-face.webp" />',
			4: '<img src="systems/talesoftheoldwest/ui/DsN/4-face.webp" />',
			5: '<img src="systems/talesoftheoldwest/ui/DsN/5-face.webp" />',
			6: '<img src="systems/talesoftheoldwest/ui/DsN/6-face.webp" />',
		}[result.result];
	}
}
