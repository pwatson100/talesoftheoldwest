import { buyOff, rollTrouble } from './diceroll.mjs';
export class TOTWBuyOffDialog extends FormApplication {
	constructor(chatMessage, results) {
		super();
		this.chatMessage = chatMessage;
		this.origRollData = results;
	}

	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			classes: ['form'],
			popOut: true,
			template: 'systems/talesoftheoldwest/templates/dialog/buy-off.html',
			id: 'TOTWBuyOffDialog',
			title: game.i18n.localize('TALESOFTHEOLDWEST.dialog.Buy-OffTrouble'),
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

export class TOTWWhichTroubleDialog extends FormApplication {
	constructor(results, messageId) {
		super();
		this.origRollData = results;
		this.messageId = messageId;
	}

	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			classes: ['form'],
			popOut: true,
			template: 'systems/talesoftheoldwest/templates/dialog/which-trouble-dialog.html',
			id: 'TOTWWhichTroubleDialog',
			title: game.i18n.localize('TALESOFTHEOLDWEST.dialog.roll-modifiers'),
			height: 'auto',
			width: 'auto',
			minimizable: false,
			resizable: true,
			closeOnSubmit: true,
			submitOnClose: false,
			submitOnChange: false,
		});
	}

	getData() {}

	activateListeners(html) {}

	async _updateObject(event, formData, messageId) {
		return rollTrouble(this.origRollData, event, this.messageId);
	}
}

window.TOTWBuyOffDialog = TOTWBuyOffDialog;
window.TOTWWhichTroubleDialog = TOTWWhichTroubleDialog;
