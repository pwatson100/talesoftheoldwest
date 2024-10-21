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
import { totowDiceListeners } from './helpers/diceroll.mjs';

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
		// animal: models.totowanimal,
	};
	CONFIG.Item.documentClass = totowItem;
	CONFIG.Item.dataModels = {
		item: models.totowItem,
		weapon: models.totowWeapon,
		talent: models.totowTalent,
	};

	// Active Effects are never copied to the Actor,
	// but will still apply to the Actor from within the Item
	// if the transfer property on the Active Effect is true.
	CONFIG.ActiveEffect.legacyTransferral = false;

	// Register sheet application classes
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

Handlebars.registerHelper('toUpperrCase', function (str) {
	return str.toUpperCase();
});

Handlebars.registerHelper('capitalise', function (str) {
	return str.charAt(0).toUpperCase() + str.slice(1);
});

Handlebars.registerHelper('if_eq', function (a, b, opts) {
	if (a === b) {
		return opts.fn(this);
	} else {
		return opts.inverse(this);
	}
});
// greater than or equal to
Handlebars.registerHelper('gte', function (a, b) {
	return a >= b;
});
// less than or equal to
Handlebars.registerHelper('lte', function (a, b) {
	return a <= b;
});

// Ifis not equal
Handlebars.registerHelper('ifne', function (v1, v2, options) {
	if (v1 !== v2) return options.fn(this);
	else return options.inverse(this);
});

Handlebars.registerHelper('if_gt', function (a, b, opts) {
	if (a > b) {
		return opts.fn(this);
	} else {
		return opts.inverse(this);
	}
});
Handlebars.registerHelper('if_lt', function (a, b, opts) {
	if (a < b) {
		return opts.fn(this);
	} else {
		return opts.inverse(this);
	}
});
// if not
Handlebars.registerHelper('ifn', function (v1, options) {
	if (!v1) return options.fn(this);
	else return options.inverse(this);
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

Handlebars.registerHelper('striptags', function (txt) {
	// console.log(txt);
	// exit now if text is undefined
	if (typeof txt == 'undefined') return;
	// the regular expresion
	var regexp = /<[\/\w]+>/g;
	// replacing the text
	return txt.replace(regexp, '');
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
	totowDiceListeners(html);
});

Hooks.on('renderChatMessage', (app, html, msg) => {
	// Do not display "Blind" chat cards to non-gm
	if (html.hasClass('blind') && !game.user.isGM) {
		// since the header has timestamp content we'll remove the content instead.
		// this avoids an NPE when foundry tries to update the timestamps.
		html.find('.message-content').remove();
	}
	// remove push option from non-authors
	if (!game.user.isGM && msg.message.user !== game.user.id) {
		html.find('.dice-push').remove();
	}
});

// ***************************
// DsN V3 Hooks
// ***************************
Hooks.on('diceSoNiceRollComplete', (chatMessageID) => {});

Hooks.once('diceSoNiceReady', (dice3d) => {
	dice3d.addColorset({
		name: 'yellow',
		description: 'Yellow',
		category: 'Colors',
		foreground: ['#e3e300'],
		background: ['#e3e300'],
		outline: 'black',
		texture: 'none',
	});

	dice3d.addColorset(
		{
			name: 'AlienBlack',
			description: 'AlienBlack',
			category: 'Colors',
			foreground: ['#ffffff'],
			background: ['#000000'],
			outline: 'black',
			texture: 'none',
		},
		'preferred'
	);

	dice3d.addSystem({ id: 'talesoftheoldwest', name: 'Alien RPG - Blank' }, 'preferred');
	dice3d.addDicePreset({
		type: 'dt',
		labels: [
			'systems/talesoftheoldwest/ui/DsN/alien-dice-y1.png',
			'systems/talesoftheoldwest/ui/DsN/alien-dice-b0.png',
			'systems/talesoftheoldwest/ui/DsN/alien-dice-b0.png',
			'systems/talesoftheoldwest/ui/DsN/alien-dice-b0.png',
			'systems/talesoftheoldwest/ui/DsN/alien-dice-b0.png',
			'systems/talesoftheoldwest/ui/DsN/alien-dice-b6.png',
		],
		colorset: 'AlienBlack',
		system: 'talesoftheoldwest',
	});
	dice3d.addDicePreset({
		type: 'ds',
		labels: [
			'systems/talesoftheoldwest/ui/DsN/alien-dice-y0.png',
			'systems/talesoftheoldwest/ui/DsN/alien-dice-y0.png',
			'systems/talesoftheoldwest/ui/DsN/alien-dice-y0.png',
			'systems/talesoftheoldwest/ui/DsN/alien-dice-y0.png',
			'systems/talesoftheoldwest/ui/DsN/alien-dice-y0.png',
			'systems/talesoftheoldwest/ui/DsN/alien-dice-y6.png',
		],
		colorset: 'yellow',
		system: 'talesoftheoldwest',
	});

	dice3d.addSystem({ id: 'talesoftheoldwestf', name: 'Alien RPG - Full Dice' });
	dice3d.addDicePreset({
		type: 'dt',
		labels: [
			'systems/talesoftheoldwest/ui/DsN/alien-dice-y1.png',
			'systems/talesoftheoldwest/ui/DsN/b2.png',
			'systems/talesoftheoldwest/ui/DsN/b3.png',
			'systems/talesoftheoldwest/ui/DsN/b4.png',
			'systems/talesoftheoldwest/ui/DsN/b5.png',
			'systems/talesoftheoldwest/ui/DsN/alien-dice-b6.png',
		],
		colorset: 'AlienBlack',
		system: 'talesoftheoldwestf',
	});
	dice3d.addDicePreset({
		type: 'ds',
		labels: [
			'systems/talesoftheoldwest/ui/DsN/y1.png',
			'systems/talesoftheoldwest/ui/DsN/y2.png',
			'systems/talesoftheoldwest/ui/DsN/y3.png',
			'systems/talesoftheoldwest/ui/DsN/y4.png',
			'systems/talesoftheoldwest/ui/DsN/y5.png',
			'systems/talesoftheoldwest/ui/DsN/alien-dice-y6.png',
		],
		colorset: 'yellow',
		system: 'talesoftheoldwestf',
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
	const command = `game.boilerplate.rollItemMacro("${data.uuid}");`;
	let macro = game.macros.find((m) => m.name === item.name && m.command === command);
	if (!macro) {
		macro = await Macro.create({
			name: item.name,
			type: 'script',
			img: item.img,
			command: command,
			flags: { 'boilerplate.itemMacro': true },
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
