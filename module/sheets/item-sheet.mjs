import { prepareActiveEffectCategories } from '../helpers/effects.mjs';
import { logger } from '../helpers/logger.mjs';

const { api, sheets } = foundry.applications;
// V13
// const DragDrop = foundry.applications.ux.DragDrop;
/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheetV2}
 */
export class totowItemSheet extends api.HandlebarsApplicationMixin(sheets.ItemSheetV2) {
	constructor(options = {}) {
		super(options);
		// TODO V13 not needed
		// 	// this.#dragDrop = this.#createDragDropHandlers();
		this.#dragDrop = this.#createDragDropHandlers();
	}

	/** @override */
	static DEFAULT_OPTIONS = {
		classes: ['talesoftheoldwest', 'item'],

		actions: {
			onEditImage: this._onEditImage,
			viewDoc: this._viewEffect,
			viewFeature: this._viewFeature,
			removeFeature: this._removeWeaponFeature,
			createDoc: this._createEffect,
			deleteDoc: this._deleteEffect,
			addqualitymodifier: this._addqualitymodifier,
			addTalentModifier: this._addTalentModifier,
			addmodifier: this._addmodifier,
			deletemodifier: this._deletemodifier,
		},
		form: {
			submitOnChange: true,
		},
		// Custom property that's merged into `this.options`
		// TODO V13
		// dragDrop: [{ dragSelector: '.draggable', dropSelector: null }],
		dragDrop: [{ dragSelector: '[data-drag]', dropSelector: null }],
	};

	/* -------------------------------------------- */

	/** @override */
	static PARTS = {
		header: {
			template: 'systems/talesoftheoldwest/templates/item/item-header.hbs',
			scrollable: [''],
		},
		tabs: {
			// Foundry-provided generic template
			template: 'templates/generic/tab-navigation.hbs',
			scrollable: [''],
		},
		description: {
			template: 'systems/talesoftheoldwest/templates/item/item-main.hbs',
			scrollable: [''],
		},
		basic: {
			template: 'systems/talesoftheoldwest/templates/item/item-talent-basic.hbs',
			scrollable: [''],
		},
		advanced: {
			template: 'systems/talesoftheoldwest/templates/item/item-talent-advanced.hbs',
			scrollable: [''],
		},
		modifiers: {
			template: 'systems/talesoftheoldwest/templates/item/item-modifiers.hbs',
			scrollable: [''],
		},
		qualities: {
			template: 'systems/talesoftheoldwest/templates/item/item-weapon-qualities.hbs',
			scrollable: [''],
		},
		// amenities: {
		// 	template: 'systems/talesoftheoldwest/templates/item/item-amenities.hbs',
		// },
	};

	/** @override */
	_configureRenderOptions(options) {
		super._configureRenderOptions(options);
		// Not all parts always render
		options.parts = ['header', 'tabs', 'description'];
		// Don't show the other tabs if only limited view
		if (this.document.limited) return;
		// Control which parts show based on document subtype
		switch (this.document.type) {
			case 'talent':
				options.parts.push('basic', 'advanced');
				break;
			case 'item':
			case 'crit':
			case 'animalquality':
				options.parts.push('header', 'tabs', 'description', 'modifiers');
				break;
			case 'weapon':
				options.parts.push('header', 'tabs', 'description', 'qualities');
				break;
			case 'amenities':
				options.parts = ['header', 'tabs', 'description'];
				break;
		}
	}

	/* -------------------------------------------- */

	/** @override */
	async _prepareContext(options) {
		const context = {
			// Validates both permissions and compendium status
			editable: this.isEditable,
			owner: this.document.isOwner,
			limited: this.document.limited,
			isGM: game.user.isGM,
			// Add the item document.
			item: this.item,
			// Adding system and flags for easier access
			system: this.item.system,
			flags: this.item.flags,
			// Adding a pointer to CONFIG.TALESOFTHEOLDWEST
			config: CONFIG.TALESOFTHEOLDWEST,
			// You can factor out context construction to helper functions
			tabs: this._getTabs(options.parts),
			// Necessary for formInput and formFields helpers
			fields: this.document.schema.fields,
			systemFields: this.document.system.schema.fields,
			systemSource: this.item.system._source,
		};
		// debugger;
		switch (this.document.type) {
			case 'talent':
				{
					if (this.document.img == 'icons/svg/item-bag.svg' && this.document.img != this.img) {
						// TODO  find Sutable Talent icon.

						this.document.update({ img: 'systems/talesoftheoldwest/assets/icons/brain.webp' });
					}
				}
				break;
			case 'item':
				{
					if (this.document.img == 'icons/svg/item-bag.svg' && this.document.img != this.img) {
						// TODO  find Sutable default Item icon.

						this.document.update({ img: 'systems/talesoftheoldwest/assets/icons/saddle.webp' });
					}
				}
				break;

			case 'weapon':
				{
					if (this.document.img == 'icons/svg/item-bag.svg' && this.document.img != this.img) {
						// TODO  find Sutable default weapon icon.

						this.document.update({ img: 'systems/talesoftheoldwest/assets/icons/manhattannavy.webp' });
					}
				}
				break;

			case 'crit':
				{
					if (this.document.img == 'icons/svg/item-bag.svg' && this.document.img != this.img) {
						// TODO  find Sutable Critical Injury icon.
						this.document.update({ img: 'systems/talesoftheoldwest/assets/icons/rattler.webp' });
					}
				}
				break;

			case 'animalquality':
				switch (this.document.system.general.subtype) {
					case 'quality':
						{
							if (this.document.img == 'icons/svg/item-bag.svg' && this.document.img != this.img) {
								this.document.update({ img: 'systems/talesoftheoldwest/assets/icons/horse-head.webp' });
							}
						}
						break;
					case 'flaw':
						{
							if (this.document.img == 'icons/svg/item-bag.svg' && this.document.img != this.img) {
								this.document.update({ img: 'systems/talesoftheoldwest/assets/icons/donkey.webp' });
							}
						}
						break;
				}
				break;

			case 'weaponquality':
				switch (this.document.system.feature) {
					case 'quality':
						{
							if (this.document.img == 'icons/svg/item-bag.svg' && this.document.img != this.img) {
								this.document.update({ img: 'systems/talesoftheoldwest/assets/icons/supersonic-bullet.webp' });
							}
						}
						break;
					case 'condition':
						{
							if (this.document.img == 'icons/svg/item-bag.svg' && this.document.img != this.img) {
								this.document.update({ img: 'systems/talesoftheoldwest/assets/icons/broken-arrow.webp' });
							}
						}
						break;
				}
				break;
			case 'amenities':
				switch (this.document.system.subtype) {
					case 'Farming':
						{
							if (this.document.img == 'icons/svg/item-bag.svg' && this.document.img != this.img) {
								this.document.update({ img: 'systems/talesoftheoldwest/assets/icons/plow.webp' });
							}
						}
						break;
					case 'Mercantile':
						{
							if (this.document.img == 'icons/svg/item-bag.svg' && this.document.img != this.img) {
								this.document.update({ img: 'systems/talesoftheoldwest/assets/icons/merchantile.webp' });
							}
						}
						break;
					case 'Natural':
						{
							if (this.document.img == 'icons/svg/item-bag.svg' && this.document.img != this.img) {
								this.document.update({ img: 'systems/talesoftheoldwest/assets/icons/mining.webp' });
							}
						}
						break;
					case 'Law':
						{
							if (this.document.img == 'icons/svg/item-bag.svg' && this.document.img != this.img) {
								this.document.update({ img: 'systems/talesoftheoldwest/assets/icons/book-law.webp' });
							}
						}
						break;
					case 'Civic':
						{
							if (this.document.img == 'icons/svg/item-bag.svg' && this.document.img != this.img) {
								this.document.update({ img: 'systems/talesoftheoldwest/assets/icons/civic.webp' });
							}
						}
						break;
					case 'Welfare':
						{
							if (this.document.img == 'icons/svg/item-bag.svg' && this.document.img != this.img) {
								this.document.update({ img: 'systems/talesoftheoldwest/assets/icons/welfare.webp' });
							}
						}
						break;
				}
				break;

			default:
				break;
		}

		logger.debug('Item Sheet derived data:', context);

		return context;
	}

	/** @override */

	async _preparePartContext(partId, context) {
		switch (partId) {
			case 'talent':
			case 'item':
			case 'weapon':
			case 'crit':
				// Necessary for preserving active tab on re-render
				context.tab = context.tabs[partId];
				break;

			case 'description':
				// case 'amenities':
				// case 'body':
				context.tab = context.tabs[partId];
				// Enrich description info for display
				// Enrichment turns text like `[[/r 1d20]]` into buttons
				if (game.version && foundry.utils.isNewerVersion(game.version, '12.343')) {
					context.enrichedDescription = await foundry.applications.ux.TextEditor.enrichHTML(this.item.system.description, {
						// Whether to show secret blocks in the finished html
						secrets: this.document.isOwner,
						// Data to fill in for inline rolls
						rollData: this.item.getRollData(),
						// Relative UUID resolution
						relativeTo: this.item,
					});
				} else {
					context.enrichedDescription = await TextEditor.enrichHTML(this.item.system.description, {
						// Whether to show secret blocks in the finished html
						secrets: this.document.isOwner,
						// Data to fill in for inline rolls
						rollData: this.item.getRollData(),
						// Relative UUID resolution
						relativeTo: this.item,
					});
				}
				break;
			case 'basic':
				// case 'body':
				context.tab = context.tabs[partId];
				// Enrich description info for display
				// Enrichment turns text like `[[/r 1d20]]` into buttons
				if (game.version && foundry.utils.isNewerVersion(game.version, '12.343')) {
					context.enrichedBasic = await foundry.applications.ux.TextEditor.enrichHTML(this.item.system.basicAction, {
						// Whether to show secret blocks in the finished html
						secrets: this.document.isOwner,
						// Data to fill in for inline rolls
						rollData: this.item.getRollData(),
						// Relative UUID resolution
						relativeTo: this.item,
					});
				} else {
					context.enrichedBasic = await TextEditor.enrichHTML(this.item.system.basicAction, {
						// Whether to show secret blocks in the finished html
						secrets: this.document.isOwner,
						// Data to fill in for inline rolls
						rollData: this.item.getRollData(),
						// Relative UUID resolution
						relativeTo: this.item,
					});
				}
				break;
			case 'advanced':
				// case 'body':
				context.tab = context.tabs[partId];
				// Enrich description info for display
				// Enrichment turns text like `[[/r 1d20]]` into buttons
				if (game.version && foundry.utils.isNewerVersion(game.version, '12.343')) {
					context.enrichedAdvanced = await foundry.applications.ux.TextEditor.enrichHTML(this.item.system.advAction, {
						// Whether to show secret blocks in the finished html
						secrets: this.document.isOwner,
						// Data to fill in for inline rolls
						rollData: this.item.getRollData(),
						// Relative UUID resolution
						relativeTo: this.item,
					});
				} else {
					context.enrichedAdvanced = await TextEditor.enrichHTML(this.item.system.advAction, {
						// Whether to show secret blocks in the finished html
						secrets: this.document.isOwner,
						// Data to fill in for inline rolls
						rollData: this.item.getRollData(),
						// Relative UUID resolution
						relativeTo: this.item,
					});
				}
				break;
			case 'modifiers':
				context.tab = context.tabs[partId];
				// Prepare active effects for easier access
				// context.effects = prepareActiveEffectCategories(this.item.effects);
				break;
			case 'qualities':
				context.tab = context.tabs[partId];
				break;
			// case 'effects':
			// 	context.tab = context.tabs[partId];
			// 	// Prepare active effects for easier access
			// 	context.effects = prepareActiveEffectCategories(this.item.effects);
			// 	break;
		}

		return context;
	}

	/**
	 * Generates the data for the generic tab navigation template
	 * @param {string[]} parts An array of named template parts to render
	 * @returns {Record<string, Partial<ApplicationTab>>}
	 * @protected
	 */
	_getTabs(parts) {
		// If you have sub-tabs this is necessary to change
		const tabGroup = 'primary';
		// Default tab for first time it's rendered this session
		if (!this.tabGroups[tabGroup]) this.tabGroups[tabGroup] = 'description';
		return parts.reduce((tabs, partId) => {
			const tab = {
				cssClass: '',
				group: tabGroup,
				// Matches tab property to
				id: '',
				// FontAwesome Icon, if you so choose
				icon: '',
				// Run through localization
				label: 'TALESOFTHEOLDWEST.Item.Tabs.',
			};
			switch (partId) {
				case 'header':
				case 'tabs':
					return tabs;
				case 'description':
					tab.id = 'description';
					tab.label += 'Description';
					break;
				case 'basic':
					tab.id = 'basic';
					tab.label += 'Basic';
					break;
				case 'advanced':
					tab.id = 'advanced';
					tab.label += 'Advanced';
					break;
				case 'modifiers':
					tab.id = 'modifiers';
					tab.label += 'Modifiers';
					break;
				case 'qualities':
					tab.id = 'qualities';
					tab.label += 'Qualities';
					break;
				// case 'amenities':
				// 	tab.id = 'amenities';
				// 	tab.label += 'Amenities';
				// 	break;
			}
			if (this.tabGroups[tabGroup] === tab.id) tab.cssClass = 'active';
			tabs[partId] = tab;
			return tabs;
		}, {});
	}

	/**
	 * Actions performed after any render of the Application.
	 * Post-render steps are not awaited by the render process.
	 * @param {ApplicationRenderContext} context      Prepared context data
	 * @param {RenderOptions} options                 Provided render options
	 * @protected
	 */
	async _onRender(context, options) {
		// TODO V13 Not needed

		this.#dragDrop.forEach((d) => d.bind(this.element));

		// TODO V13
		// 	await super._onRender(context, options);
		// new DragDrop.implementation({
		// 	dragSelector: '.draggable',
		// 	dropSelector: null,
		// 	permissions: {
		// 		dragstart: this._canDragStart.bind(this),
		// 		drop: this._canDragDrop.bind(this),
		// 	},
		// 	callbacks: {
		// 		dragstart: this._onDragStart.bind(this),
		// 		dragover: this._onDragOver.bind(this),
		// 		drop: this._onDrop.bind(this),
		// 	},
		// }).bind(this.element);

		// You may want to add other special handling here
		// Foundry comes with a large number of utility classes, e.g. SearchFilter
		// That you may want to implement yourself.
		const currency = this.element.querySelectorAll('.currency');
		for (const s of currency) {
			s.addEventListener('change', (event) => {
				console.log(event);
				this._currencyField(event);
			});
		}
	}

	/**************
	 *
	 *   ACTIONS
	 *
	 **************/

	/**
	 * Handle adding a talent/quality modifier.
	 *
	 * @this totowItemSheet
	 * @param {PointerEvent} event   The originating click event
	 * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
	 * @returns {Promise}
	 * @protected
	 */
	static async _addqualitymodifier(event, target) {
		let item = '';
		let actor = '';
		if (target.dataset.isembedded === 'true') {
			actor = game.actors.get(target.dataset.actor);
			item = actor.getEmbeddedDocument('items', target.dataset.origin);
			let myId = target.dataset.origin;
			// console.log('1 its Embedded', actor);
		} else {
			item = game.items.get(target.dataset.origin);
		}

		const itemModifiers = item.system.itemModifiers || {};
		// To preserve order, make sure the new index is the highest
		const modifierId = Math.max(-1, ...Object.getOwnPropertyNames(itemModifiers)) + 1;
		let update = {};
		let update2 = {};
		// Using a default value of Strength and 1 in order NOT to create an empty modifier.
		update[`system.itemModifiers.${modifierId}`] = {
			name: game.i18n.localize('TALESOFTHEOLDWEST.Attributes.grit.lower'),
			value: Number(0),
			state: 'Conditional',
		};

		// await item.update(update).render(true);
		await item.update(update);
	}
	static async _addTalentModifier(event, target) {
		let item = '';
		let actor = '';
		let update = {};
		if (target.dataset.isembedded === 'true') {
			actor = game.actors.get(target.dataset.actor);
			item = actor.getEmbeddedDocument('items', target.dataset.origin);
			let myId = target.dataset.origin;
			// console.log('1 its Embedded', actor);
		} else {
			item = game.items.get(target.dataset.origin);
		}

		const itemModifiers = item.system.itemModifiers || {};
		// To preserve order, make sure the new index is the highest
		const modifierId = Math.max(-1, ...Object.getOwnPropertyNames(itemModifiers)) + 1 || 0;
		if (item.type === 'talent') {
			update[`system.itemModifiers.${modifierId}`] = {
				name: game.i18n.localize('TALESOFTHEOLDWEST.Attributes.grit.lower'),
				value: Number(0),
				state: 'Conditional',
				modtype: target.dataset.modtype,
				name: item.name,
				id: item.id,
				description: item.system.description.replace(/<[^>]*>?/gm, ''),
				basicAction: item.system.basicAction.replace(/<[^>]*>?/gm, ''),
				advAction: item.system.advAction.replace(/<[^>]*>?/gm, ''),
			};
		} else {
			update[`system.itemModifiers.${modifierId}`] = {
				name: game.i18n.localize('TALESOFTHEOLDWEST.Attributes.grit.lower'),
				value: Number(0),
				state: 'Conditional',
				modtype: target.dataset.modtype,
				name: item.name,
				id: item.id,
				description: item.system.description.replace(/<[^>]*>?/gm, ''),
			};
		}

		// await item.update(update).render(true);
		await item.update(update);
	}

	/**
	 * Handle adding a modifier.
	 *
	 * @this totowItemSheet
	 * @param {PointerEvent} event   The originating click event
	 * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
	 * @returns {Promise}
	 * @protected
	 */
	static async _addmodifier(event, target) {
		let item = '';
		let actor = '';
		if (target.dataset.isembedded === 'true') {
			actor = game.actors.get(target.dataset.actor);
			item = actor.getEmbeddedDocument('items', target.dataset.origin);
			let myId = target.dataset.origin;
			console.log('1 its Embedded', actor);
		} else {
			item = game.items.get(target.dataset.origin);
		}
		// const data = await item.getData();
		const itemModifiers = item.system.itemModifiers || {};
		// To preserve order, make sure the new index is the highest
		const modifierId = Math.max(-1, ...Object.getOwnPropertyNames(itemModifiers)) + 1;
		let update = {};
		// Using a default value of Strength and 1 in order NOT to create an empty modifier.
		update[`system.itemModifiers.${modifierId}`] = {
			name: game.i18n.localize('TALESOFTHEOLDWEST.Attributes.grit.lower'),
			value: '1',
		};
		// await item.update(update).render(true);
		await item.update(update);
	}
	/**
	 * Handle deleting a modifier.
	 *
	 * @this totowItemSheet
	 * @param {PointerEvent} event   The originating click event
	 * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
	 * @returns {Promise}
	 * @protected
	 */
	static async _deletemodifier(event, target) {
		let item = '';
		let actor = '';
		if (target.dataset.isembedded === 'true') {
			actor = game.actors.get(target.dataset.actor);
			item = actor.getEmbeddedDocument('items', target.dataset.origin);
			let myId = target.dataset.origin;
			console.log('1 its Embedded', actor);
		} else {
			item = game.items.get(target.dataset.origin);
		}
		// To preserve order, make sure the new index is the highest
		const itemModifiers = foundry.utils.duplicate(item.system.itemModifiers || {});
		const modifierId = target.dataset.modifierId;
		delete itemModifiers[modifierId];
		// Safety cleanup of null modifiers
		for (const key in Object.keys(itemModifiers)) {
			if (!itemModifiers[key]) {
				delete itemModifiers[key];
			}
		}
		// There seems to be some issue replacing an existing object, if we set
		// it to null first it works better.
		await item.update({ 'system.itemModifiers': null });
		if (Object.keys(itemModifiers).length > 0) {
			// await item.update({ 'system.itemModifiers': itemModifiers }).render(true);
			await item.update({ 'system.itemModifiers': itemModifiers });
		}
	}
	/**
	 * Handle changing a Document's image.
	 *
	 * @this totowItemSheet
	 * @param {PointerEvent} event   The originating click event
	 * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
	 * @returns {Promise}
	 * @protected
	 */
	static async _onEditImage(event, target) {
		const attr = target.dataset.edit;
		const current = foundry.utils.getProperty(this.document, attr);
		const { img } = this.document.constructor.getDefaultArtwork?.(this.document.toObject()) ?? {};
		const fp = new FilePicker({
			current,
			type: 'image',
			redirectToRoot: img ? [img] : [],
			callback: (path) => {
				this.document.update({ [attr]: path });
			},
			top: this.position.top + 40,
			left: this.position.left + 10,
		});
		return fp.browse();
	}

	/**
	 * Renders an embedded document's sheet
	 *
	 * @this totowItemSheet
	 * @param {PointerEvent} event   The originating click event
	 * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
	 * @protected
	 */
	static async _viewEffect(event, target) {
		const effect = this._getEffect(target);
		effect.sheet.render(true);
	}

	/**
	 * Handles item deletion
	 *
	 * @this totowItemSheet
	 * @param {PointerEvent} event   The originating click event
	 * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
	 * @protected
	 */
	static async _deleteEffect(event, target) {
		const effect = this._getEffect(target);
		await effect.delete();
	}

	/**
	 * Handle creating a new Owned Item or ActiveEffect for the actor using initial data defined in the HTML dataset
	 *
	 * @this totowItemSheet
	 * @param {PointerEvent} event   The originating click event
	 * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
	 * @private
	 */
	static async _createEffect(event, target) {
		// Retrieve the configured document class for ActiveEffect
		const aeCls = getDocumentClass('ActiveEffect');
		// Prepare the document creation data by initializing it a default name.
		// As of v12, you can define custom Active Effect subtypes just like Item subtypes if you want
		const effectData = {
			name: aeCls.defaultName({
				// defaultName handles an undefined type gracefully
				type: target.dataset.type,
				parent: this.item,
			}),
		};
		// Loop through the dataset and add it to our effectData
		for (const [dataKey, value] of Object.entries(target.dataset)) {
			// These data attributes are reserved for the action handling
			if (['action', 'documentClass'].includes(dataKey)) continue;
			// Nested properties require dot notation in the HTML, e.g. anything with `system`
			// An example exists in spells.hbs, with `data-system.spell-level`
			// which turns into the dataKey 'system.spellLevel'
			foundry.utils.setProperty(effectData, dataKey, value);
		}

		// Finally, create the embedded document!
		await aeCls.create(effectData, { parent: this.item });
	}

	/**
	 * Determines effect parent to pass to helper
	 *
	 * @this totowItemSheet
	 * @param {PointerEvent} event   The originating click event
	 * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
	 * @private
	 */
	static async _toggleEffect(event, target) {
		const effect = this._getEffect(target);
		await effect.update({ disabled: !effect.disabled });
	}

	static async _viewFeature(event, target) {
		const feature = this._getFeature(target);
		feature.sheet.render(true);
	}

	/** Helper Functions */

	/**
	 * Fetches the row with the data for the rendered embedded document
	 *
	 * @param {HTMLElement} target  The element with the action
	 * @returns {HTMLLIElement} The document's row
	 */
	_getEffect(target) {
		const li = target.closest('.effect');
		return this.item.effects.get(li?.dataset?.effectId);
	}

	_getFeature(target) {
		const li = target.closest('.quality');
		return game.items.get(li?.dataset?.itemId);
	}

	/**
	 *
	 * DragDrop
	 *
	 */

	/**
	 * Define whether a user is able to begin a dragstart workflow for a given drag selector
	 * @param {string} selector       The candidate HTML selector for dragging
	 * @returns {boolean}             Can the current user drag this selector?
	 * @protected
	 */
	_canDragStart(selector) {
		// game.user fetches the current user
		return this.isEditable;
	}

	/**
	 * Define whether a user is able to conclude a drag-and-drop workflow for a given drop selector
	 * @param {string} selector       The candidate HTML selector for the drop target
	 * @returns {boolean}             Can the current user drop on this selector?
	 * @protected
	 */
	_canDragDrop(selector) {
		// game.user fetches the current user
		return this.isEditable;
	}

	/**
	 * Callback actions which occur at the beginning of a drag start workflow.
	 * @param {DragEvent} event       The originating DragEvent
	 * @protected
	 */
	_onDragStart(event) {
		const li = event.currentTarget;
		if ('link' in event.target.dataset) return;

		let dragData = null;

		// Active Effect
		if (li.dataset.effectId) {
			const effect = this.item.effects.get(li.dataset.effectId);
			dragData = effect.toDragData();
		}

		if (!dragData) return;

		// Set data transfer
		event.dataTransfer.setData('text/plain', JSON.stringify(dragData));
	}

	/**
	 * Callback actions which occur when a dragged element is over a drop target.
	 * @param {DragEvent} event       The originating DragEvent
	 * @protected
	 */
	_onDragOver(event) {}

	/**
	 * Callback actions which occur when a dragged element is dropped on a target.
	 * @param {DragEvent} event       The originating DragEvent
	 * @protected
	 */
	async _onDrop(event) {
		const data = TextEditor.getDragEventData(event);
		const item = this.item;
		const allowed = Hooks.call('dropItemSheetData', item, this, data);
		if (allowed === false) return;

		// Handle different data types
		switch (data.type) {
			case 'ActiveEffect':
				return this._onDropActiveEffect(event, data);
			case 'Actor':
				return this._onDropActor(event, data);
			case 'Item':
				return this._onDropItem(event, data);
			case 'Folder':
				return this._onDropFolder(event, data);
		}
	}

	/* -------------------------------------------- */

	/**
	 * Handle the dropping of ActiveEffect data onto an Actor Sheet
	 * @param {DragEvent} event                  The concluding DragEvent which contains drop data
	 * @param {object} data                      The data transfer extracted from the event
	 * @returns {Promise<ActiveEffect|boolean>}  The created ActiveEffect object or false if it couldn't be created.
	 * @protected
	 */
	async _onDropActiveEffect(event, data) {
		const aeCls = getDocumentClass('ActiveEffect');
		const effect = await aeCls.fromDropData(data);
		if (!this.item.isOwner || !effect) return false;

		if (this.item.uuid === effect.parent?.uuid) return this._onEffectSort(event, effect);
		return aeCls.create(effect, { parent: this.item });
	}

	/**
	 * Sorts an Active Effect based on its surrounding attributes
	 *
	 * @param {DragEvent} event
	 * @param {ActiveEffect} effect
	 */
	_onEffectSort(event, effect) {
		const effects = this.item.effects;
		const dropTarget = event.target.closest('[data-effect-id]');
		if (!dropTarget) return;
		const target = effects.get(dropTarget.dataset.effectId);

		// Don't sort on yourself
		if (effect.id === target.id) return;

		// Identify sibling items based on adjacent HTML elements
		const siblings = [];
		for (let el of dropTarget.parentElement.children) {
			const siblingId = el.dataset.effectId;
			if (siblingId && siblingId !== effect.id) siblings.push(effects.get(el.dataset.effectId));
		}

		// Perform the sort
		const sortUpdates = SortingHelpers.performIntegerSort(effect, {
			target,
			siblings,
		});
		const updateData = sortUpdates.map((u) => {
			const update = u.update;
			update._id = u.target._id;
			return update;
		});

		// Perform the update
		return this.item.updateEmbeddedDocuments('ActiveEffect', updateData);
	}

	/* -------------------------------------------- */

	/**
	 * Handle dropping of an Actor data onto another Actor sheet
	 * @param {DragEvent} event            The concluding DragEvent which contains drop data
	 * @param {object} data                The data transfer extracted from the event
	 * @returns {Promise<object|boolean>}  A data object which describes the result of the drop, or false if the drop was
	 *                                     not permitted.
	 * @protected
	 */
	async _onDropActor(event, data) {
		if (!this.item.isOwner) return false;
	}

	/* -------------------------------------------- */

	/**
	 * Handle dropping of an item reference or item data onto an Actor Sheet
	 * @param {DragEvent} event            The concluding DragEvent which contains drop data
	 * @param {object} data                The data transfer extracted from the event
	 * @returns {Promise<Item[]|boolean>}  The created or updated Item instances, or false if the drop was not permitted.
	 * @protected
	 */
	async _onDropItem(event, data) {
		if (!this.item.isOwner) return false;
		const dropItem = await Item.implementation.fromDropData(data);
		const targetType = this.item.system.subtype;
		const dropType = dropItem.system.weapontype;
		if (dropItem.type === 'weaponquality') {
			if (targetType === dropType) {
				await this.addWeaponFeature(dropItem, this.item);
				return;
			} else {
				ui.notifications.error(game.i18n.localize(game.i18n.localize('TALESOFTHEOLDWEST.General.noadd')));
				return false;
			}
		} else {
			return false;
		}
	}

	/* ------------------------------------------- */
	/*  Weapon Condition and Quality management    */
	/* ------------------------------------------- */

	/**
	 * @returns {WeaponFeature}
	 */
	async addWeaponFeature(dropItem, target) {
		const system = target.system;
		let weaponFeature = {};
		if (dropItem.system.itemModifiers) {
			weaponFeature = {
				itemModifiers: dropItem.system.itemModifiers,
				id: dropItem.id,
				name: dropItem.name,
				feature: dropItem.system.feature,
				type: dropItem.system.weapontype,
				description: dropItem.system.description.replace(/<[^>]*>?/gm, ''),
				onweapon: dropItem.system.onweapon,
				img: dropItem.img,
			};
		} else {
			weaponFeature = {
				id: dropItem.id,
				name: dropItem.name,
				feature: dropItem.system.feature,
				type: dropItem.system.weapontype,
				description: dropItem.system.description.replace(/<[^>]*>?/gm, ''),
				onweapon: dropItem.system.onweapon,
				img: dropItem.img,
			};
		}
		if (system.featureModifiers.some((o) => o.id === dropItem.id)) {
			let errormessage =
				game.i18n.localize('TALESOFTHEOLDWEST.General.onlyadd') + ' ' + dropItem.name + ' ' + dropItem.system.feature + ' ' + game.i18n.localize('TALESOFTHEOLDWEST.General.once');

			return ui.notifications.error(game.i18n.localize(game.i18n.localize(errormessage)));
		}
		let fkey = system.featureModifiers.push(weaponFeature);
		let update = this.getCWeaponConditionNames(target);

		await target.update({ 'system.featureModifiers': system.featureModifiers, 'system.conditionNames': update });

		for (const ikey in target.system.featureModifiers[fkey - 1].itemModifiers) {
			switch (target.system.featureModifiers[fkey - 1].itemModifiers[ikey].name) {
				case 'attackbonus':
					if (Math.sign(Number(target.system.featureModifiers[fkey - 1].itemModifiers[ikey].value))) {
						await target.update({
							'system.attackbonus': target.system.attackbonus + Number(target.system.featureModifiers[fkey - 1].itemModifiers[ikey].value),
						});
					} else {
						await target.update({
							'system.attackbonus': target.system.attackbonus - Number(target.system.featureModifiers[fkey - 1].itemModifiers[ikey].value),
						});
					}

					break;
				case 'drawbonus':
					if (Math.sign(Number(target.system.featureModifiers[fkey - 1].itemModifiers[ikey].value))) {
						await target.update({
							'system.bonusdraw': target.system.bonusdraw + Number(target.system.featureModifiers[fkey - 1].itemModifiers[ikey].value),
						});
					} else {
						await target.update({
							'system.bonusdraw': target.system.bonusdraw - Number(target.system.featureModifiers[fkey - 1].itemModifiers[ikey].value),
						});
					}
					break;
				case 'damage':
					if (Math.sign(Number(target.system.featureModifiers[fkey - 1].itemModifiers[ikey].value))) {
						await target.update({
							'system.damage': target.system.damage + Number(target.system.featureModifiers[fkey - 1].itemModifiers[ikey].value),
						});
					} else {
						await target.update({
							'system.damage': target.system.damage - Number(target.system.featureModifiers[fkey - 1].itemModifiers[ikey].value),
						});
					}
					break;
				case 'crit':
					if (Math.sign(Number(target.system.featureModifiers[fkey - 1].itemModifiers[ikey].value))) {
						await target.update({
							'system.crit': target.system.crit + Number(target.system.featureModifiers[fkey - 1].itemModifiers[ikey].value),
						});
					} else {
						await target.update({
							'system.crit': target.system.crit - Number(target.system.featureModifiers[fkey - 1].itemModifiers[ikey].value),
						});
					}
					break;
			}
		}
		return weaponFeature;
	}

	/* ------------------------------------------- */

	/**
	 * @return {WeaponFeature[]}
	 */
	static async _removeWeaponFeature(event, target) {
		event.preventDefault();
		const itemData = this.item;
		const elem = target.currentTarget;
		const li = target.closest('.quality');

		let temp = itemData.system.featureModifiers.filter((o) => o.id === li?.dataset?.itemId);

		for (const ikey in temp[0].itemModifiers) {
			switch (temp[0].itemModifiers[ikey].name) {
				case 'attackbonus':
					if (Math.sign(Number(temp[0].itemModifiers[ikey].value))) {
						await itemData.update({
							'system.attackbonus': itemData.system.attackbonus - Number(temp[0].itemModifiers[ikey].value),
						});
					} else {
						await itemData.update({
							'system.attackbonus': itemData.system.attackbonus + Number(temp[0].itemModifiers[ikey].value),
						});
					}
					break;
				case 'drawbonus':
					if (Math.sign(Number(temp[0].itemModifiers[ikey].value))) {
						await itemData.update({
							'system.bonusdraw': itemData.system.bonusdraw - Number(temp[0].itemModifiers[ikey].value),
						});
					} else {
						await itemData.update({
							'system.bonusdraw': itemData.system.bonusdraw + Number(temp[0].itemModifiers[ikey].value),
						});
					}
					break;
				case 'damage':
					if (Math.sign(Number(temp[0].itemModifiers[ikey].value))) {
						await itemData.update({
							'system.damage': itemData.system.damage - Number(temp[0].itemModifiers[ikey].value),
						});
					} else {
						await itemData.update({
							'system.damage': itemData.system.damage + Number(temp[0].itemModifiers[ikey].value),
						});
					}
					break;
				case 'crit':
					if (Math.sign(Number(temp[0].itemModifiers[ikey].value))) {
						await itemData.update({
							'system.crit': itemData.system.crit - Number(temp[0].itemModifiers[ikey].value),
						});
					} else {
						await itemData.update({
							'system.crit': itemData.system.crit + Number(temp[0].itemModifiers[ikey].value),
						});
					}
					break;
			}
		}

		let featureModifiers = itemData.system.featureModifiers.filter((o) => o.id !== li?.dataset?.itemId);
		await itemData.update({ 'system.featureModifiers': featureModifiers });
		let update = this.getCWeaponConditionNames(itemData);
		await itemData.update({ 'system.conditionNames': update });

		return featureModifiers;
	}

	/* ------------------------------------------- */

	/**
	 * @returns {WeaponFeature|undefined}
	 */
	async getWeaponFeature(featureId) {
		return this.system.featureModifiers.find((o) => o.id === featureId);
	}

	/* ------------------------------------------- */

	/**
	 * @returns {Collection<string, Actor>} [id, actor]
	 */
	getCWeaponConditionNames(target) {
		let c = ' ';
		if (target.system.featureModifiers) {
			for (const o of target.system.featureModifiers) {
				c += o.name + ' ';
			}
			return c;
		} else {
			return 'None';
		}
	}

	async getCWeaponConditions() {
		const c = new foundry.utils.Collection();
		for (const o of this.item.system.featureModifiers) {
			c.set(o.name, game.items.get(o.id));
		}
		return c;
	}

	/* -------------------------------------------- */

	/**
	 * Handle dropping of a Folder on an Actor Sheet.
	 * The core sheet currently supports dropping a Folder of Items to create all items as owned items.
	 * @param {DragEvent} event     The concluding DragEvent which contains drop data
	 * @param {object} data         The data transfer extracted from the event
	 * @returns {Promise<Item[]>}
	 * @protected
	 */
	async _onDropFolder(event, data) {
		if (!this.item.isOwner) return [];
	}

	/** The following pieces set up drag handling and are unlikely to need modification  */

	/**
	 * Returns an array of DragDrop instances
	 * @type {DragDrop[]}
	 */
	// TODO V13 Not needed
	get dragDrop() {
		return this.#dragDrop;
	}

	// This is marked as private because there's no real need
	// for subclasses or external hooks to mess with it directly
	// TODO V13 Not needed

	#dragDrop;

	/**
	 * Create drag-and-drop workflow handlers for this Application
	 * @returns {DragDrop[]}     An array of DragDrop handlers
	 * @private
	 */
	// TODO V13 Not needed

	#createDragDropHandlers() {
		return this.options.dragDrop.map((d) => {
			d.permissions = {
				dragstart: this._canDragStart.bind(this),
				drop: this._canDragDrop.bind(this),
			};
			d.callbacks = {
				dragstart: this._onDragStart.bind(this),
				dragover: this._onDragOver.bind(this),
				drop: this._onDrop.bind(this),
			};
			return new DragDrop(d);
		});
	}

	_currencyField(event) {
		event.preventDefault();
		const element = event.currentTarget;
		// format initial value
		onBlur({ target: event.currentTarget });

		function localStringToNumber(s) {
			return Number(String(s).replace(/[^0-9.-]+/g, ''));
		}
		function onBlur(e) {
			let value = localStringToNumber(e.target.value);
			if (game.settings.get('talesoftheoldwest', 'dollar')) e.target.value = value ? Intl.NumberFormat('en-EN', { style: 'currency', currency: 'USD' }).format(value) : '$0.00';
			else e.target.value = value ? Intl.NumberFormat('en-EN', { style: 'decimal', useGrouping: false, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value) : '0.00';
		}
	}
}
