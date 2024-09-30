/**
 * Extend the basic Item with some very simple modifications.
 * @extends {Item}
 */
export class TOTOWItem extends Item {
	/**
	 * Augment the basic Item data model with additional dynamic data.
	 */
	prepareData() {
		// As with the actor class, items are documents that can have their data
		// preparation methods overridden (such as prepareBaseData()).
		super.prepareData();
	}

	/**
	 * Prepare a data object which defines the data schema used by dice roll commands against this Item
	 * @override
	 */
	getRollData() {
		// Starts off by populating the roll data with `this.system`
		const rollData = { ...super.getRollData() };

		// Quit early if there's no parent actor
		if (!this.actor) return rollData;

		// If present, add the actor's roll data
		rollData.actor = this.actor.getRollData();

		return rollData;
	}

	/**
	 * Handle clickable rolls.
	 * @param {Event} event   The originating click event
	 * @private
	 */
	async roll(dataset) {
		const item = this;
		const rollData = this.getRollData();
		let values = '';
		// Initialize chat data.
		const speaker = ChatMessage.getSpeaker({ actor: this.actor });
		const rollMode = game.settings.get('core', 'rollMode');
		const label = `${dataset.label}`;
		switch (dataset.rollType) {
			case 'item':
				console.log('Item Roll', dataset);
				// return item.roll();
				break;
			case 'talent':
				console.log('Talent Roll', dataset);
				return;
				break;
			case 'weapon':
				switch (dataset.subtype) {
					case 'shootin':
						values = rollData.actor.abilities[`${dataset.subtype}`].mod + rollData.attackbonus;
						console.log('Weapon Roll - shootin', dataset, values);
						break;
					case 'fightin':
						values = rollData.actor.abilities[`${dataset.subtype}`].mod + rollData.attackbonus;
						console.log('Weapon Roll - Fightin', dataset, values);
						break;
					default:
						break;
				}

			default:
				break;
		}

		const roll = await this.rollItem(values);

		// If there's no roll data, send a chat message.
		// if (!this.system.rollData) {
		// 	ChatMessage.create({
		// 		speaker: speaker,
		// 		rollMode: rollMode,
		// 		flavor: label,
		// 		content: item.system.description ?? '',
		// 	});
		// }
		// Otherwise, create a roll and send a chat message from it.
		// else {
		// Retrieve roll data.

		// If you need to store the value first, uncomment the next line.
		// const result = await roll.evaluate();
		roll.toMessage({
			speaker: speaker,
			rollMode: rollMode,
			flavor: label,
		});
		return roll;
		// }
	}

	async rollItem(total) {
		let formula = '';
		let roll = '';

		if (total - 5 <= 0) {
			formula = `${total}` + `dt`;
			roll = await Roll.create(`${formula}`).evaluate();
			console.log(roll);
		} else {
			formula = `5dt`;
			const extra = `${total}` - 5;
			const ds = `${extra}` + `ds`;
			roll = await Roll.create(`${formula}` + '+' + `${ds}`).evaluate();
			console.log(roll);
		}
		return roll;
	}
}
