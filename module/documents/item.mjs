import { TOTWBuyOffDialog } from '../helpers/chatmodifier.mjs';
import { rollAttrib } from '../helpers/diceroll.mjs';
import * as argpUtils from '../helpers/utils.mjs';

/**
 * Extend the basic Item with some very simple modifications.
 * @extends {Item}
 */
export class totowItem extends Item {
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
		// Starts off by populating the roll data with a shallow copy of `this.system`
		const rollData = { ...this.system };

		// Quit early if there's no parent actor
		if (!this.actor) return rollData;

		// If present, add the actor's roll data
		rollData.actor = this.actor.getRollData();
		rollData.actorType = this.actor.type;
		return rollData;
	}
	/**
	 * Handle clickable rolls.
	 * @param {Event} event   The originating click event
	 * @private
	 */
	async roll(dataset, item) {
		const rollData = this.getRollData();
		let qualityMod = 0;
		switch (dataset.rollType) {
			case 'item':
				return console.log('Item Roll', dataset);

			case 'talent':
				console.log('Talent Roll', dataset);
				return;

			case 'weapon':
				if (item.system.featureModifiers.length > 0) {
					for (let [key, feature] of Object.entries(item.system.featureModifiers)) {
						for (let [key, mods] of Object.entries(feature.itemModifiers)) {
							if (mods.state === 'Active') {
								qualityMod = await _switchMods(qualityMod, mods);
							}
						}
					}
				}
				switch (dataset.subtype) {
					// TODO: if item knife or tomahawk check if it's being thrown or used in melee.
					case 'shootin':
						dataset.mod = rollData.actor.abilities[`${dataset.subtype}`].mod + rollData.attackbonus;
						dataset.stunts = dataset.subtype;
						console.log('Weapon Roll - shootin', dataset, dataset.mod);
						return await shootin(dataset, rollData, item);
					case 'fightin':
						dataset.mod = rollData.actor.abilities[`${dataset.subtype}`].mod + rollData.attackbonus;
						dataset.stunts = dataset.subtype;
						console.log('Weapon Roll - Fightin', dataset, dataset.mod);
						return await fightin(dataset, rollData, item);

					default:
						break;
				}

			default:
				break;
		}

		async function _switchMods(qualityMod, mods) {
			switch (mods.name) {
				case 'docity':
				case 'quick':
				case 'cunning':
				case 'grit':
				case 'labor':
				case 'presence':
				case 'fightin':
				case 'resilience':
				case 'move':
				case 'operate':
				case 'shootin':
				case 'lightfingered':
				case 'hawkeye':
				case 'nature':
				case 'insight':
				case 'animalhandlin':
				case 'performin':
				case 'makin':
				case 'doctorin':
				case 'booklearnin':
					// case 'flight':
					qualityMod += Number(mods.value);
					break;
				default:
					break;
			}
			return qualityMod;
		}

		async function fightin(dataset, rollData, item) {
			let config = CONFIG.TALESOFTHEOLDWEST;
			let response = '';
			const actor = game.actors.get(dataset.myActor);
			dataset.conditional = '';
			dataset.talent = '';
			let successMod = 0;
			let troubleMod = 0;
			await argpUtils.prepModOutput('Items', rollData, dataset);
			let content = '';
			if (game.version && foundry.utils.isNewerVersion(game.version, '12.343')) {
				content = await foundry.applications.handlebars.renderTemplate('systems/talesoftheoldwest/templates/dialog/fightin-weapon-modifiers.html', {
					config,
					dataset,
				});
				response = await foundry.applications.api.DialogV2.wait({
					window: { title: 'TALESOFTHEOLDWEST.fightinmodifiers' },
					position: { width: 350 },
					// classes: ["my-special-class"],
					content,
					rejectClose: false,
					buttons: [
						{
							label: 'TALESOFTHEOLDWEST.dialog.roll',
							callback: (event, button) => new FormDataExtended(button.form).object,
						},
						{
							label: 'TALESOFTHEOLDWEST.dialog.cancel',
							action: 'cancel',
						},
					],
				});
			} else {
				// For Foundry versions before 11, use the old renderTemplate method

				content = await renderTemplate('systems/talesoftheoldwest/templates/dialog/fightin-weapon-modifiers.html', {
					config,
					dataset,
				});
				response = await foundry.applications.api.DialogV2.wait({
					window: { title: 'TALESOFTHEOLDWEST.fightinmodifiers' },
					position: { width: 350 },
					// classes: ["my-special-class"],
					content,
					rejectClose: false,
					buttons: [
						{
							label: 'TALESOFTHEOLDWEST.dialog.roll',
							callback: (event, button) => new FormDataExtended(button.form).object,
						},
						{
							label: 'TALESOFTHEOLDWEST.dialog.cancel',
							action: 'cancel',
						},
					],
				});
			}

			if (!response || response === 'cancel') return 'cancelled';

			Object.keys(response).forEach((key) => {
				if (key.startsWith('floop')) {
					response.modifier = Number(response.modifier) + Number(response[key]);
				}
			});

			dataset.successMod = Number(successMod);
			dataset.troubleMod = Number(troubleMod);
			dataset.fightProneMod = Number(response.prone || 0);
			dataset.fightAlloutattackMod = Number(response.alloutattack || 0);
			dataset.fightCalledstrikeMod = Number(response.calledstrike || 0);
			dataset.fightmodifierMod = Number(response.modifier);
			dataset.baseMod = Number(dataset.mod);

			dataset.mod =
				Number(dataset.mod) + Number(response.prone || 0) + Number(response.alloutattack || 0) + Number(response.calledstrike || 0) + Number(response.modifier);
			const result = await rollAttrib(dataset, rollData, actor);
			return result;
		}

		async function shootin(dataset, rollData, item) {
			let config = CONFIG.TALESOFTHEOLDWEST;
			const actor = game.actors.get(dataset.myActor);
			let successMod = 0;
			let troubleMod = 0;
			let content = '';
			let response = '';
			dataset.conditional = '';
			dataset.talent = '';
			if (dataset.itemAmmo <= 0) {
				let actorID = actor.id;
				let chatMessage =
					`<div class="chatBG" + ${actorID} "><span class="warnblink alienchatred"; style="font-weight: bold; font-size: larger">` +
					game.i18n.localize('TALESOFTHEOLDWEST.General.noAmmo') +
					`</span></div>`;
				actor.createChatMessage(chatMessage, actorID);
				return 'cancelled';
			} else {
				// Get and proess Weapon Modifier data
				await argpUtils.prepModOutput('Items', rollData, dataset);
			}

			if (game.version && foundry.utils.isNewerVersion(game.version, '12.343')) {
				content = await foundry.applications.handlebars.renderTemplate('systems/talesoftheoldwest/templates/dialog/ranged-weapon-modifiers.html', {
					config,
					dataset,
				});
				response = await foundry.applications.api.DialogV2.wait({
					window: { title: 'TALESOFTHEOLDWEST.shootinmodifiers' },
					position: { width: 440 },
					content,
					// classes: ["my-special-class"],
					rejectClose: false,
					buttons: [
						{
							label: 'TALESOFTHEOLDWEST.dialog.roll',
							callback: (event, button) => new foundry.applications.ux.FormDataExtended(button.form).object,
						},
						{
							label: 'TALESOFTHEOLDWEST.dialog.cancel',
							action: 'cancel',
						},
					],
				});
			} else {
				// For Foundry versions before 11, use the old renderTemplate method
				content = await renderTemplate('systems/talesoftheoldwest/templates/dialog/ranged-weapon-modifiers.html', {
					config,
					dataset,
				});
				response = await foundry.applications.api.DialogV2.wait({
					window: { title: 'TALESOFTHEOLDWEST.shootinmodifiers' },
					position: { width: 440 },
					content,
					// classes: ["my-special-class"],
					rejectClose: false,
					buttons: [
						{
							label: 'TALESOFTHEOLDWEST.dialog.roll',
							callback: (event, button) => new FormDataExtended(button.form).object,
						},
						{
							label: 'TALESOFTHEOLDWEST.dialog.cancel',
							action: 'cancel',
						},
					],
				});
			}

			if (!response || response === 'cancel') return 'cancelled';
			Object.keys(response).forEach((key) => {
				if (key.startsWith('floop')) {
					response.modifier = parseInt(response.modifier || 0) + parseInt(response[key] || 0);
				}
			});
			dataset.successMod = Number(successMod);
			dataset.troubleMod = Number(troubleMod);
			dataset.shootrangeMod = Number(response.rangeChoice);
			dataset.shootcalledShotsMod = Number(response.calledShots);
			dataset.shootcoverMod = Number(response.coverChoice);
			dataset.shootsizeMod = Number(response.sizeChoice);
			dataset.shootvisibilityMod = Number(response.visibilityChoice);
			dataset.shootmodifierMod = Number(response.modifier);
			dataset.baseMod = Number(dataset.mod);

			dataset.mod =
				Number(dataset.mod) +
				Number(response.rangeChoice) +
				Number(response.calledShots) +
				Number(response.coverChoice) +
				Number(response.sizeChoice) +
				Number(response.visibilityChoice) +
				Number(response.modifier);
			const result = await rollAttrib(dataset, rollData, actor);
			await item.update({ 'system.ammo': item.system.ammo - 1 });
			return result;
		}
	}
}
