import { pushRoll } from './diceroll.mjs';

export class TOTWModifierDialog extends FormApplication {
	constructor(chatMessage, results) {
		super();
		this.chatMessage = chatMessage;
		this.origRollData = results[1];
		this.origRoll = results[0];
	}

	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			classes: ['form'],
			popOut: true,
			template: 'systems/talesoftheoldwest/templates/chat/roll-modifiers.html',
			id: 'TOTOWModifierDialog',
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
		return {
			faith: true,
			itemModifiers: this.itemModifiers,
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
		pushRoll(this.chatMessage, this.origRollData, this.origRoll);
		return;
	}
}

window.TOTWModifierDialog = TOTWModifierDialog;
