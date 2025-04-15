import { TOTWWhichTroubleDialog, TOTWBuyOffDialog } from './chatmodifier.js';
import { prepModOutput } from './utils.mjs';

export async function totowDiceListeners(html) {
	try {
		html.querySelector('.dice-push').addEventListener('click', (ev) => {
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
	} catch (error) {}

	try {
		html.querySelector('.buy-off').addEventListener('click', (ev) => {
			// html.on('click', '.buy-off', (ev) => {
			let button = $(ev.currentTarget),
				messageId = button.parents('.message').attr('data-message-id'),
				message = game.messages.get(messageId);
			let results = message.getFlag('talesoftheoldwest', 'results');
			console.log(message);
			new TOTWBuyOffDialog(message, results).render(true);
		});
	} catch (error) {}

	try {
		html.querySelector('.roll-trouble').addEventListener('click', (ev) => {
			let button = $(ev.currentTarget),
				messageId = button.parents('.message').attr('data-message-id'),
				message = game.messages.get(messageId);
			let results = message.getFlag('talesoftheoldwest', 'results');

			new TOTWWhichTroubleDialog(results, ev).render(true);
		});
	} catch (error) {}
}

export async function rollTrouble(results, ev) {
	let tTable = '';
	let table = '';
	let roll = '';
	const troubleTable = Number(ev.submitter.value);

	let trouble = Number(results[1].trouble);

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

	// remove a faith point from the actor
	const myActor = game.actors.get(origRollData[1].myActor);
	await myActor.update({ 'system.general.faithpoints.value': myActor.system.general.faithpoints.value - 1 });

	origRollData[1].canPush = 'pushed';
	let result = await evaluateTOTWRoll(origRollData[1], roll, formula);

	const totalRolled = result.troubleSucc + result.trouble + result.troubleRest + result.normalSucc + result.rest <= 0;

	origRollData[1].formula = formula;
	origRollData[1].troubleSucc += result.troubleSucc;
	origRollData[1].troubleFive = result.troubleFive;
	origRollData[1].troubleFour = result.troubleFour;
	origRollData[1].troubleThree = result.troubleThree;
	origRollData[1].troubleTwo = result.troubleTwo;
	origRollData[1].trouble += result.trouble;
	origRollData[1].totalTrouble += result.totalTrouble;
	origRollData[1].troubleBlank = 0;
	origRollData[1].troubleRest = result.troubleRest;
	origRollData[1].normalSucc += result.normalSucc;
	origRollData[1].normalFive = result.normalFive;
	origRollData[1].normalFour = result.normalFour;
	origRollData[1].normalThree = result.normalThree;
	origRollData[1].normalTwo = result.normalTwo;
	origRollData[1].normalOne = result.normalOne;
	origRollData[1].rest = result.rest;
	origRollData[1].totalSuccess += result.totalSuccess;
	origRollData[1].faithpoints = myActor.system.general.faithpoints.value;
	origRollData[1].successes = totalRolled
		? result.totalSuccess + origRollData[1].totalSuccess === 2
		: result.totalSuccess + origRollData[1].totalSuccess > 0 && result.totalSuccess + origRollData[1].totalSuccess < 3;
	origRollData[1].criticalSuccess = origRollData[1].totalSuccess >= 3;
	origRollData[1].failure = totalRolled ? result.totalSuccess + origRollData[1].totalSuccess < 2 : result.totalSuccess + origRollData[1].totalSuccess === 0;
	origRollData[1].totalRolled = totalRolled;

	// if (!origRollData[1].faithAdded && origRollData[1].totalSuccess > 2) {
	// 	result = await addFaithPoints(origRollData[1]);
	// }
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
	origRollData[1].troubleBlank += troubleMod;
	origRollData[1].faithpoints = myActor.system.general.faithpoints.value;

	await chatMessage.setFlag('talesoftheoldwest', 'results', origRollData);

	await updateChatMessage(chatMessage, origRoll, origRollData);
}

export async function rollAttrib(dataset, rollData, actor) {
	let formula = '';
	let roll = '';
	let result = '';
	if (dataset.mod - 5 <= 0) {
		formula = parseInt(`${dataset.mod}`) + `dt`;
		roll = await Roll.create(`${formula}`).evaluate();
		result = await evaluateTOTWRoll(dataset, roll, formula, rollData);
	} else {
		let troubleDice = `5dt`;
		const extra = parseInt(`${dataset.mod}`) - 5;
		const formula = troubleDice + '+' + `${extra}` + `ds`;
		roll = await Roll.create(`${formula}`).evaluate();
		result = await evaluateTOTWRoll(dataset, roll, formula, rollData);
	}
	if (result.totalSuccess > 2 && actor.type === 'pc') {
		result = await addFaithPoints(result);
	}
	return [roll, result];
}

export async function addFaithPoints(result) {
	const myActor = game.actors.get(result.myActor);
	if (myActor.system.general.faithpoints.value === 0 && result.totalSuccess > 3) {
		await myActor.update({ 'system.general.faithpoints.value': (myActor.system.general.faithpoints.value += 1) });
		result.faithpoints = 1;
		result.faithAdded = true;
	} else {
		if (myActor.system.general.faithpoints.value > 0 && myActor.system.general.faithpoints.value < 10) {
			await myActor.update({ 'system.general.faithpoints.value': (myActor.system.general.faithpoints.value += 1) });
			result.faithAdded = true;
		}
	}
	return result;
}

export async function evaluateTOTWRoll(dataset, roll, formula, itemData) {
	let troubleSucc = 0; // rolls of 6
	let troubleFive = 0;
	let troubleFour = 0;
	let troubleThree = 0;
	let troubleTwo = 0;
	let trouble = 0; // Rolls of 1
	let troubleRest = 0;
	let normalSucc = 0;
	let normalFive = 0;
	let normalFour = 0;
	let normalThree = 0;
	let normalTwo = 0;
	let normalOne = 0;
	let rest = 0;
	let troubleBlank = 0;
	let totalSuccess = 0;
	let canPush = dataset.canPush;
	let ability = '';
	let stunts = '';
	const tDice = roll.dice[0];

	tDice.results.forEach((r) => {
		switch (r.result) {
			case 6:
				troubleSucc++;
				totalSuccess++;
				break;
			case 5:
				troubleFive++;
				troubleRest++;
				break;
			case 4:
				troubleFour++;
				troubleRest++;

				break;
			case 3:
				troubleThree++;
				troubleRest++;
				break;
			case 2:
				troubleTwo++;
				troubleRest++;
				break;
			case 1:
				trouble++;
				break;
		}
	});
	if (roll.dice.length > 1) {
		const eDice = roll.dice[1];
		eDice.results.forEach((r) => {
			switch (r.result) {
				case 6:
					normalSucc++;
					totalSuccess++;
					break;
				case 5:
					normalFive++;
					rest++;
					break;
				case 4:
					normalFour++;
					rest++;
					break;
				case 3:
					normalThree++;
					rest++;
					break;
				case 2:
					normalTwo++;
					rest++;
					break;
				case 1:
					normalOne++;
					rest++;
					break;
			}
		});
	}

	// This is where the sucess and troupble mods from weapons and talents needs to go.

	const numberOfDice = troubleSucc + trouble + troubleRest + normalSucc + rest;
	const totalRolled = numberOfDice <= 0;
	if (troubleRest + rest + troubleBlank === 0) {
		canPush = 'no';
	} else {
		if (totalSuccess === numberOfDice || trouble === numberOfDice) {
			canPush = 'fullHouse';
		}
	}

	// Attribute = dataset.label;  Do not have stunts
	// Ability = dataset.label;
	// weapon = dataset.ability;

	// Strip out special characters and spaces, convert to lowercase and capitalise the first letter of the String.
	if (canPush != 'pushed') {
		if (dataset.rollType != 'attribute') {
			ability = dataset.stunts
				.replace(/[^A-Z0-9]/gi, '')
				.toLowerCase()
				.replace(/\b[a-z](?=[a-z]{2})/g, function (letter) {
					return letter.toUpperCase();
				});

			stunts = game.i18n.localize('TALESOFTHEOLDWEST.Ability.' + [ability] + '.stunts');
		} else {
			stunts = game.i18n.localize('TALESOFTHEOLDWEST.ItemModifierSelect.none');
		}
	}

	let evalResult = {
		myActor: dataset.myActor,
		itemData: itemData,
		rollType: dataset.rollType,
		formula: roll.formula,
		title: dataset.label,
		troubleSucc: troubleSucc,
		troubleFive: troubleFive,
		troubleFour: troubleFour,
		troubleThree: troubleThree,
		troubleTwo: troubleTwo,
		trouble: trouble,
		troubleRest: troubleRest,
		totalTrouble: trouble,
		normalSucc: normalSucc,
		normalFive: normalFive,
		normalFour: normalFour,
		normalThree: normalThree,
		normalTwo: normalTwo,
		normalOne: normalOne,
		rest: rest,
		totalSuccess: totalSuccess,
		troubleBlank: troubleBlank,
		canPush: canPush,
		faithpoints: parseInt(dataset.faithpoints),
		successes: totalRolled ? totalSuccess === 2 : totalSuccess > 0 && totalSuccess < 3,
		criticalSuccess: totalSuccess >= 3,
		failure: totalRolled ? totalSuccess < 2 : totalSuccess === 0,
		totalRolled: totalRolled,
		oldRoll: roll,
		modifiers: dataset,
		messageNo: 0,
		faithAdded: false,
		ability: ability,
		stunts: stunts,
	};
	console.log('evalResult', evalResult);
	return evalResult;
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
