// import { TOTWModifierDialog, TOTWBuyOffDialog } from './chatmodifier.js';
import { TOTWWhichTroubleDialog, TOTWBuyOffDialog } from './chatmodifier.js';

export async function totowDiceListeners(html) {
	html.on('click', '.dice-push', (ev) => {
		let button = $(ev.currentTarget),
			messageId = button.parents('.message').attr('data-message-id'),
			message = game.messages.get(messageId);
		let results = message.getFlag('talesoftheoldwest', 'results');
		if (!results[1].canPush) {
			let errorObj = { error: 'totow.ErrorsAlreadyPushed' };
			return ui.notifications.warn(new Error(game.i18n.localize(errorObj.error)));
		} else {
			return pushRoll(message, results);
		}
	});

	html.on('click', '.buy-off', (ev) => {
		let button = $(ev.currentTarget),
			messageId = button.parents('.message').attr('data-message-id'),
			message = game.messages.get(messageId);
		let results = message.getFlag('talesoftheoldwest', 'results');
		console.log(message);
		new TOTWBuyOffDialog(message, results).render(true);
	});

	html.on('click', '.roll-trouble', (ev) => {
		let button = $(ev.currentTarget),
			messageId = button.parents('.message').attr('data-message-id'),
			message = game.messages.get(messageId);
		let results = message.getFlag('talesoftheoldwest', 'results');

		new TOTWWhichTroubleDialog(results, ev).render(true);
	});
}

export async function rollTrouble(results, ev) {
	let tTable = '';
	let table = '';
	let roll = '';
	const troubleTable = Number(ev.submitter.value);

	let trouble = parseInt(results[1].trouble);

	switch (troubleTable) {
		case 1:
			tTable = `TROUBLE OUTCOME TABLE - CONFLICT / PHYSICAL(` + trouble + `)`;
			table = game.tables.getName(`${tTable}`);
			roll = await new Roll('1d6').evaluate();
			return table.draw({ roll });

		case 2:
			tTable = `TROUBLE OUTCOME TABLE - MENTAL / SOCIAL (` + trouble + `)`;
			table = game.tables.getName(`${tTable}`);
			roll = await new Roll('1d6').evaluate();
			return table.draw({ roll });
	}
	return;
}

export async function pushRoll(chatMessage, origRollData, origRoll) {
	const formula = origRollData[1].troubleRest + `dt` + '+' + origRollData[1].rest + `ds`;
	let roll = await Roll.create(`${formula}`).evaluate();
	let result = await evaluateTOTWRoll(origRollData[1], roll, formula);

	// remove a faith point from the actor
	const myActor = game.actors.get(result.myActor);
	await myActor.update({ 'system.general.faithpoints.value': myActor.system.general.faithpoints.value - 1 });
	const totalRolled = result.troubleSucc + result.trouble + result.troubleRest + result.normalSucc + result.rest <= 0;
	origRollData[1].canPush = false;
	origRollData[1].formula = formula;
	origRollData[1].troubleSucc += result.troubleSucc;
	origRollData[1].trouble += result.trouble;
	origRollData[1].troubleRest = result.troubleRest;
	origRollData[1].normalSucc += result.normalSucc;
	origRollData[1].rest = result.rest;
	origRollData[1].totalSuccess += result.totalSuccess;
	origRollData[1].faithpoints = myActor.system.general.faithpoints.value;
	origRollData[1].successes = totalRolled
		? result.totalSuccess + origRollData[1].totalSuccess === 2
		: result.totalSuccess + origRollData[1].totalSuccess > 0 && result.totalSuccess + origRollData[1].totalSuccess < 3;
	origRollData[1].criticalSuccess = result.totalSuccess + origRollData[1].totalSuccess >= 3;
	origRollData[1].failure = totalRolled ? result.totalSuccess + origRollData[1].totalSuccess < 2 : result.totalSuccess + origRollData[1].totalSuccess === 0;
	origRollData[1].totalRolled = totalRolled;

	let msg = game.messages.get(chatMessage.id);
	await msg.setFlag('talesoftheoldwest', 'results', origRollData);

	await updateChatMessage(chatMessage, result, origRollData);
}

export async function buyOff(chatMessage, origRollData, origRoll, event) {
	const troubleMod = Number(event.submitter.value);

	// remove a faith point from the actor
	const myActor = game.actors.get(origRollData[1].myActor);
	await myActor.update({ 'system.general.faithpoints.value': myActor.system.general.faithpoints.value - troubleMod });

	origRollData[1].trouble -= troubleMod;
	origRollData[1].troubleRest += troubleMod;
	origRollData[1].faithpoints = myActor.system.general.faithpoints.value;

	await updateChatMessage(chatMessage, origRoll, origRollData);
}

async function updateChatMessage(chatMessage, result, newRoleData) {
	return renderTemplate('systems/talesoftheoldwest/templates/chat/roll.hbs', newRoleData[1]).then((html) => {
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

	const totalRolled = troubleSucc + trouble + troubleRest + normalSucc + rest <= 0;
	let evalResult = {
		myActor: dataset.myActor,
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
