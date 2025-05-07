import { prepareActiveEffectCategories } from '../helpers/effects.mjs';
import { rollAttrib } from '../helpers/diceroll.mjs';
import { logger } from '../helpers/logger.mjs';

const { api, sheets } = foundry.applications;

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheetV2}
 */
export class totowActorSheet extends api.HandlebarsApplicationMixin(sheets.ActorSheetV2) {
	constructor(options = {}) {
		super(options);
		this.#dragDrop = this.#createDragDropHandlers();
	}

	/** @override */
	static DEFAULT_OPTIONS = {
		classes: ['actor', 'talesoftheoldwest'],
		position: {
			width: 950,
			height: 886,
		},
		window: {
			resizable: true,
		},
		actions: {
			onEditImage: this._onEditImage,
			viewDoc: this._viewDoc,
			createDoc: this._createDoc,
			deleteDoc: this._deleteDoc,
			toggleEffect: this._toggleEffect,
			roll: { handler: this._onRoll, buttons: [0, 2] },
			toggleCondition: { handler: this._toggleCondition, buttons: [0, 2] },
			rollCrit: { handler: this._rollCrit, buttons: [0, 2] },
			changeFaith: { handler: this._changeFaith, buttons: [0, 2] },
			changeXp: { handler: this._changeXp, buttons: [0, 2] },
			changeDamage: { handler: this._changeDamage, buttons: [0, 2] },
			storeItem: { handler: this._storeItem, buttons: [0, 2] },
		},
		// Custom property that's merged into `this.options`
		dragDrop: [{ dragSelector: '[data-drag]', dropSelector: null }],
		form: {
			submitOnChange: true,
		},
	};

	/** @override */
	static PARTS = {
		header: {
			template: 'systems/talesoftheoldwest/templates/actor/header.hbs',
		},
		tabs: {
			// Foundry-provided generic template
			template: 'templates/generic/tab-navigation.hbs',
		},
		skills: {
			template: 'systems/talesoftheoldwest/templates/actor/skills.hbs',
		},
		gear: {
			template: 'systems/talesoftheoldwest/templates/actor/parts/actor-items.hbs',
		},
		effects: {
			template: 'systems/talesoftheoldwest/templates/actor/parts/actor-effects.hbs',
		},
		description: {
			template: 'systems/talesoftheoldwest/templates/actor/biography.hbs',
		},
		weapons: {
			template: 'systems/talesoftheoldwest/templates/actor/parts/actor-weapon.hbs',
		},
		talents: {
			template: 'systems/talesoftheoldwest/templates/actor/parts/actor-talent.hbs',
		},
		itemsinline: {
			template: 'systems/talesoftheoldwest/templates/actor/parts/actor-items-inline.hbs',
		},
		qualityoptions: {
			template: 'systems/talesoftheoldwest/templates/actor/parts/quality-options.hbs',
		},
		compadres: {
			template: 'systems/talesoftheoldwest/templates/actor/parts/actor-compadres.hbs',
		},
		compadresweapon: {
			template: 'systems/talesoftheoldwest/templates/actor/parts/compadre-weapon.hbs',
		},
		remuda: {
			template: 'systems/talesoftheoldwest/templates/actor/parts/actor-remuda.hbs',
		},
		horse: {
			template: 'systems/talesoftheoldwest/templates/actor/parts/actor-horse.hbs',
		},
		horsequalityoptions: {
			template: 'systems/talesoftheoldwest/templates/actor/parts/horse-quality-options.hbs',
		},
	};

	/** @override */
	_configureRenderOptions(options) {
		super._configureRenderOptions(options);
		// Not all parts always render
		options.parts = ['header', 'tabs'];
		// Don't show the other tabs if only limited view
		if (this.document.limited) return;
		// Control which parts show based on document subtype
		switch (this.document.type) {
			case 'pc':
				options.parts.push('skills', 'gear', 'compadres', 'remuda', 'description');
				break;
			case 'npc':
				options.parts.push('skills', 'description');
				break;
			case 'animal':
				options.parts.push('skills');
				break;
		}
	}

	/* -------------------------------------------- */

	/** @override */
	async _prepareContext(options) {
		// Output initialization
		const context = {
			// Validates both permissions and compendium status
			editable: this.isEditable,
			owner: this.document.isOwner,
			limited: this.document.limited,
			isGM: game.user.isGM,
			// Add the actor document.
			actor: this.actor,
			// Add the actor's data to context.data for easier access, as well as flags.
			system: this.actor.system,
			flags: this.actor.flags,
			// Adding a pointer to CONFIG.TALESOFTHEOLDWEST
			config: CONFIG.TALESOFTHEOLDWEST,
			tabs: this._getTabs(options.parts),
		};

		// // Offloading context prep to a helper function

		// Prepare character data and items.
		this._prepareItems(context);
		this._prepareCharacterData(context);

		if (context.actor.type === 'pc') {
			this._prepareCompadres(context);
			this._prepareRemuda(context);
		}
		// let enrichedFields = ['system.biography'];
		// await this._enrichTextFields(context, enrichedFields);
		// }

		// context.rollData = context.actor.getRollData();

		logger.debug('Actor Sheet derived data:', context);
		return context;
	}

	/** @override */
	async _preparePartContext(partId, context) {
		switch (partId) {
			case 'skills':
			case 'compadres':
			case 'remuda':
				context.tab = context.tabs[partId];
				context.enrichedBiography = await TextEditor.enrichHTML(this.actor.system.biography, {
					// Whether to show secret blocks in the finished html
					secrets: this.document.isOwner,
					// Data to fill in for inline rolls
					rollData: this.actor.getRollData(),
					// Relative UUID resolution
					relativeTo: this.actor,
				});
				context.enrichedAttacks = await TextEditor.enrichHTML(this.actor.system.general.attacks, {
					// Whether to show secret blocks in the finished html
					secrets: this.document.isOwner,
					// Data to fill in for inline rolls
					rollData: this.actor.getRollData(),
					// Relative UUID resolution
					relativeTo: this.actor,
				});
				break;
			case 'gear':
				context.tab = context.tabs[partId];
				context.enrichedHorseNotes = await TextEditor.enrichHTML(this.actor.system.horse.horseNotes, {
					// Whether to show secret blocks in the finished html
					secrets: this.document.isOwner,
					// Data to fill in for inline rolls
					rollData: this.actor.getRollData(),
					// Relative UUID resolution
					relativeTo: this.actor,
				});
				break;

			case 'description':
				context.tab = context.tabs[partId];
				// Enrich biography info for display
				// Enrichment turns text like `[[/r 1d20]]` into buttons
				context.enrichedBiography = await TextEditor.enrichHTML(this.actor.system.biography, {
					// Whether to show secret blocks in the finished html
					secrets: this.document.isOwner,
					// Data to fill in for inline rolls
					rollData: this.actor.getRollData(),
					// Relative UUID resolution
					relativeTo: this.actor,
				});
				break;
			case 'effects':
				context.tab = context.tabs[partId];
				// Prepare active effects
				context.effects = prepareActiveEffectCategories(
					// A generator that returns all effects stored on the actor
					// as well as any items
					this.actor.allApplicableEffects()
				);
				break;
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
		if (!this.tabGroups[tabGroup]) this.tabGroups[tabGroup] = 'skills';
		return parts.reduce((tabs, partId) => {
			const tab = {
				cssClass: '',
				group: tabGroup,
				// Matches tab property to
				id: '',
				// FontAwesome Icon, if you so choose
				icon: '',
				// Run through localization
				label: 'TALESOFTHEOLDWEST.Actor.Tabs.',
			};
			switch (partId) {
				case 'header':
				case 'tabs':
					return tabs;
				case 'skills':
					tab.id = 'skills';
					tab.label += 'Skills';
					break;
				case 'gear':
					tab.id = 'gear';
					tab.label += 'Gear';
					break;
				case 'compadres':
					tab.id = 'compadres';
					tab.label += 'Compadres';
					break;
				case 'remuda':
					tab.id = 'remuda';
					tab.label += 'Remuda';
					break;
				case 'description':
					tab.id = 'description';
					tab.label += 'Description';
					break;
				case 'effects':
					tab.id = 'effects';
					tab.label += 'Effects';
					break;
			}
			if (this.tabGroups[tabGroup] === tab.id) tab.cssClass = 'active';
			tabs[partId] = tab;
			return tabs;
		}, {});
	}

	/**
	 * Organize and classify Items for Actor sheets.
	 *
	 * @param {object} context The context object to mutate
	 */
	_prepareItems(context) {
		// Initialize containers.
		// You can just use `this.document.itemTypes` instead
		// if you don't need to subdivide a given type like
		// this sheet does with spells
		const gear = [];
		const allGear = [];
		const weapon = [];
		const talent = [];
		const animalquality = [];
		const critInj = [];
		const itemMods = [];

		// Iterate through items, allocating to containers
		for (let i of this.document.items) {
			switch (i.type) {
				case 'item':
					gear.push(i);
					_findmods(i, itemMods);
					break;
				case 'weapon':
					weapon.push(i);
					_findmods(i, itemMods);
					break;
				case 'talent':
					talent.push(i);
					_findmods(i, itemMods);
					break;
				case 'crit':
					critInj.push(i);
					break;
				case 'animalquality':
					animalquality.push(i);
					_findmods(i, itemMods);
					break;

				default:
					break;
			}
			// // and now animal options
			// else if (i.type === 'animalquality') {
			// 	animalquality.push(i);
			// }
			allGear.push(i);
		}

		// Sort then assign
		context.allGear = allGear.sort((a, b) => (a.sort || 0) - (b.sort || 0));
		context.gear = gear.sort((a, b) => (a.sort || 0) - (b.sort || 0));
		context.weapon = weapon.sort((a, b) => (a.sort || 0) - (b.sort || 0));
		context.system.critInj = critInj.sort((a, b) => (a.sort || 0) - (b.sort || 0));
		context.talent = talent.sort((a, b) => (a.sort || 0) - (b.sort || 0));
		context.animalquality = animalquality.sort((a, b) => (a.sort || 0) - (b.sort || 0));
		context.itemMods = Object.groupBy(itemMods, ({ name }) => name);

		async function _findmods(i, itemMods) {
			if (i.system.itemModifiers) {
				for (let [key, mods] of Object.entries(i.system.itemModifiers)) {
					itemMods.push({
						name: mods.name,
						itemname: i.name,
						itemtype: i.type,
						modtype: mods.modtype,
						state: mods.state,
						description: mods.description,
						value: mods.value,
						stored: i.system.stored,
						basicisActive: i.system.basicisActive ? i.system.basicisActive : false,
						advisActive: i.system.advisActive ? i.system.advisActive : false,
						basicAction: i.system.basicAction ? i.system.basicAction : '',
						advAction: i.system.advAction ? i.system.advAction : '',
					});
				}
			}
			if (i.system.featureModifiers) {
				for (let [key, feature] of Object.entries(i.system.featureModifiers)) {
					for (let [key, mods] of Object.entries(feature.itemModifiers)) {
						itemMods.push({
							name: feature.name,
							itemname: i.name,
							itemtype: i.type,
							feature: feature.feature ? feature.feature : false,
							modtype: mods.name,
							state: mods.state,
							description: feature.description,
							value: mods.value,
							stored: i.system.stored,
							basicisActive: i.system.basicisActive ? i.system.basicisActive : false,
							advisActive: i.system.advisActive ? i.system.advisActive : false,
							basicAction: i.system.basicAction ? i.system.basicAction : '',
							advAction: i.system.advAction ? i.system.advAction : '',
						});
					}
				}
			}
			return itemMods;
		}
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
		const aType = context.actor.type;
		const itemData = context.allGear;
		const itemMods = context.itemMods;
		let attribData = {};

		let anyMods = 0;
		var attrMod = {
			grit: 0,
			quick: 0,
			cunning: 0,
			docity: 0,
			hgrit: 0,
			hquick: 0,
			hcunning: 0,
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
			hresilience: 0,
			hfightin: 0,
			hmove: 0,
			hhawkeye: 0,
		};
		if (itemData.length) {
			switch (aType) {
				case 'animal':
					for (let [attrib, modItems] of Object.entries(itemMods)) {
						// if (modItems.type !== 'weapon' && itemMods) {
						for (let [skey, subAttar] of Object.entries(modItems)) {
							switch (subAttar.state) {
								case 'onAnimal':
									switch (attrib) {
										case 'quick':
										case 'cunning':
										case 'grit':
											attrMod[attrib] = attrMod[attrib] += Number(subAttar.value);
											anyMods++;
											break;
										default:
											if (!subAttar.feature) {
												sklMod[attrib] = sklMod[attrib] += Number(subAttar.value);
												anyMods++;
											}
											break;
									}
									break;
								// case 'onPC':
								// 	switch (attrib) {
								// 		case 'quick':
								// 		case 'cunning':
								// 		case 'grit':
								// 			attrMod[attrib] = attrMod[attrib] += Number(subAttar.value);
								// 			anyMods++;
								// 			break;
								// 		default:
								// 			if (!subAttar.feature) {
								// 				sklMod[attrib] = sklMod[attrib] += Number(subAttar.value);
								// 				anyMods++;
								// 			}
								// 			break;
								// 	}
								// 	break;

								default:
									break;
							} //switch (subAttar.state) {
						} // for (let [skey, subAttar] of Object.entries(allItems)) {
						// } // if (allItems.type !== 'weapon' && itemMods) {
					} // for (let [attrib, allItems] of Object.entries(itemMods)) {

					break;

				case 'pc':
					for (let [attrib, modItems] of Object.entries(itemMods)) {
						for (let [skey, subAttar] of Object.entries(modItems)) {
							if (
								(subAttar.state === 'Active' || subAttar.state === 'onPC') &&
								subAttar.itemtype != 'talent' &&
								subAttar.itemtype != 'weapon' &&
								!subAttar.stored
							) {
								switch (attrib) {
									case 'docity':
									case 'quick':
									case 'cunning':
									case 'grit':
										attrMod[attrib] = attrMod[attrib] += Number(subAttar.value);
										anyMods++;
										break;
									default:
										if (!subAttar.feature) {
											sklMod[attrib] = sklMod[attrib] += Number(subAttar.value);
											anyMods++;
										}
										break;
								}
							} else if (
								subAttar.itemtype === 'talent' &&
								((subAttar.modtype === 'basic' && subAttar.basicisActive) || (subAttar.modtype === 'advanced' && subAttar.advisActive)) &&
								subAttar.state === 'Active'
							) {
								switch (attrib) {
									case 'docity':
									case 'quick':
									case 'cunning':
									case 'grit':
										attrMod[attrib] = attrMod[attrib] += Number(subAttar.value);
										anyMods++;
										break;
									default:
										if (!subAttar.feature) {
											sklMod[attrib] = sklMod[attrib] += Number(subAttar.value);
											anyMods++;
										}
										break;
								}
							} else if (subAttar.state === 'onAnimal') {
								let prefix = 'h' + attrib;
								switch (attrib) {
									case 'quick':
									case 'cunning':
									case 'grit':
										attrMod[prefix] = attrMod[prefix] += Number(subAttar.value);
										anyMods++;
										break;
									default:
										if (!subAttar.feature) {
											sklMod[prefix] = sklMod[prefix] += Number(subAttar.value);
											anyMods++;
										}
										break;
								}
							} else if (subAttar.state === 'Active' && subAttar.itemtype === 'weapon' && !subAttar.stored) {
								switch (subAttar.modtype) {
									case 'docity':
									case 'quick':
									case 'cunning':
									case 'grit':
										attrMod[subAttar.modtype] = attrMod[subAttar.modtype] += Number(subAttar.value);
										anyMods++;
										break;
									default:
										sklMod[subAttar.modtype] = sklMod[subAttar.modtype] += Number(subAttar.value);
										anyMods++;
										break;
								}
							}
						}
					} //for (let [attrib, allItems] of Object.entries(itemMods)) {

					break;
			}
		}
		for (let [a, abl] of Object.entries(aData.attributes)) {
			let target = `system.attributes.${a}.mod`;
			let upData = Number(abl.value) + Number(attrMod[a]);
			attribData[target] = upData;
		}

		for (let [s, skl] of Object.entries(aData.abilities)) {
			const conSkl = skl.attr;
			let target = `system.abilities.${s}.mod`;
			let abData = Number(skl.value) + Number(aData.attributes[conSkl].mod) + Number(sklMod[s]);
			attribData[target] = abData;
		}

		if (aType === 'pc') {
			for (let [a, abl] of Object.entries(aData.horse.attributes)) {
				let prefix = 'h' + a;
				let target = `system.horse.attributes.${a}.mod`;
				let upData = Number(abl.value) + Number(attrMod[prefix]);
				attribData[target] = upData;
			}
			for (let [s, skl] of Object.entries(aData.horse.abilities)) {
				let prefix = 'h' + s;
				const conSkl = skl.attr;
				let target = `system.horse.abilities.${s}.mod`;
				let abData = Number(skl.value) + Number(aData.horse.attributes[conSkl].mod) + Number(sklMod[prefix]);
				attribData[target] = abData;
			}
		}
		await this.actor.update(attribData);
	}

	async _prepareCompadres(sheetData) {
		sheetData.compadres = sheetData.actor.system.compadres.details.reduce((arr, o) => {
			o.actor = game.actors.get(o.id);
			// Creates a fake actor if it doesn't exist anymore in the database.
			if (!o.actor) {
				o.actor = {
					name: '{MISSING_CREW}',
					system: { system: { health: { value: 0, max: 0 } } },
					isCrewDeleted: true,
				};
			}
			arr.push(o);
			return arr;
		}, []);
		return sheetData;
	}
	async _prepareRemuda(sheetData) {
		sheetData.remuda = sheetData.actor.system.remuda.details.reduce((arr, o) => {
			o.actor = game.actors.get(o.id);
			// Creates a fake actor if it doesn't exist anymore in the database.
			if (!o.actor) {
				o.actor = {
					name: '{MISSING_CREW}',
					system: { system: { health: { value: 0, max: 0 } } },
					isCrewDeleted: true,
				};
			}
			arr.push(o);
			return arr;
		}, []);
		return sheetData;
	}

	/**
	 * Actions performed after any render of the Application.
	 * Post-render steps are not awaited by the render process.
	 * @param {ApplicationRenderContext} context      Prepared context data
	 * @param {RenderOptions} options                 Provided render options
	 * @protected
	 * @override
	 */
	_onRender(context, options) {
		this.#dragDrop.forEach((d) => d.bind(this.element));
		this.#disableOverrides();
		// You may want to add other special handling here
		// Foundry comes with a large number of utility classes, e.g. SearchFilter
		// That you may want to implement yourself.

		const ammo = document.getElementById('actorWeaponList');
		if (!ammo) return;
		ammo.addEventListener('change', (event) => {
			if (event.target.classList.contains('inline-edit')) {
				this._inlineedit(event);
			}
		});

		const CompEdit = document.getElementById('compadresList');
		if (!CompEdit) return;
		CompEdit.addEventListener('click', (event) => {
			if (event.target.classList.contains('compadre-edit')) {
				this._onCompadresView(event);
			}
		});

		const CompRemove = document.getElementById('compadresList');
		if (!CompRemove) return;
		CompRemove.addEventListener('click', (event) => {
			if (event.target.classList.contains('compadre-remove')) {
				this._onCompadresRemove(event);
			}
		});

		const RemudaEdit = document.getElementById('remudaList');
		if (!RemudaEdit) return;
		RemudaEdit.addEventListener('click', (event) => {
			if (event.target.classList.contains('remuda-edit')) {
				this._onRemudaView(event);
			}
		});

		const RemudaRemove = document.getElementById('remudaList');
		if (!RemudaRemove) return;
		RemudaRemove.addEventListener('click', (event) => {
			if (event.target.classList.contains('remuda-remove')) {
				this._onRemudaRemove(event);
			}
		});

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
	 * Handle changing a Document's image.
	 *
	 * @this totowActorSheet
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
	 * @this totowActorSheet
	 * @param {PointerEvent} event   The originating click event
	 * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
	 * @protected
	 */
	static async _viewDoc(event, target) {
		const doc = this._getEmbeddedDocument(target);
		doc.sheet.render(true);
	}

	/**
	 * Handles item deletion
	 *
	 * @this totowActorSheet
	 * @param {PointerEvent} event   The originating click event
	 * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
	 * @protected
	 */
	static async _deleteDoc(event, target) {
		const doc = this._getEmbeddedDocument(target);
		if (target.dataset.type === 'criticalinj') {
			if ((await this.actor.hasCondition('criticalinj')) && this.actor.system.critInj.length <= 1) {
				await this.actor.removeCondition('criticalinj');
			}
		}
		await doc.delete();
	}

	/**
	 * Handle creating a new Owned Item or ActiveEffect for the actor using initial data defined in the HTML dataset
	 *
	 * @this totowActorSheet
	 * @param {PointerEvent} event   The originating click event
	 * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
	 * @private
	 */
	static async _createDoc(event, target) {
		// Retrieve the configured document class for Item or ActiveEffect
		const docCls = getDocumentClass(target.dataset.documentClass);
		// Prepare the document creation data by initializing it a default name.
		const docData = {
			name: docCls.defaultName({
				// defaultName handles an undefined type gracefully
				type: target.dataset.type,
				parent: this.actor,
			}),
		};
		// Loop through the dataset and add it to our docData
		for (const [dataKey, value] of Object.entries(target.dataset)) {
			// These data attributes are reserved for the action handling
			if (['action', 'documentClass'].includes(dataKey)) continue;
			// Nested properties require dot notation in the HTML, e.g. anything with `system`
			// An example exists in spells.hbs, with `data-system.spell-level`
			// which turns into the dataKey 'system.spellLevel'
			foundry.utils.setProperty(docData, dataKey, value);
		}

		// Finally, create the embedded document!
		await docCls.create(docData, { parent: this.actor });
	}

	/**
	 * Determines effect parent to pass to helper
	 *
	 * @this totowActorSheet
	 * @param {PointerEvent} event   The originating click event
	 * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
	 * @private
	 */
	static async _toggleEffect(event, target) {
		const effect = this._getEmbeddedDocument(target);
		await effect.update({ disabled: !effect.disabled });
	}
	/**
	 * Determines effect parent to pass to helper
	 *
	 * @this totowActorSheet
	 * @param {PointerEvent} event   The originating click event
	 * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
	 * @private
	 */
	static async _toggleCondition(event, target) {
		event.preventDefault(); // Don't open context menu
		event.stopPropagation(); // Don't trigger other events
		if (event.detail > 1) return; // Ignore repeated clicks
		let field = `system.conditions.${target.dataset.key}`;

		if (await this.actor.hasCondition(target.dataset.key)) {
			await this.actor.removeCondition(target.dataset.key);
			await this.actor.update({ [field]: false });
		} else {
			await this.actor.addCondition(target.dataset.key);
			await this.actor.update({ [field]: true });
		}
	}

	/**
	 * Handle clickable rolls.
	 *
	 * @this totowActorSheet
	 * @param {PointerEvent} event   The originating click event
	 * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
	 * @protected
	 */
	static async _onRoll(event, target) {
		event.preventDefault(); // Don't open context menu
		event.stopPropagation(); // Don't trigger other events
		if (event.detail > 1) return; // Ignore repeated clicks
		if (target.dataset.rollType === 'attribute' || target.dataset.rollType === 'ability') {
			if (event.button === 0) {
				this.actor.diceRoll(this.actor, event, target);
			} else {
				this.actor.modRoll(this.actor, event, target);
			}
		} else {
			this.actor.diceRoll(this.actor, event, target);
		}
	}

	static async _rollCrit(event, target) {
		event.preventDefault(); // Don't open context menu
		event.stopPropagation(); // Don't trigger other events
		if (event.detail > 1) return; // Ignore repeated clicks

		const dataset = target.dataset;
		if (event.button === 2) {
			this.actor.rollCritMan(this.actor, this.actor.type, dataset);
		} else {
			this.actor.rollCrit(this.actor, this.actor.type, dataset);
		}
	}

	static async _changeFaith(event, target) {
		event.preventDefault(); // Don't open context menu
		event.stopPropagation(); // Don't trigger other events
		if (event.detail > 1) return; // Ignore repeated clicks
		let faithpoints = this.actor.system.general.faithpoints;
		if (event.button === 2) {
			// left click
			if (faithpoints.value > 0) {
				if (faithpoints.value === 0) {
					return;
				}
				return await this.actor.update({ ['system.general.faithpoints.value']: faithpoints.value - 1 });
			}
		} else {
			// right click
			if (faithpoints.value >= 10) {
				return;
			}
			return await this.actor.update({ ['system.general.faithpoints.value']: faithpoints.value + 1 });
		}
	}
	static async _changeXp(event, target) {
		event.preventDefault(); // Don't open context menu
		event.stopPropagation(); // Don't trigger other events
		if (event.detail > 1) return; // Ignore repeated clicks
		let xp = this.actor.system.general.xp;
		if (event.button === 2) {
			// left click
			if (xp.value > 0) {
				if (xp.value === 0) {
					return;
				}
				return await this.actor.update({ ['system.general.xp.value']: xp.value - 1 });
			}
		} else {
			// right click
			if (xp.value >= 10) {
				return;
			}
			return await this.actor.update({ ['system.general.xp.value']: xp.value + 1 });
		}
	}
	static async _changeDamage(event, target) {
		event.preventDefault(); // Don't open context menu
		event.stopPropagation(); // Don't trigger other events
		if (event.detail > 1) return; // Ignore repeated clicks
		const dataset = target.dataset;
		// const damageType = dataset.label;

		let damage = this.actor.system.damage[target.dataset.label];
		let field = `system.damage.${target.dataset.label}.value`;

		if (event.button === 2) {
			// right click
			if (damage.value) {
				return await this.actor.update({ [field]: damage.value - 1 });
			}
		} else {
			// left click
			if (damage.max) {
				return await this.actor.update({ [field]: damage.value + 1 });
			}
		}
	}

	static async _storeItem(event, target) {
		event.preventDefault(); // Don't open context menu
		event.stopPropagation(); // Don't trigger other events
		if (event.detail > 1) return; // Ignore repeated clicks
		const dataset = target.dataset;
		const li = target.closest('.item');
		// return game.items.get(li?.dataset?.itemId);

		// let itemId = dataset.parentElement.dataset.itemId;
		let item = this.actor.items.get(li?.dataset?.itemId);

		if (event.button === 2) {
			// right click
			return await item.update({ 'system.stored': true });
		} else {
			// left click
			return await item.update({ 'system.stored': false });
		}
	}

	// static async _store(event, target) {
	// 	event.preventDefault(); // Don't open context menu
	// 	event.stopPropagation(); // Don't trigger other events
	// 	if (event.detail > 1) return; // Ignore repeated clicks
	// 	const dataset = target.dataset;
	// 	let itemId = dataset.parentElement.dataset.itemId;
	// 	let item = this.actor.items.get(itemId);
	// 	await item.update({ 'system.header.stored': true });
	// }

	// static async _unstore(event, target) {
	// 	event.preventDefault(); // Don't open context menu
	// 	event.stopPropagation(); // Don't trigger other events
	// 	if (event.detail > 1) return; // Ignore repeated clicks
	// 	const dataset = target.dataset;
	// 	let itemId = dataset.parentElement.dataset.itemId;
	// 	let item = this.actor.items.get(itemId);
	// 	await item.update({ 'system.header.stored': false });
	// }

	/** Helper Functions */

	/**
	 * Fetches the embedded document representing the containing HTML element
	 *
	 * @param {HTMLElement} target    The element subject to search
	 * @returns {Item | ActiveEffect} The embedded Item or ActiveEffect
	 */
	_getEmbeddedDocument(target) {
		const docRow = target.closest('li[data-document-class]');
		if (
			docRow.dataset.documentClass === 'Item' ||
			docRow.dataset.documentClass === 'Talent' ||
			docRow.dataset.documentClass === 'Weapon' ||
			docRow.dataset.documentClass === 'Critical Injury'
		) {
			return this.actor.items.get(docRow.dataset.itemId);
		} else if (docRow.dataset.documentClass === 'ActiveEffect') {
			const parent = docRow.dataset.parentId === this.actor.id ? this.actor : this.actor.items.get(docRow?.dataset.parentId);
			return parent.effects.get(docRow?.dataset.effectId);
		} else return console.warn('Could not find document class');
	}

	async _inlineedit(event) {
		event.preventDefault();
		let itemId = event.target.parentElement.dataset.itemId;
		let item = this.actor.items.get(itemId);
		let temp = event.target.dataset.mod;
		console.log('TOTOWActorSheet -> _inlineedit -> event', event, event.target.dataset.mod);

		return await item.update({ [temp]: event.target.value }, {});
	}
	/***************
	 *
	 * Drag and Drop
	 *
	 ***************/

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
		const docRow = event.currentTarget.closest('li');
		if ('link' in event.target.dataset) return;

		// Chained operation
		let dragData = this._getEmbeddedDocument(docRow)?.toDragData();

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
		const actor = this.actor;
		const allowed = Hooks.call('dropActorSheetData', actor, this, data);
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
		if (!this.actor.isOwner || !effect) return false;
		if (effect.target === this.actor) return this._onSortActiveEffect(event, effect);
		return aeCls.create(effect, { parent: this.actor });
	}

	/**
	 * Handle a drop event for an existing embedded Active Effect to sort that Active Effect relative to its siblings
	 *
	 * @param {DragEvent} event
	 * @param {ActiveEffect} effect
	 */
	async _onSortActiveEffect(event, effect) {
		/** @type {HTMLElement} */
		const dropTarget = event.target.closest('[data-effect-id]');
		if (!dropTarget) return;
		const target = this._getEmbeddedDocument(dropTarget);

		// Don't sort on yourself
		if (effect.uuid === target.uuid) return;

		// Identify sibling items based on adjacent HTML elements
		const siblings = [];
		for (const el of dropTarget.parentElement.children) {
			const siblingId = el.dataset.effectId;
			const parentId = el.dataset.parentId;
			if (siblingId && parentId && (siblingId !== effect.id || parentId !== effect.parent.id)) siblings.push(this._getEmbeddedDocument(el));
		}

		// Perform the sort
		const sortUpdates = SortingHelpers.performIntegerSort(effect, {
			target,
			siblings,
		});

		// Split the updates up by parent document
		const directUpdates = [];

		const grandchildUpdateData = sortUpdates.reduce((items, u) => {
			const parentId = u.target.parent.id;
			const update = { _id: u.target.id, ...u.update };
			if (parentId === this.actor.id) {
				directUpdates.push(update);
				return items;
			}
			if (items[parentId]) items[parentId].push(update);
			else items[parentId] = [update];
			return items;
		}, {});

		// Effects-on-items updates
		for (const [itemId, updates] of Object.entries(grandchildUpdateData)) {
			await this.actor.items.get(itemId).updateEmbeddedDocuments('ActiveEffect', updates);
		}

		// Update on the main actor
		return this.actor.updateEmbeddedDocuments('ActiveEffect', directUpdates);
	}

	/**
	 * Handle dropping of an Actor data onto another Actor sheet
	 * @param {DragEvent} event            The concluding DragEvent which contains drop data
	 * @param {object} data                The data transfer extracted from the event
	 * @returns {Promise<object|boolean>}  A data object which describes the result of the drop, or false if the drop was
	 *                                     not permitted.
	 * @protected
	 */
	async _onDropActor(event, data) {
		if (!this.actor.isOwner) return false;
		let fred = await fromUuid(data.uuid);
		const actor = game.actors.get(fred.id);

		if (actor.type === 'npc') {
			// When dropping an actor on a vehicle sheet.
			// let crew = await fromUuid(data.uuid);
			if (data.type === 'Actor') await this._dropCompadres(actor.id);
		}
		if (actor.type === 'animal' && actor.system.general.subtype === 'horse') {
			// When dropping an actor on a vehicle sheet.
			// let crew = await fromUuid(data.uuid);
			if (data.type === 'Actor') await this._dropRemuda(actor.id);
		}
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
		if (!this.actor.isOwner) return false;
		const item = await Item.implementation.fromDropData(data);

		// Handle item sorting within the same Actor
		if (this.actor.uuid === item.parent?.uuid) return this._onSortItem(event, item);

		// Create the owned item
		return this._onDropItemCreate(item, event);
	}

	/**
	 * Handle dropping of a Folder on an Actor Sheet.
	 * The core sheet currently supports dropping a Folder of Items to create all items as owned items.
	 * @param {DragEvent} event     The concluding DragEvent which contains drop data
	 * @param {object} data         The data transfer extracted from the event
	 * @returns {Promise<Item[]>}
	 * @protected
	 */
	async _onDropFolder(event, data) {
		if (!this.actor.isOwner) return [];
		const folder = await Folder.implementation.fromDropData(data);
		if (folder.type !== 'Item') return [];
		const droppedItemData = await Promise.all(
			folder.contents.map(async (item) => {
				if (!(document instanceof Item)) item = await fromUuid(item.uuid);
				return item;
			})
		);
		return this._onDropItemCreate(droppedItemData, event);
	}

	/**
	 * Handle the final creation of dropped Item data on the Actor.
	 * This method is factored out to allow downstream classes the opportunity to override item creation behavior.
	 * @param {object[]|object} itemData      The item data requested for creation
	 * @param {DragEvent} event               The concluding DragEvent which provided the drop data
	 * @returns {Promise<Item[]>}
	 * @private
	 */
	async _onDropItemCreate(itemData, event) {
		const type = itemData.type;
		const alwaysAllowedItems = CONFIG.TALESOFTHEOLDWEST.physicalItems;
		const allowedItems = {
			pc: ['item', 'weapon', 'talent', 'critical-injury', 'npc', 'animalquality'],
			npc: ['item', 'weapon', 'talent', 'critical-injury'],
			animal: ['item', 'weapon', 'animalquality'],
			// vehicles: ['item', 'weapon', 'armor'],
			// territory: ['planet-system'],
		};
		let allowed = true;
		if (!alwaysAllowedItems.includes(type)) {
			if (!allowedItems[this.actor.type].includes(type)) {
				allowed = false;
			}
		}

		if (!allowed) {
			const msg = game.i18n.format('TALESOFTHEOLDWEST.General.NotifWrongItemType', {
				type: type,
				actor: this.actor.type,
			});
			console.warn(`TOTOW RPG | ${msg}`);
			ui.notifications.warn(msg);
			return false;
		}

		itemData = itemData instanceof Array ? itemData : [itemData];
		return this.actor.createEmbeddedDocuments('Item', itemData);
	}

	/**
	 * Handle a drop event for an existing embedded Item to sort that Item relative to its siblings
	 * @param {Event} event
	 * @param {Item} item
	 * @private
	 */
	_onSortItem(event, item) {
		// Get the drag source and drop target
		const items = this.actor.items;
		const dropTarget = event.target.closest('[data-item-id]');
		if (!dropTarget) return;
		const target = items.get(dropTarget.dataset.itemId);

		// Don't sort on yourself
		if (item.id === target.id) return;

		// Identify sibling items based on adjacent HTML elements
		const siblings = [];
		for (let el of dropTarget.parentElement.children) {
			const siblingId = el.dataset.itemId;
			if (siblingId && siblingId !== item.id) siblings.push(items.get(el.dataset.itemId));
		}

		// Perform the sort
		const sortUpdates = SortingHelpers.performIntegerSort(item, {
			target,
			siblings,
		});
		const updateData = sortUpdates.map((u) => {
			const update = u.update;
			update._id = u.target._id;
			return update;
		});

		// Perform the update
		return this.actor.updateEmbeddedDocuments('Item', updateData);
	}

	/** The following pieces set up drag handling and are unlikely to need modification  */

	/**
	 * Returns an array of DragDrop instances
	 * @type {DragDrop[]}
	 */
	get dragDrop() {
		return this.#dragDrop;
	}

	// This is marked as private because there's no real need
	// for subclasses or external hooks to mess with it directly
	#dragDrop;

	/**
	 * Create drag-and-drop workflow handlers for this Application
	 * @returns {DragDrop[]}     An array of DragDrop handlers
	 * @private
	 */
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

	/********************
	 *
	 * Actor Override Handling
	 *
	 ********************/

	/**
	 * Submit a document update based on the processed form data.
	 * @param {SubmitEvent} event                   The originating form submission event
	 * @param {HTMLFormElement} form                The form element that was submitted
	 * @param {object} submitData                   Processed and validated form data to be used for a document update
	 * @returns {Promise<void>}
	 * @protected
	 * @override
	 */
	async _processSubmitData(event, form, submitData) {
		const overrides = foundry.utils.flattenObject(this.actor.overrides);
		for (let k of Object.keys(overrides)) delete submitData[k];
		await this.document.update(submitData);
	}

	/**
	 * Disables inputs subject to active effects
	 */
	#disableOverrides() {
		const flatOverrides = foundry.utils.flattenObject(this.actor.overrides);
		for (const override of Object.keys(flatOverrides)) {
			const input = this.element.querySelector(`[name="${override}"]`);
			if (input) {
				input.disabled = true;
			}
		}
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
			if (game.settings.get('talesoftheoldwest', 'dollar'))
				e.target.value = value ? Intl.NumberFormat('en-EN', { style: 'currency', currency: 'USD' }).format(value) : '$0.00';
			else
				e.target.value = value
					? Intl.NumberFormat('en-EN', { style: 'decimal', useGrouping: false, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)
					: '0.00';
		}
	}

	async _dropCompadres(actorId) {
		const crew = game.actors.get(actorId);
		const actorData = this.actor;
		if (!crew) return;
		if (crew.type === 'pc') return ui.notifications.info('PC inceptions are not allowed!');
		if (crew.type !== 'npc') return;
		if (actorData.type === 'pc') {
			if (actorData.system.compadres.compadresQty >= 3) {
				return ui.notifications.warn(game.i18n.localize('ALIENRPG.fullCrew'));
			}
			return await actorData.addCompadres(actorId);
		}
	}
	async _onCompadresView(event) {
		event.preventDefault();
		const compId = event.target.closest('.compardre').dataset.compid;
		const actor = game.actors.get(compId);
		return actor.sheet.render(true);
	}

	async _onCompadresRemove(event) {
		event.preventDefault();
		const actorData = this.actor;
		const compId = event.target.closest('.compardre').dataset.compid;
		const details = await this.actor.removeCompadres(compId);
		let compadresNumber = actorData.system.compadres.compadresQty || 0;
		compadresNumber--;
		await actorData.update({ 'system.compadres.compadresQty': compadresNumber });
		return await actorData.update({ 'system.compadres.details': details });
	}

	async _dropRemuda(actorId) {
		const crew = game.actors.get(actorId);
		const actorData = this.actor;
		if (!crew) return;
		if (crew.type === 'pc') return ui.notifications.info('PC inceptions are not allowed!');
		if (crew.type !== 'animal') return;
		if (actorData.type === 'pc') {
			if (actorData.system.remuda.remudaQty >= 3) {
				return ui.notifications.warn(game.i18n.localize('ALIENRPG.fullCrew'));
			}
			return await actorData.addRemuda(actorId);
		}
	}
	async _onRemudaView(event) {
		event.preventDefault();
		const compId = event.target.closest('.remuda').dataset.compid;
		const actor = game.actors.get(compId);
		return actor.sheet.render(true);
	}

	async _onRemudaRemove(event) {
		event.preventDefault();
		const actorData = this.actor;
		const compId = event.target.closest('.remuda').dataset.compid;
		const details = await this.actor.removeRemuda(compId);
		let remudaNumber = actorData.system.remuda.remudaQty || 0;
		remudaNumber--;
		await actorData.update({ 'system.remuda.remudaQty': remudaNumber });
		return await actorData.update({ 'system.remuda.details': details });
	}
}
