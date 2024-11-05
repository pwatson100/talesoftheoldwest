/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function () {
	return loadTemplates([
		// Actor partials.
		'systems/talesoftheoldwest/templates/actor/parts/actor-weapon.html',
		'systems/talesoftheoldwest/templates/actor/parts/actor-talent.html',
		'systems/talesoftheoldwest/templates/actor/parts/actor-items.hbs',
		'systems/talesoftheoldwest/templates/actor/parts/actor-items-inline.hbs',
		'systems/talesoftheoldwest/templates/actor/parts/actor-effects.hbs',
		'systems/talesoftheoldwest/templates/actor/parts/quality-options.hbs',
		// Item partials
		'systems/talesoftheoldwest/templates/item/parts/item-modifiers.html',
		// 'systems/talesoftheoldwest/templates/dialog/roll-modifiers.html',
	]);
};
