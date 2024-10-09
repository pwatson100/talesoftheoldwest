// import { pushRoll, buyOff } from './diceroll.mjs';
import { buyOff } from './diceroll.mjs';

// export class TOTWModifierDialog extends FormApplication {
// 	constructor(chatMessage, results) {
// 		super();
// 		this.chatMessage = chatMessage;
// 		this.origRollData = results;
// 		// this.origRoll = results;
// 	}

// 	static get defaultOptions() {
// 		return foundry.utils.mergeObject(super.defaultOptions, {
// 			classes: ['form'],
// 			popOut: true,
// 			template: 'systems/talesoftheoldwest/templates/chat/roll-modifiers.html',
// 			id: 'TOTOWModifierDialog',
// 			title: game.i18n.localize('TALESOFTHEOLDWEST.ModifierForRoll'),
// 			height: 'auto',
// 			width: 'auto',
// 			minimizable: false,
// 			resizable: true,
// 			closeOnSubmit: true,
// 			submitOnClose: false,
// 			submitOnChange: false,
// 		});
// 	}

// 	getData() {
// 		// Send data to the template
// 		return {
// 			faith: true,
// 			itemModifiers: this.itemModifiers,
// 		};
// 	}

// 	activateListeners(html) {
// 		super.activateListeners(html);
// 	}

// 	async _onChangeInput(event) {
// 		if (event.currentTarget.name.match(/^si_.*$/)) {
// 			this.itemModifiers[event.currentTarget.name].checked = event.currentTarget.checked;
// 		}
// 		this.render();
// 	}

// 	async _updateObject(event, formData) {
// 		pushRoll(this.chatMessage, this.origRollData);
// 		return;
// 	}
// }
export class TOTWBuyOffDialog extends FormApplication {
	constructor(chatMessage, results) {
		super();
		this.chatMessage = chatMessage;
		this.origRollData = results;
		// this.origRoll = results[0];
	}

	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			classes: ['form'],
			popOut: true,
			template: 'systems/talesoftheoldwest/templates/chat/buy-off.html',
			id: 'TOTWBuyOffDialog',
			title: game.i18n.localize('TALESOFTHEOLDWEST.ModifierForRoll'),
			height: 'auto',
			width: 'auto',
			minimizable: false,
			resizable: true,
			closeOnSubmit: true,
			submitOnClose: false,
			submitOnChange: false,
		});
	}

	getData() {
		// Send data to the template
		let messageResultsFlag = this.chatMessage.getFlag('talesoftheoldwest', 'results');
		const myActor = game.actors.get(messageResultsFlag[1].myActor);
		const trouble = this.chatMessage.flags.talesoftheoldwest.results[1].trouble;
		const faith = myActor.system.general.faithpoints.value;
		let maxMod = 0;
		if (trouble >= faith) {
			maxMod = faith;
		} else {
			maxMod = trouble;
		}
		return {
			trouble,
			faith,
			maxMod,
		};
	}

	activateListeners(html) {
		super.activateListeners(html);
	}

	async _onChangeInput(event) {
		if (event.currentTarget.name.match(/^si_.*$/)) {
			this.itemModifiers[event.currentTarget.name].checked = event.currentTarget.checked;
		}
		this.render();
	}

	async _updateObject(event, formData) {
		buyOff(this.chatMessage, this.origRollData, this.origRoll, event);
		return;
	}
}

// window.TOTWModifierDialog = TOTWModifierDialog;
window.TOTWBuyOffDialog = TOTWBuyOffDialog;
