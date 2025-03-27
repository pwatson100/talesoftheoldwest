import { rollAttrib } from '../helpers/diceroll.mjs';

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

		return rollData;
	}
	/**
	 * Handle clickable rolls.
	 * @param {Event} event   The originating click event
	 * @private
	 */
	async roll(dataset, item) {
		const rollData = this.getRollData();
		switch (dataset.rollType) {
			case 'item':
				return console.log('Item Roll', dataset);

			case 'talent':
				console.log('Talent Roll', dataset);
				return;

			case 'weapon':
				switch (dataset.subtype) {
					case 'shootin':
						dataset.mod = rollData.actor.abilities[`${dataset.subtype}`].mod + rollData.attackbonus;
						dataset.stunts = dataset.subtype;
						console.log('Weapon Roll - shootin', dataset, dataset.mod);
						return await shootin(dataset, rollData, item);
					case 'fightin':
						dataset.mod = rollData.actor.abilities[`${dataset.subtype}`].mod + rollData.attackbonus;
						dataset.stunts = dataset.subtype;
						console.log('Weapon Roll - Fightin', dataset, dataset.mod);
						return await fightin(dataset, rollData);

					default:
						break;
				}

			default:
				break;
		}

		async function fightin(dataset, rollData) {
			let config = CONFIG.TALESOFTHEOLDWEST;
			dataset.conditional = '';
			dataset.talent = '';
			let successMod = 0;
			let troubleMod = 0;
			let fightinMod = 0;

			for (const fkey in rollData.featureModifiers) {
				for (const ikey in rollData.featureModifiers[fkey].itemModifiers) {
					switch (rollData.featureModifiers[fkey].itemModifiers[ikey].state) {
						case 'Active':
							switch (rollData.featureModifiers[fkey].itemModifiers[ikey].name) {
								case 'fightin':
									fightinMod = fightinMod + Number(rollData.featureModifiers[fkey].itemModifiers[ikey].value);
									break;
								case 'success':
									successMod = successMod + Number(rollData.featureModifiers[fkey].itemModifiers[ikey].value);
									break;
								case 'trouble':
									troubleMod = troubleMod + Number(rollData.featureModifiers[fkey].itemModifiers[ikey].value);
									break;
							}
							break;

						case 'Conditional':
							dataset.conditional +=
								'<strong style="color:black">' +
								rollData.featureModifiers[fkey].name +
								'</strong> - ' +
								rollData.featureModifiers[fkey].itemModifiers[ikey].name +
								' - ' +
								rollData.featureModifiers[fkey].itemModifiers[ikey].value +
								' - ' +
								rollData.featureModifiers[fkey].description +
								'<br /><br />';

							break;

						case 'Chat':
							dataset.talent +=
								'<strong style="color:black">' +
								rollData.featureModifiers[fkey].name +
								'</strong> - ' +
								rollData.featureModifiers[fkey].description +
								'<br /><br />';
							break;
					}
				}
			}

			const content = await renderTemplate('systems/talesoftheoldwest/templates/dialog/fightin-weapon-modifiers.html', { config, dataset });
			const data = await foundry.applications.api.DialogV2.wait({
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

			if (!data || data === 'cancel') return 'cancelled';
			dataset.fightinMod = Number(fightinMod);
			dataset.successMod = Number(successMod);
			dataset.troubleMod = Number(troubleMod);
			dataset.fightProneMod = Number(data.prone || 0);
			dataset.fightAlloutattackMod = Number(data.alloutattack || 0);
			dataset.fightCalledstrikeMod = Number(data.calledstrike || 0);
			dataset.fightmodifierMod = Number(data.modifier);
			dataset.baseMod = Number(dataset.mod);

			dataset.mod =
				Number(dataset.mod) +
				Number(data.prone || 0) +
				Number(data.alloutattack || 0) +
				Number(data.calledstrike || 0) +
				Number(data.modifier) +
				Number(dataset.fightinMod || 0);
			const result = await rollAttrib(dataset, rollData);
			return result;
		}

		async function shootin(dataset, rollData, item) {
			let config = CONFIG.TALESOFTHEOLDWEST;
			let shootinMod = 0;
			let successMod = 0;
			let troubleMod = 0;
			dataset.conditional = '';
			dataset.talent = '';
			if (dataset.itemAmmo <= 0) {
				const actor = game.actors.get(dataset.myActor);
				let actorID = actor.id;
				let chatMessage =
					`<div class="chatBG" + ${actorID} "><span class="warnblink alienchatred"; style="font-weight: bold; font-size: larger">` +
					game.i18n.localize('TALESOFTHEOLDWEST.General.noAmmo') +
					`</span></div>`;
				actor.createChatMessage(chatMessage, actorID);
				return 'cancelled';
			} else {
				// Get and proess Weapon Modifier data
				for (const fkey in rollData.featureModifiers) {
					for (const ikey in rollData.featureModifiers[fkey].itemModifiers) {
						switch (rollData.featureModifiers[fkey].itemModifiers[ikey].state) {
							case 'Active':
								switch (rollData.featureModifiers[fkey].itemModifiers[ikey].name) {
									case 'shootin':
										shootinMod = shootinMod + Number(rollData.featureModifiers[fkey].itemModifiers[ikey].value);
										break;
									case 'success':
										successMod = successMod + Number(rollData.featureModifiers[fkey].itemModifiers[ikey].value);
										break;
									case 'trouble':
										troubleMod = troubleMod + Number(rollData.featureModifiers[fkey].itemModifiers[ikey].value);
										break;
								}
								break;

							case 'Conditional':
								dataset.conditional +=
									'<strong style="color:black">' +
									rollData.featureModifiers[fkey].name +
									'</strong> - ' +
									rollData.featureModifiers[fkey].itemModifiers[ikey].name +
									' - ' +
									rollData.featureModifiers[fkey].itemModifiers[ikey].value +
									' - ' +
									rollData.featureModifiers[fkey].description +
									'<br /><br />';

								break;

							case 'Chat':
								dataset.talent +=
									'<strong style="color:black">' +
									rollData.featureModifiers[fkey].name +
									'</strong> - ' +
									rollData.featureModifiers[fkey].description +
									'<br /><br />';
								break;
						}
					}
				}
			}
			const content = await renderTemplate('systems/talesoftheoldwest/templates/dialog/ranged-weapon-modifiers.html', { config, dataset });
			const data = await foundry.applications.api.DialogV2.wait({
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

			if (!data || data === 'cancel') return 'cancelled';
			dataset.shootinMod = Number(shootinMod);
			dataset.successMod = Number(successMod);
			dataset.troubleMod = Number(troubleMod);
			dataset.shootrangeMod = Number(data.rangeChoice);
			dataset.shootcalledShotsMod = Number(data.calledShots);
			dataset.shootcoverMod = Number(data.coverChoice);
			dataset.shootsizeMod = Number(data.sizeChoice);
			dataset.shootvisibilityMod = Number(data.visibilityChoice);
			dataset.shootmodifierMod = Number(data.modifier);
			dataset.baseMod = Number(dataset.mod);

			dataset.mod =
				Number(dataset.mod) +
				Number(data.rangeChoice) +
				Number(data.calledShots) +
				Number(data.coverChoice) +
				Number(data.sizeChoice) +
				Number(data.visibilityChoice) +
				Number(shootinMod) +
				Number(data.modifier);
			const result = await rollAttrib(dataset, rollData);
			await item.update({ 'system.ammo': item.system.ammo - 1 });
			return result;
		}
	}
}
