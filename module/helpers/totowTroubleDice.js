export class TOTOWTroubleDie extends foundry.dice.terms.Die {
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
			1: '<img src="systems/talesoftheoldwest/ui/DsN/alien-dice-y1.png" />',
			2: '<img src="systems/talesoftheoldwest/ui/DsN/y2.png" />',
			3: '<img src="systems/talesoftheoldwest/ui/DsN/y3.png" />',
			4: '<img src="systems/talesoftheoldwest/ui/DsN/y4.png" />',
			5: '<img src="systems/talesoftheoldwest/ui/DsN/y5.png" />',
			6: '<img src="systems/talesoftheoldwest/ui/DsN/alien-dice-y6.png" />',
		}[result.result];
	}
}
export class TOTOWNormalDie extends foundry.dice.terms.Die {
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
			1: '<img src="systems/talesoftheoldwest/ui/DsN/b1.png" />',
			2: '<img src="systems/talesoftheoldwest/ui/DsN/b2.png" />',
			3: '<img src="systems/talesoftheoldwest/ui/DsN/b3.png" />',
			4: '<img src="systems/talesoftheoldwest/ui/DsN/b4.png" />',
			5: '<img src="systems/talesoftheoldwest/ui/DsN/b5.png" />',
			6: '<img src="systems/talesoftheoldwest/ui/DsN/alien-dice-b6.png" />',
		}[result.result];
	}
}
