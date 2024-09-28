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

	// async addModifier(item, ev, data) {
	// 	// const data = await item.getData();
	// 	const itemModifiers = data.system.itemModifiers || {};
	// 	// To preserve order, make sure the new index is the highest
	// 	const modifierId = Math.max(-1, ...Object.getOwnPropertyNames(itemModifiers)) + 1;
	// 	const update = {};
	// 	// Using a default value of Strength and 1 in order NOT to create an empty modifier.
	// 	update[`system.itemModifiers.${modifierId}`] = {
	// 		name: game.i18n.localize('TALES_OF_THE_OLD_WEST.Attributes.grit'),
	// 		value: '+1',
	// 	};
	// 	return await item.update(update);
	// }

	// async deleteModifier(item, ev, data, modifierId) {
	// 	// const data = await item.getData();
	// 	const itemModifiers = foundry.utils.duplicate(data.system.itemModifiers || {});
	// 	// const modifierId = $(ev.currentTarget).data('modifier-id');
	// 	delete itemModifiers[modifierId];
	// 	// Safety cleanup of null modifiers
	// 	for (const key in Object.keys(itemModifiers)) {
	// 		if (!itemModifiers[key]) {
	// 			delete itemModifiers[key];
	// 		}
	// 	}
	// 	// There seems to be some issue replacing an existing object, if we set
	// 	// it to null first it works better.
	// 	await item.update({ 'system.itemModifiers': null });
	// 	if (Object.keys(itemModifiers).length > 0) {
	// 		await item.update({ 'system.itemModifiers': itemModifiers });
	// 	}
	// }

	/**
	 * Handle clickable rolls.
	 * @param {Event} event   The originating click event
	 * @private
	 */
	async roll() {
		const item = this;

		// Initialize chat data.
		const speaker = ChatMessage.getSpeaker({ actor: this.actor });
		const rollMode = game.settings.get('core', 'rollMode');
		const label = `[${item.type}] ${item.name}`;

		// If there's no roll data, send a chat message.
		if (!this.system.formula) {
			ChatMessage.create({
				speaker: speaker,
				rollMode: rollMode,
				flavor: label,
				content: item.system.description ?? '',
			});
		}
		// Otherwise, create a roll and send a chat message from it.
		else {
			// Retrieve roll data.
			const rollData = this.getRollData();

			// Invoke the roll and submit it to chat.
			const roll = await Roll.create(rollData.formula, rollData.actor).evaluate();
			// let baseRoll = await Roll.create(d100die).evaluate();

			// If you need to store the value first, uncomment the next line.
			// const result = await roll.evaluate();
			roll.toMessage({
				speaker: speaker,
				rollMode: rollMode,
				flavor: label,
			});
			return roll;
		}
	}
}
