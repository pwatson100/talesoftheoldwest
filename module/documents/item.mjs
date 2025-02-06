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
			const content = await renderTemplate('systems/talesoftheoldwest/templates/dialog/fightin-weapon-modifiers.html', { config });
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
			dataset.fightProneMod = parseInt(data.prone || 0);
			dataset.fightAlloutattackMod = parseInt(data.alloutattack || 0);
			dataset.fightCalledstrikeMod = parseInt(data.calledstrike || 0);
			dataset.fightmodifierMod = parseInt(data.modifier);
			dataset.baseMod = parseInt(dataset.mod);

			dataset.mod =
				parseInt(dataset.mod) + parseInt(data.prone || 0) + parseInt(data.alloutattack || 0) + parseInt(data.calledstrike || 0) + parseInt(data.modifier);
			const result = await rollAttrib(dataset, rollData);
			return result;
		}

		async function shootin(dataset, rollData, item) {
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
				let config = CONFIG.TALESOFTHEOLDWEST;
				const content = await renderTemplate('systems/talesoftheoldwest/templates/dialog/ranged-weapon-modifiers.html', { config });
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
				dataset.shootrangeMod = parseInt(data.rangeChoice);
				dataset.shootcalledShotsMod = parseInt(data.calledShots);
				dataset.shootcoverMod = parseInt(data.coverChoice);
				dataset.shootsizeMod = parseInt(data.sizeChoice);
				dataset.shootvisibilityMod = parseInt(data.visibilityChoice);
				dataset.shootmodifierMod = parseInt(data.modifier);
				dataset.baseMod = parseInt(dataset.mod);

				dataset.mod =
					parseInt(dataset.mod) +
					parseInt(data.rangeChoice) +
					parseInt(data.calledShots) +
					parseInt(data.coverChoice) +
					parseInt(data.sizeChoice) +
					parseInt(data.visibilityChoice) +
					parseInt(data.modifier);
				const result = await rollAttrib(dataset, rollData);
				await item.update({ 'system.ammo': item.system.ammo - 1 });
				return result;
			}
		}
	}
}
