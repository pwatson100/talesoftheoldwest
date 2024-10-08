import { TOTWModifierDialog } from './chatmodifier.js';

export async function totowDiceListeners(html) {
	html.on('click', '.dice-push', (ev) => {
		let button = $(ev.currentTarget),
			messageId = button.parents('.message').attr('data-message-id'),
			message = game.messages.get(messageId);
		let results = message.getFlag('talesoftheoldwest', 'results');
		console.log(message);
		let originalRoll = results; // TODO: handle this in a safer manner.

		if (!results[1].canPush) {
			let errorObj = { error: 'totow.ErrorsAlreadyPushed' };
			return ui.notifications.warn(new Error(game.i18n.localize(errorObj.error)));
		} else {
			console.log('Do Ya push Thing', message, results.rollData, originalRoll);
			new TOTWModifierDialog(message, results).render(true);
		}
	});
}

export async function pushRoll(chatMessage, origRollData, origRoll) {
	origRollData.canPush = false;
	// let troubleDice = `5dt`;
	// const extra = parseInt(`${dataset.mod}`) - 5;
	const formula = origRollData.troubleRest + `dt` + '+' + origRollData.rest + `ds`;
	let roll = await Roll.create(`${formula}`).evaluate();
	let result = await evaluateTOTWRoll(origRollData, roll, formula);

	// remove a faith point from the actor
	const myActor = game.actors.get(chatMessage.speaker.actor);
	await myActor.update({ 'system.general.faithpoints.value': myActor.system.general.faithpoints.value - 1 });
	const totalRolled = result.troubleSucc + result.trouble + result.troubleRest + result.normalSucc + result.rest <= 0;

	let newRoleData = {
		results: result,
		canPush: false,
		formula: formula,
		title: origRollData.title,
		troubleSucc: result.troubleSucc + origRollData.troubleSucc,
		trouble: result.trouble + origRollData.trouble,
		troubleRest: result.troubleRest,
		normalSucc: result.normalSucc + origRollData.normalSucc,
		rest: result.rest,
		totalSuccess: result.totalSuccess + origRollData.totalSuccess,
		// canPush: Boolean(resultData.canPush),
		faithpoints: parseInt(origRollData.faithpoints) - 1,
		successes: totalRolled
			? result.totalSuccess + origRollData.totalSuccess === 2
			: result.totalSuccess + origRollData.totalSuccess > 0 && result.totalSuccess + origRollData.totalSuccess < 3,
		criticalSuccess: result.totalSuccess + origRollData.totalSuccess >= 3,
		failure: totalRolled ? result.totalSuccess + origRollData.totalSuccess < 2 : result.totalSuccess + origRollData.totalSuccess === 0,
		totalRolled: totalRolled,
	};
	await updateChatMessage(chatMessage, result, newRoleData);
}

async function updateChatMessage(chatMessage, result, newRoleData) {
	// const totalRolled = resultData.troubleSucc + resultData.trouble + resultData.troubleRest + resultData.normalSucc + resultData.rest <= 0;

	return renderTemplate('systems/talesoftheoldwest/templates/chat/roll.hbs', newRoleData).then((html) => {
		chatMessage['content'] = html;
		return chatMessage
			.update({
				content: html,
				['flags.data']: { results: newRoleData.results },
			})
			.then((newMsg) => {
				ui.chat.updateMessage(newMsg);
			});
	});
}

export async function rollAttrib(dataset) {
	let formula = '';
	let roll = '';
	let result = '';
	if (dataset.mod - 5 <= 0) {
		formula = parseInt(`${dataset.mod}`) + `dt`;
		roll = await Roll.create(`${formula}`).evaluate();
		result = await evaluateTOTWRoll(dataset, roll, formula);
	} else {
		let troubleDice = `5dt`;
		const extra = parseInt(`${dataset.mod}`) - 5;
		const formula = troubleDice + '+' + `${extra}` + `ds`;
		roll = await Roll.create(`${formula}`).evaluate();
		result = await evaluateTOTWRoll(dataset, roll, formula);
	}
	return [roll, result];
}

export async function evaluateTOTWRoll(dataset, roll) {
	let troubleSucc = 0;
	let trouble = 0;
	let troubleRest = 0;
	let normalSucc = 0;
	let rest = 0;
	let totalSuccess = 0;
	let maxRoll = 6;
	let minRoll = 1;
	const tDice = roll.dice[0];
	tDice.results.forEach((r) => {
		switch (r.result) {
			case maxRoll:
				troubleSucc++;
				totalSuccess++;
				break;
			case minRoll:
				trouble++;
				break;
			default:
				troubleRest++;
				break;
		}
	});
	if (roll.dice.length > 1) {
		const eDice = roll.dice[1];
		eDice.results.forEach((r) => {
			switch (r.result) {
				case maxRoll:
					normalSucc++;
					totalSuccess++;
					break;
				default:
					rest++;
					break;
			}
		});
	}

	// let tooltip = await renderTemplate('systems/talesoftheoldwest/templates/chat/dice-results.html', this.getTooltipData(roll, normalSucc));
	const totalRolled = troubleSucc + trouble + troubleRest + normalSucc + rest <= 0;
	let evalResult = {
		formula: roll.formula,
		title: dataset.label,
		troubleSucc: troubleSucc,
		trouble: trouble,
		troubleRest: troubleRest,
		normalSucc: normalSucc,
		rest: rest,
		totalSuccess: totalSuccess,
		canPush: Boolean(dataset.canPush),
		faithpoints: parseInt(dataset.faithpoints),
		successes: totalRolled ? totalSuccess === 2 : totalSuccess > 0 && totalSuccess < 3,
		criticalSuccess: totalSuccess >= 3,
		failure: totalRolled ? totalSuccess < 2 : totalSuccess === 0,
		totalRolled: totalRolled,
		oldRoll: roll,
	};
	console.log('evalResult', evalResult);
	return evalResult;
}
