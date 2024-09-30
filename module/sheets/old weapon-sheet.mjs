import { onManageActiveEffect, prepareActiveEffectCategories } from '../helpers/effects.mjs';
import { logger } from '../helpers/logger.mjs';
import { getID } from '../helpers/utils.js';

/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
export class TOTOWWeaponSheet extends ItemSheet {
	/** @override */
	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			classes: ['talesoftheoldwest', 'sheet', 'weapon'],
			width: 520,
			height: 480,
			tabs: [
				{
					navSelector: '.sheet-tabs',
					contentSelector: '.sheet-body',
					initial: 'description',
				},
			],
		});
	}

	/** @override */
	get template() {
		const path = 'systems/talesoftheoldwest/templates/item';
		// Return a single sheet for all item types.
		// return `${path}/item-sheet.hbs`;

		// Alternatively, you could use the following return statement to do a
		// unique item sheet by type, like `weapon-sheet.hbs`.
		return `${path}/item-${this.item.type}-sheet.html`;
	}

	/* -------------------------------------------- */

	/** @override */
	getData() {
		// Retrieve base data structure.
		const context = super.getData();

		// Use a safe clone of the item data for further operations.
		const itemData = context.data;

		// Retrieve the roll data for TinyMCE editors.
		context.rollData = this.item.getRollData();

		// Add the item's data to context.data for easier access, as well as flags.
		context.system = itemData.system;
		context.flags = itemData.flags;

		// Prepare active effects for easier access
		context.effects = prepareActiveEffectCategories(this.item.effects);

		context.subtype_list = CONFIG.TALES_OF_THE_OLD_WEST.subtype_list;
		context.action_list = CONFIG.TALES_OF_THE_OLD_WEST.action_list;
		context.range_list = CONFIG.TALES_OF_THE_OLD_WEST.range_list;
		context.item_modifier_list = CONFIG.TALES_OF_THE_OLD_WEST.item_modifier_list;

		logger.debug('Weapon Sheet derived data:', context);

		return context;
	}

	/* -------------------------------------------- */

	/** @override */
	activateListeners(html) {
		super.activateListeners(html);

		// Everything below here is only needed if the sheet is editable
		if (!this.isEditable) return;

		html.find('.add-modifier').click(async (ev) => {
			ev.preventDefault();
			const data = await this.getData();
			const itemModifiers = data.system.itemModifiers || {};
			// To preserve order, make sure the new index is the highest
			const modifierId = Math.max(-1, ...Object.getOwnPropertyNames(itemModifiers)) + 1;
			const update = {};
			// Using a default value of Strength and 1 in order NOT to create an empty modifier.
			update[`system.itemModifiers.${modifierId}`] = {
				name: game.i18n.localize('TALES_OF_THE_OLD_WEST.Attributes.grit'),
				value: '+1',
			};
			await this.item.update(update);
		});

		html.find('.delete-modifier').click(async (ev) => {
			ev.preventDefault();

			const data = await this.getData();
			const itemModifiers = foundry.utils.duplicate(data.system.itemModifiers || {});
			const modifierId = $(ev.currentTarget).data('modifier-id');
			delete itemModifiers[modifierId];
			// Safety cleanup of null modifiers
			for (const key in Object.keys(itemModifiers)) {
				if (!itemModifiers[key]) {
					delete itemModifiers[key];
				}
			}
			// There seems to be some issue replacing an existing object, if we set
			// it to null first it works better.
			await this.item.update({ 'system.itemModifiers': null });
			if (Object.keys(itemModifiers).length > 0) {
				await this.item.update({ 'system.itemModifiers': itemModifiers });
			}
		});
	}
}
