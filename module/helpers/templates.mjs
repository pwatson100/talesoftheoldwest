/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function () {
	return foundry.applications.handlebars.loadTemplates([
		// Actor partials.
		'systems/talesoftheoldwest/templates/actor/parts/actor-weapon.hbs',
		'systems/talesoftheoldwest/templates/actor/parts/actor-talent.hbs',
		'systems/talesoftheoldwest/templates/actor/parts/actor-gear.hbs',
		'systems/talesoftheoldwest/templates/actor/parts/actor-items-inline.hbs',
		'systems/talesoftheoldwest/templates/actor/parts/actor-gear-list.hbs',
		'systems/talesoftheoldwest/templates/actor/parts/actor-crit-conditions.hbs',
		'systems/talesoftheoldwest/templates/actor/parts/actor-abilities.hbs',
		'systems/talesoftheoldwest/templates/actor/parts/actor-attributes.hbs',
		'systems/talesoftheoldwest/templates/actor/parts/actor-skills-pc.hbs',
		'systems/talesoftheoldwest/templates/actor/parts/actor-skills-npc.hbs',
		'systems/talesoftheoldwest/templates/actor/parts/actor-skills-animal.hbs',
		'systems/talesoftheoldwest/templates/actor/parts/actor-animal-horse.hbs',
		'systems/talesoftheoldwest/templates/actor/parts/actor-animal-generic.hbs',
		'systems/talesoftheoldwest/templates/actor/parts/actor-effects.hbs',
		'systems/talesoftheoldwest/templates/actor/parts/quality-options.hbs',
		'systems/talesoftheoldwest/templates/actor/parts/horse-quality-options.hbs',
		'systems/talesoftheoldwest/templates/actor/parts/actor-compadres.hbs',
		'systems/talesoftheoldwest/templates/actor/parts/actor-remuda.hbs',
		'systems/talesoftheoldwest/templates/actor/parts/actor-horse.hbs',
		'systems/talesoftheoldwest/templates/actor/parts/compadre-weapon.hbs',
		'systems/talesoftheoldwest/templates/actor/parts/actor-horse-saddlebag.hbs',
		'systems/talesoftheoldwest/templates/actor/parts/actor-horse-quality-options.hbs',
		'systems/talesoftheoldwest/templates/actor/parts/towncharter-amenities.hbs',
		// Item partials
		'systems/talesoftheoldwest/templates/item/parts/item-effects.hbs',
		// Chat templates
		'systems/talesoftheoldwest/templates/chat/crit-roll-npc.hbs',
		'systems/talesoftheoldwest/templates/chat/crit-roll-animal.hbs',
		// Dialog partials
		'systems/talesoftheoldwest/templates/dialog/parts/conditional-modifiers.hbs',
		'systems/talesoftheoldwest/templates/dialog/parts/talent-modifiers.hbs',
		'systems/talesoftheoldwest/templates/dialog/crit-roll-modifiers.hbs',
		// Saddlebag import/export dialogs
		'systems/talesoftheoldwest/templates/dialog/saddlebag/export-campaign.hbs',
		'systems/talesoftheoldwest/templates/dialog/saddlebag/import-pick-file.hbs',
		'systems/talesoftheoldwest/templates/dialog/saddlebag/import-pick-archive.hbs',
		'systems/talesoftheoldwest/templates/dialog/saddlebag/import-warnings.hbs',
		'systems/talesoftheoldwest/templates/dialog/saddlebag/import-confirm.hbs',
		'systems/talesoftheoldwest/templates/dialog/saddlebag/horse-match.hbs',
	]);
};
