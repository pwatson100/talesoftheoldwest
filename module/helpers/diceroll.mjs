import { TOTWWhichTroubleDialog, TOTWBuyOffDialog } from './chatmodifier.js';
import { prepModOutput } from './utils.mjs';

export async function totowDiceButtons(html) {
	let messageId = html.getAttribute('data-message-id');
	let message = game.messages.get(messageId);

	let buttonArea = html.querySelector('#buttonlist');

	if (message) {
		let results = message.getFlag('talesoftheoldwest', 'results');
		if (results) {
			if (results[1].faithpoints >= 1) {
				if ((results[1].trouble > 0 && results[1].buyoff) || (results[1].trouble > 0 && results[1].canPush !== 'pushed')) {
					let button = document.createElement('button');
					button.classList.add('dice-formula', 'dice-roll', 'chat-buttons', 'buy-off');
					button.setAttribute('data-message-id', messageId);
					button.setAttribute('data-roll-type', results[1].rollType);
					button.setAttribute('data-roll-button', 'buy-off');
					button.innerHTML = game.i18n.localize('TALESOFTHEOLDWEST.dialog.Buy-OffTrouble');
					buttonArea.appendChild(button);
				}
				if (results[1].trouble > 0 && results[1].totalTrouble !== 'rolledTrouble') {
					let button = document.createElement('button');
					button.classList.add('dice-formula', 'dice-roll', 'chat-buttons', 'roll-trouble');
					button.setAttribute('data-message-id', messageId);
					button.setAttribute('data-roll-type', results[1].rollType);
					button.setAttribute('data-roll-button', 'roll-trouble');
					button.innerHTML = game.i18n.localize('TALESOFTHEOLDWEST.General.rollTrouble');
					buttonArea.appendChild(button);
				}
				if (results[1].canPush === 'push' && results[1].totalTrouble !== 'rolledTrouble') {
					let button = document.createElement('button');
					button.classList.add('dice-formula', 'dice-roll', 'chat-buttons', 'dice-push');
					button.setAttribute('data-message-id', messageId);
					button.setAttribute('data-roll-type', results[1].rollType);
					button.setAttribute('data-roll-button', 'push');
					button.innerHTML = game.i18n.localize('TALESOFTHEOLDWEST.General.push');
					buttonArea.appendChild(button);
				}

				if (results[1].canPush === 'pushed' && results[1].totalTrouble !== 'rolledTrouble') {
					let span = document.createElement('span');
					span.classList.add('dice-formula', 'dice-roll', 'pushed-button');
					span.setAttribute('data-message-id', messageId);
					span.setAttribute('data-roll-type', results[1].rollType);
					span.setAttribute('data-roll-button', 'pushed');
					span.innerHTML = game.i18n.localize('TALESOFTHEOLDWEST.General.pushed');
					buttonArea.appendChild(span);
				}
			} else {
				if (results[1].faithpoints === 0) {
					let span = document.createElement('span');
					span.classList.add('dice-formula', 'dice-roll', 'pushed-button');
					span.setAttribute('data-message-id', messageId);
					span.setAttribute('data-roll-type', results[1].rollType);
					span.setAttribute('data-roll-button', 'no-faith');
					span.innerHTML = game.i18n.localize('TALESOFTHEOLDWEST.General.lackFaith');
					buttonArea.appendChild(span);
				}
			}
		}
	}
}
export async function totowDiceListeners(html) {
	// let listenArea = document.getElementById('chat-notifications'); // V13 ?
	let listenArea = document.getElementById('chat-log');
	if (!listenArea) return;

	listenArea.addEventListener('click', (ev) => {
		switch (ev.target.getAttribute('data-roll-button')) {
			case 'push': {
				ev.preventDefault();
				ev.stopPropagation();
				let message = game.messages.get(ev.target.getAttribute('data-message-id'));
				let results = message.getFlag('talesoftheoldwest', 'results');
				if (!results[1].canPush) {
					let errorObj = { error: 'totow.ErrorsAlreadyPushed' };
					return ui.notifications.warn(new Error(game.i18n.localize(errorObj.error)));
				} else {
					return pushRoll(message, results);
				}
			}
			case 'buy-off':
				{
					ev.preventDefault();
					ev.stopPropagation();
					let message = game.messages.get(ev.target.getAttribute('data-message-id'));
					let results = message.getFlag('talesoftheoldwest', 'results');
					new TOTWBuyOffDialog(message, results).render(true);
				}
				break;

			case 'roll-trouble':
				{
					ev.preventDefault();
					ev.stopPropagation();
					let messageId = ev.target.getAttribute('data-message-id');
					let message = game.messages.get(messageId);
					let results = message.getFlag('talesoftheoldwest', 'results');
					new TOTWWhichTroubleDialog(results, ev, messageId, message).render(true);
				}
				break;
		}
	});
}

export async function rollTrouble(results, ev, messageId, message) {
	let table = '';
	let roll = '';
	let rollAgainst = '';
	const troubleTable = Number(ev.submitter.value);

	let trouble = Number(results[1].trouble);
	switch (troubleTable) {
		case 1:
			table = await checkTables('CONFLICT / PHYSICAL', trouble);
			rollAgainst = 'CONFLICT / PHYSICAL';
			break;
		case 2:
			table = await checkTables('MENTAL / SOCIAL', trouble);
			rollAgainst = 'MENTAL / SOCIAL';
			break;
	}

	roll = await new Roll('1d6').evaluate();
	const TroubleTableResult = await table.draw({ roll: roll, displayChat: false });

	// Prepare the data for the chat message
	//
	const actorName = game.messages.get(message).speaker.alias;
	const actorId = game.messages.get(message).speaker.actor;
	const htmlData = {
		actorname: actorName,
		actorId: actorId,
		img: TroubleTableResult.results[0].img,
		rollAgainst: rollAgainst,
		textMessage: TroubleTableResult.results[0].text,
	};

	// Now push the correct chat message

	const html = await renderTemplate(`systems/talesoftheoldwest/templates/chat/trouble-roll.hbs`, htmlData);

	let chatData = {
		user: game.user.id,
		speaker: {
			actor: actorId,
		},
		content: html,
		other: game.users.contents.filter((u) => u.isGM).map((u) => u.id),
		sound: CONFIG.sounds.dice,
	};

	// Apply the Active Effect

	// switch (type) {
	// 	case 'pc':
	// 		// case 'npc':
	// 		await this.addCondition('criticalinj');
	// 		break;
	// 	// case 'creature':criticalinj
	// 	// 	console.log("it's a Creature Crit");
	// 	// 	break;

	// 	default:
	// 		break;
	// }

	// remove the Roll Trouble Button
	results[1].totalTrouble = 'rolledTrouble';

	let aMessage = game.messages.get(results[1].messageNo);
	aMessage.setFlag('talesoftheoldwest', 'results', results);
	messageId.target.remove();
	ChatMessage.applyRollMode(chatData, game.settings.get('core', 'rollMode'));
	return ChatMessage.create(chatData);
	// return;

	async function checkTables(type, trouble) {
		let tTable = `TROUBLE OUTCOME TABLE - ${type} (${trouble})`;
		let table = game.tables.getName(`${tTable}`);
		if (table) {
			return table;
		} else {
			ui.notifications.error(game.i18n.localize('TALESOFTHEOLDWEST.General.ErrorTroubleTable'));
			return;
		}
	}
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
	origRollData[1].buyoff += result.trouble > 0 ? true : false;

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
	origRollData[1].buyoff -= troubleMod > 0 ? true : false;
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
		buyoff: trouble > 0 ? true : false,
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
