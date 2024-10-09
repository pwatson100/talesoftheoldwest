import { onManageActiveEffect, prepareActiveEffectCategories } from '../helpers/effects.mjs';
import { rollAttrib } from '../helpers/diceroll.mjs';
import { logger } from '../helpers/logger.mjs';

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class TOTOWActorSheet extends ActorSheet {
	/** @override */
	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			classes: ['talesoftheoldwest', 'sheet', 'actor'],
			width: 600,
			height: 850,
			tabs: [
				{
					navSelector: '.sheet-tabs',
					contentSelector: '.sheet-body',
					initial: 'skills',
				},
			],
		});
	}

	/* -------------------------------------------- */
	async _enrichTextFields(context, fieldNameArr) {
		for (let t = 0; t < fieldNameArr.length; t++) {
			if (foundry.utils.hasProperty(context, fieldNameArr[t])) {
				foundry.utils.setProperty(context, fieldNameArr[t], await TextEditor.enrichHTML(foundry.utils.getProperty(context, fieldNameArr[t]), { async: true }));
			}
		}
	}

	/** @override */
	get template() {
		return `systems/talesoftheoldwest/templates/actor/actor-${this.actor.type}-sheet.html`;
	}

	/* -------------------------------------------- */

	/** @override */
	async getData() {
		// Retrieve the data structure from the base sheet. You can inspect or log
		// the context variable to see the structure, but some key properties for
		// sheets are the actor object, the data object, whether or not it's
		// editable, the items array, and the effects array.
		const context = super.getData();

		// Use a safe clone of the actor data for further operations.
		const actorData = context.data;

		// Add the actor's data to context.data for easier access, as well as flags.
		context.system = actorData.system;
		context.flags = actorData.flags;

		// Prepare character data and items.
		if (actorData.type == 'pc') {
			this._prepareCharacterData(context);
			this._prepareItems(context);
			let enrichedFields = ['system.biography'];
			await this._enrichTextFields(context, enrichedFields);
		}

		// // Prepare NPC data and items.
		// if (actorData.type == 'npc') {
		// 	this._prepareItems(context);
		// 	let enrichedFieldsNPC = ['system.biography'];
		// 	await this._enrichTextFields(data, enrichedFieldsNPC);
		// }

		context.rollData = context.actor.getRollData();

		// Prepare active effects
		context.effects = prepareActiveEffectCategories(
			// A generator that returns all effects stored on the actor
			// as well as any items
			this.actor.allApplicableEffects()
		);

		context.archtype_list = CONFIG.TALESOFTHEOLDWEST.archtype_list;
		context.heritage_list = CONFIG.TALESOFTHEOLDWEST.heritage_list;

		logger.debug('Actor Sheet derived data:', context);

		return context;
	}

	/**
	 * Organize and classify Items for Character sheets.
	 *
	 * @param {Object} actorData The actor to prepare.
	 *
	 * @return {undefined}
	 */
	async _prepareCharacterData(context) {
		const aData = context.system;
		const itemData = context.items;
		let anyMods = 0;
		var attrMod = {
			grit: 0,
			quick: 0,
			cunning: 0,
			docity: 0,
		};
		var sklMod = {
			labor: 0,
			presence: 0,
			fightin: 0,
			resilience: 0,
			move: 0,
			operate: 0,
			shootin: 0,
			lightfingered: 0,
			hawkeye: 0,
			nature: 0,
			insight: 0,
			animalhandlin: 0,
			performin: 0,
			makin: 0,
			doctorin: 0,
			booklearnin: 0,
		};

		for (let [skey, allItems] of Object.entries(itemData)) {
			if (allItems) {
				if (allItems.system.itemModifiers) {
					for (let [key, mods] of Object.entries(allItems.system.itemModifiers)) {
						switch (mods.name) {
							case 'docity':
								attrMod.docity = attrMod.docity += parseInt(mods.value);
								anyMods++;
								break;
							case 'quick':
								attrMod.quick = attrMod.quick += parseInt(mods.value);
								anyMods++;
								break;
							case 'cunning':
								attrMod.cunning = attrMod.cunning += parseInt(mods.value);
								anyMods++;
								break;
							case 'grit':
								attrMod.grit = attrMod.grit += parseInt(mods.value);
								anyMods++;
								break;
							case 'labor':
								sklMod.labor = sklMod.labor += parseInt(mods.value);
								anyMods++;
								break;
							case 'presence':
								sklMod.presence = sklMod.presence += parseInt(mods.value);
								anyMods++;
								break;
							case 'fightin':
								sklMod.fightin = sklMod.fightin += parseInt(mods.value);
								anyMods++;
								break;
							case 'resilience':
								sklMod.resilience = sklMod.resilience += parseInt(mods.value);
								anyMods++;
								break;
							case 'move':
								sklMod.move = sklMod.move += parseInt(mods.value);
								anyMods++;
								break;
							case 'operate':
								sklMod.operate = sklMod.operate += parseInt(mods.value);
								anyMods++;
								break;
							case 'shootin':
								sklMod.shootin = sklMod.shootin += parseInt(mods.value);
								anyMods++;
								break;
							case 'lightfingered':
								sklMod.lightfingered = sklMod.lightfingered += parseInt(mods.value);
								anyMods++;
								break;
							case 'hawkeye':
								sklMod.hawkeye = sklMod.hawkeye += parseInt(mods.value);
								anyMods++;
								break;
							case 'nature':
								sklMod.nature = sklMod.nature += parseInt(mods.value);
								anyMods++;
								break;
							case 'insight':
								sklMod.insight = sklMod.insight += parseInt(mods.value);
								anyMods++;
								break;
							case 'animalhandlin':
								sklMod.animalhandlin = sklMod.animalhandlin += parseInt(mods.value);
								anyMods++;
								break;
							case 'performin':
								sklMod.performin = sklMod.performin += parseInt(mods.value);
								anyMods++;
								break;
							case 'makin':
								sklMod.makin = sklMod.makin += parseInt(mods.value);
								anyMods++;
								break;
							case 'doctorin':
								sklMod.doctorin = sklMod.doctorin += parseInt(mods.value);
								anyMods++;
								break;
							case 'booklearnin':
								sklMod.booklearnin = sklMod.booklearnin += parseInt(mods.value);
								anyMods++;
								break;
							default:
								break;
						}
					}
				}
			}
		}
		if (anyMods > 0) {
			let attribData = {};
			for (let [a, abl] of Object.entries(aData.attributes)) {
				let target = `system.attributes.${a}.mod`;
				// let field = `aData.attributes[${a}].mod`;
				let upData = parseInt(abl.value || 0) + parseInt(attrMod[a] || 0);
				// await this.actor.update({ [target]: (field = upData) });
				attribData[target] = upData;
				// abl.mod = parseInt(abl.value || 0) + parseInt(attrMod[a] || 0);
				console.log('Attribute');
			}

			for (let [s, skl] of Object.entries(aData.abilities)) {
				const conSkl = skl.attr;
				let target = `system.abilities.${s}.mod`;
				// let field = `aData.abilities[${s}].mod`;
				let abData = parseInt(skl.value || 0) + parseInt(aData.attributes[conSkl].mod || 0) + parseInt(sklMod[s] || 0);
				attribData[target] = abData;
				// skl.mod = parseInt(skl.value || 0) + parseInt(sklMod[s] || 0) + parseInt(aData.attributes[conSkl].mod || 0);
				console.log('Ability');
			}

			await this.actor.update(attribData);
			// console.log('🚀 ~ TOTOWActorSheet ~ _prepareCharacterData ~ attrMod:', attrMod);
			// console.log('🚀 ~ TOTOWActorSheet ~ _prepareCharacterData ~ sklMod:', sklMod);
		} else {
			let attribData = {};
			for (let [a, abl] of Object.entries(aData.attributes)) {
				let target = `system.attributes.${a}.mod`;
				let upData = parseInt(abl.value || 0);
				attribData[target] = upData;
				console.log('Attribute');
			}
			for (let [s, skl] of Object.entries(aData.abilities)) {
				const conSkl = skl.attr;
				let target = `system.abilities.${s}.mod`;
				let abData = parseInt(skl.value || 0) + parseInt(aData.attributes[conSkl].mod || 0);
				attribData[target] = abData;
				console.log('Ability');
			}
			await this.actor.update(attribData);
		}
	}

	/**
	 * Organize and classify Items for Character sheets.
	 *
	 * @param {Object} actorData The actor to prepare.
	 *
	 * @return {undefined}
	 */
	_prepareItems(context) {
		// Initialize containers.
		const gear = [];
		const weapon = [];
		const talent = [];

		// Iterate through items, allocating to containers
		for (let i of context.items) {
			i.img = i.img || Item.DEFAULT_ICON;
			// Append to gear.
			switch (i.type) {
				case 'item':
					gear.push(i);
					break;
				case 'weapon':
					weapon.push(i);
					break;
				case 'talent':
					talent.push(i);
					break;

				default:
					break;
			}
		}

		// Assign and return
		context.gear = gear;
		context.weapon = weapon;
		context.talent = talent;
	}

	/* -------------------------------------------- */

	/** @override */
	activateListeners(html) {
		super.activateListeners(html);

		// Render the item sheet for viewing/editing prior to the editable check.
		html.on('click', '.item-edit', (ev) => {
			const li = $(ev.currentTarget).parents('.item');
			const item = this.actor.items.get(li.data('itemId'));
			item.sheet.render(true);
		});

		// -------------------------------------------------------------
		// Everything below here is only needed if the sheet is editable
		if (!this.isEditable) return;

		// Add Inventory Item
		html.on('click', '.item-create', this._onItemCreate.bind(this));

		// Delete Inventory Item
		html.on('click', '.item-delete', (ev) => {
			const li = $(ev.currentTarget).parents('.item');
			const item = this.actor.items.get(li.data('itemId'));
			item.delete();
			li.slideUp(200, () => this.render(false));
		});

		// Active Effect management
		html.on('click', '.effect-control', (ev) => {
			const row = ev.currentTarget.closest('li');
			const document = row.dataset.parentId === this.actor.id ? this.actor : this.actor.items.get(row.dataset.parentId);
			onManageActiveEffect(ev, document);
		});

		// Rollable abilities.
		html.on('click', '.rollable', this._onRoll.bind(this));

		// html.find('.currency').on('change', this._currencyField.bind(this));

		// Drag events for macros.
		if (this.actor.isOwner) {
			let handler = (ev) => this._onDragStart(ev);
			html.find('li.item').each((i, li) => {
				if (li.classList.contains('inventory-header')) return;
				li.setAttribute('draggable', true);
				li.addEventListener('dragstart', handler, false);
			});
		}
	}

	/**
	 * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
	 * @param {Event} event   The originating click event
	 * @private
	 */
	async _onItemCreate(event) {
		event.preventDefault();
		const header = event.currentTarget;
		// Get the type of item to create.
		const type = header.dataset.type;
		// Grab any data associated with this control.
		const data = foundry.utils.duplicate(header.dataset);
		// Initialize a default name.
		const name = `New ${type.capitalize()}`;
		// Prepare the item object.
		const itemData = {
			name: name,
			type: type,
			system: data,
		};
		// Remove the type from the dataset since it's in the itemData.type prop.
		delete itemData.system['type'];

		// Finally, create the item!
		return await Item.create(itemData, { parent: this.actor });
	}

	/**
	 * Handle clickable rolls.
	 * @param {Event} event   The originating click event
	 * @private
	 */
	async _onRoll(event) {
		event.preventDefault();
		const element = event.currentTarget;
		const dataset = element.dataset;
		// const targetActor = this.actor.getRollData();
		dataset.faithpoints = this.actor.system.general.faithpoints.value;
		dataset.canPush = this.actor.system.general.canPush;
		dataset.myActor = this.actor.id;
		let result = '';

		// Handle item rolls.
		if (dataset.rollType) {
			if (dataset.rollType === 'attribute' || dataset.rollType === 'ability') {
				switch (dataset.rollType) {
					case 'attribute':
						// console.log('Attribute Roll', dataset);
						result = await rollAttrib(dataset);
						break;

					case 'ability':
						// console.log('Ability Roll', dataset);
						result = await rollAttrib(dataset);
						break;

					default:
						break;
				}
			} else {
				const itemId = element.closest('.item').dataset.itemId;
				const item = this.actor.items.get(itemId);
				switch (dataset.rollType) {
					case 'item':
						console.log('Item Roll', dataset);
						return item.roll(dataset);
						break;
					case 'talent':
						console.log('Talent Roll', dataset);
						return item.roll(dataset);
						break;
					case 'weapon':
						console.log('Weapon Roll', dataset);
						return item.roll(dataset);
						break;

					default:
						break;
				}
			}

			const html = await renderTemplate('systems/talesoftheoldwest/templates/chat/roll.hbs', result[1]);
			let chatData = {
				user: game.user.id,
				speaker: ChatMessage.getSpeaker({
					alias: this.actor.name,
					actor: this.actor.id,
				}),
				// type: CONST.CHAT_MESSAGE_TYPES.ROLL,
				// roll: JSON.stringify(createRollData(baseRoll)),
				roll: result[0],
				rollMode: game.settings.get('core', 'rollMode'),
				content: html,
			};
			if (['gmroll', 'blindroll'].includes(chatData.rollMode)) {
				chatData.whisper = ChatMessage.getWhisperRecipients('GM');
			} else if (chatData.rollMode === 'selfroll') {
				chatData.whisper = [game.user];
			}
			const msg = await ChatMessage.create(chatData);
			await msg.setFlag('talesoftheoldwest', 'results', result);

			return result;
		}
	}
}
