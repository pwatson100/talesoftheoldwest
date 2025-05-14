// Import document classes.
import { totowActor } from './documents/actor.mjs';
import { totowItem } from './documents/item.mjs';
// Import sheet classes.
import { totowActorSheet } from './sheets/actor-sheet.mjs';
import { totowItemSheet } from './sheets/item-sheet.mjs';
// Import helper/utility classes and constants.
import { TALESOFTHEOLDWEST } from './helpers/config.mjs';
// Import DataModel classes
import * as models from './data/_module.mjs';
import { totowTroubleDie } from './helpers/totowTroubleDice.js';
import { totowNormalDie } from './helpers/totowTroubleDice.js';

import { COMMON } from './helpers/common.mjs';
import { logger } from './helpers/logger.mjs';
import registerSettings from './helpers/settings.mjs';
import { totowDiceListeners, totowDiceButtons } from './helpers/diceroll.mjs';

const SUB_MODULES = {
	COMMON,
	logger,
};
/* -------------------------------------------- */
/*  Init Hook                                   */
/* -------------------------------------------- */

globalThis.talesoftheoldwest = {
	documents: {
		registerSettings,
		totowActor,
		totowItem,
	},
	applications: {
		totowActorSheet,
		totowItemSheet,
	},
	utils: {
		rollItemMacro,
	},
	models,
};

Hooks.once('init', function () {
	// Add custom constants for configuration.
	CONFIG.TALESOFTHEOLDWEST = TALESOFTHEOLDWEST;

	Object.values(SUB_MODULES).forEach((cl) => {
		logger.info(COMMON.localize('TALESOFTHEOLDWEST.Init.SubModule', { name: cl.NAME }));
		cl.register();
	});
	/**
	 * Set an initiative formula for the system
	 * @type {String}
	 */
	CONFIG.Combat.initiative = {
		formula: '1d52',
		decimals: 2,
	};

	// Define custom Document and DataModel classes
	CONFIG.Actor.documentClass = totowActor;

	CONFIG.Dice.terms['t'] = totowTroubleDie;
	CONFIG.Dice.terms['s'] = totowNormalDie;

	// Note that you don't need to declare a DataModel
	// for the base actor/item classes - they are included
	// with the Character/NPC as part of super.defineSchema()
	CONFIG.Actor.dataModels = {
		pc: models.totowCharacter,
		npc: models.totowNPC,
		animal: models.totowANIMAL,
		// animal: models.totowanimal,
	};
	CONFIG.Item.documentClass = totowItem;
	CONFIG.Item.dataModels = {
		item: models.totowItem,
		weapon: models.totowWeapon,
		talent: models.totowTalent,
		crit: models.totowCrit,
		animalquality: models.totowAnimalQuality,
		weaponquality: models.totowWeaponQuality,
	};

	// Active Effects are never copied to the Actor,
	// but will still apply to the Actor from within the Item
	// if the transfer property on the Active Effect is true.
	// Necessary until foundry makes this default behavior in v13
	CONFIG.ActiveEffect.legacyTransferral = false;

	// Register sheet application classes
	// foundry.documents.collections.Actors.unregisterSheet('core', foundry.appv1.sheets.ActorSheet);
	// foundry.documents.collections.Actors.registerSheet('totow', totowActorSheet, {
	// 	makeDefault: true,
	// 	label: 'TALESOFTHEOLDWEST.SheetLabels.Actor',
	// });
	// foundry.documents.collections.Items.unregisterSheet('core', foundry.appv1.sheets.ItemSheet);
	// foundry.documents.collections.Items.registerSheet('totow', totowItemSheet, {
	// 	makeDefault: true,
	// 	label: 'TALESOFTHEOLDWEST.SheetLabels.Item',
	// });

	Actors.unregisterSheet('core', ActorSheet);
	Actors.registerSheet('totow', totowActorSheet, {
		makeDefault: true,
		label: 'TALESOFTHEOLDWEST.SheetLabels.Actor',
	});
	Items.unregisterSheet('core', ItemSheet);
	Items.registerSheet('totow', totowItemSheet, {
		makeDefault: true,
		label: 'TALESOFTHEOLDWEST.SheetLabels.Item',
	});

	registerSettings();
	// // Preload Handlebars templates.
	// return preloadHandlebarsTemplates();
});

/* -------------------------------------------- */
/*  Handlebars Helpers                          */
/* -------------------------------------------- */

// If you need to add Handlebars helpers, here is a useful example:
Handlebars.registerHelper('toLowerCase', function (str) {
	return str.toLowerCase();
});

Handlebars.registerHelper('toUpperCase', function (str) {
	return str.toUpperCase();
});

Handlebars.registerHelper('capitalise', function (str) {
	return str.charAt(0).toUpperCase() + str.slice(1);
});

/*
 * Repeat given markup with n times
 */
Handlebars.registerHelper('times', function (n, block) {
	var result = '';
	for (let i = 0; i < n; ++i) {
		result += block.fn(i);
	}
	return result;
});
Handlebars.registerHelper('keepMarkup', function (text) {
	return new Handlebars.SafeString(text);
});
Handlebars.registerHelper('removeMarkup', function (text) {
	const markup = /<(.*?)>/gi;
	return new Handlebars.SafeString(text.replace(markup, ''));
});
Handlebars.registerHelper('ifSetting', function (v1, options) {
	if (game.settings.get('talesoftheoldwest', v1)) return options.fn(this);
	else return options.inverse(this);
});
Handlebars.registerHelper('striptags', function (txt) {
	// console.log(txt);
	// exit now if text is undefined
	if (typeof txt == 'undefined') return;
	// the regular expresion
	var regexp = /<[\/\w]+>/g;
	// replacing the text
	return txt.replace(regexp, '');
});
Handlebars.registerHelper('addstats', function (v1, v2) {
	return v1 + v2;
});

Handlebars.registerHelper('totowConcat', function () {
	var outStr = '';
	for (var arg in arguments) {
		if (typeof arguments[arg] != 'object') {
			outStr += arguments[arg];
		}
	}
	return outStr;
});
/* -------------------------------------------- */
/*  Ready Hook                                  */
/* -------------------------------------------- */

Hooks.once('ready', function () {
	// Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
	Hooks.on('hotbarDrop', (bar, data, slot) => createDocMacro(data, slot));
	// clear the minimum resolution message faster

	setTimeout(() => {
		$('.notification.error').each((index, item) => {
			if ($(item).text().includes('requires a minimum screen resolution')) {
				$(item).remove();
			}
		});
	}, 250);
});

Hooks.on('renderChatLog', (log, html, data) => {
	totowDiceListeners();
});

// if (game.version < '13') {
Hooks.on('renderChatMessage', (app, [html], msg) => {
	totowDiceButtons(html);
	// Do not display "Blind" chat cards to non-gm
	if (html.querySelector('blind') && !game.user.isGM) {
		// since the header has timestamp content we'll remove the content instead.
		// this avoids an NPE when foundry tries to update the timestamps.
		html.querySelector('.message-content').remove();
	}
	// remove push option from non-authors
	if (!game.user.isGM && msg.message.author !== game.user.id) {
		html.querySelector('.dice-push').remove();
		html.querySelector('.buy-off').remove();
		html.querySelector('.roll-trouble').remove();
	}
});
// }
// else {
// Hooks.on('renderChatMessageHTML', (app, html, msg) => {
// 	// Do not display "Blind" chat cards to non-gm
// 	totowDiceButtons(html);

// 	if (html.querySelector('blind') && !game.user.isGM) {
// 		// since the header has timestamp content we'll remove the content instead.
// 		// this avoids an NPE when foundry tries to update the timestamps.
// 		html.querySelector('.message-content').remove();
// 	}
// 	// remove push option from non-authors
// 	if (!game.user.isGM && msg.message.author !== game.user.id) {
// 		html.querySelector('.dice-push').remove();
// 		html.querySelector('.buy-off').remove();
// 		html.querySelector('.roll-trouble').remove();
// 	}
// });
// }

Hooks.on('renderPause', (_app, html, options) => {
	// console.log(document);
	document.getElementById(
		'pause'
	).innerHTML = `<img src=\"systems/talesoftheoldwest/assets/icons/snake.webp\" class=\"fa-spin\"><figcaption>"SIT A SPELL"</figcaption>`;
});

// V13 spinner
Hooks.on('renderGamePause', (_app, html, options) => {
	document.getElementById(
		'pause'
	).innerHTML = `<img src=\"systems/talesoftheoldwest/assets/icons/snake.webp\" class=\"fa-spin\"><figcaption>"SIT A SPELL"</figcaption>`;
});

// ***************************
// DsN V3 Hooks
// ***************************
Hooks.on('diceSoNiceRollComplete', (chatMessageID) => {});

Hooks.once('diceSoNiceReady', (dice3d) => {
	dice3d.addSystem({ id: 'talesoftheoldwest', name: 'Tales Of The Old West' }, 'preferred');
	dice3d.addDicePreset({
		type: 'dt',
		labels: [
			'systems/talesoftheoldwest/ui/DsN/trouble-face.webp',
			'systems/talesoftheoldwest/ui/DsN/2-face.webp',
			'systems/talesoftheoldwest/ui/DsN/3-face.webp',
			'systems/talesoftheoldwest/ui/DsN/4-face.webp',
			'systems/talesoftheoldwest/ui/DsN/5-face.webp',
			'systems/talesoftheoldwest/ui/DsN/6-face.webp',
		],
		// colorset: 'black',
		system: 'talesoftheoldwest',
	});
	dice3d.addDicePreset({
		type: 'ds',
		labels: [
			'systems/talesoftheoldwest/ui/DsN/1-normal.webp',
			'systems/talesoftheoldwest/ui/DsN/2-normal.webp',
			'systems/talesoftheoldwest/ui/DsN/3-normal.webp',
			'systems/talesoftheoldwest/ui/DsN/4-normal.webp',
			'systems/talesoftheoldwest/ui/DsN/5-normal.webp',
			'systems/talesoftheoldwest/ui/DsN/6-normal.webp',
		],
		// colorset: 'black',
		system: 'talesoftheoldwest',
	});
});

/* -------------------------------------------- */
/*  Hotbar Macros                               */
/* -------------------------------------------- */

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {Object} data     The dropped data
 * @param {number} slot     The hotbar slot to use
 * @returns {Promise}
 */
async function createDocMacro(data, slot) {
	// First, determine if this is a valid owned item.
	if (data.type !== 'Item') return;
	if (!data.uuid.includes('Actor.') && !data.uuid.includes('Token.')) {
		return ui.notifications.warn('You can only create macro buttons for owned Items');
	}
	// If it is, retrieve it based on the uuid.
	const item = await Item.fromDropData(data);

	// Create the macro command using the uuid.
	const command = `game.talesoftheoldwest.rollItemMacro("${data.uuid}");`;
	let macro = game.macros.find((m) => m.name === item.name && m.command === command);
	if (!macro) {
		macro = await Macro.create({
			name: item.name,
			type: 'script',
			img: item.img,
			command: command,
			flags: { 'talesoftheoldwest.itemMacro': true },
		});
	}
	game.user.assignHotbarMacro(macro, slot);
	return false;
}

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {string} itemUuid
 */
function rollItemMacro(itemUuid) {
	// Reconstruct the drop data so that we can load the item.
	const dropData = {
		type: 'Item',
		uuid: itemUuid,
	};
	// Load the item from the uuid.
	Item.fromDropData(dropData).then((item) => {
		// Determine if the item loaded and if it's an owned item.
		if (!item || !item.parent) {
			const itemName = item?.name ?? itemUuid;
			return ui.notifications.warn(`Could not find item ${itemName}. You may need to delete and recreate this macro.`);
		}

		// Trigger the item roll
		item.roll();
	});
}
