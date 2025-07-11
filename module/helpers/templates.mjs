/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function () {
	return loadTemplates([
		// Actor partials.
		'systems/talesoftheoldwest/templates/actor/parts/actor-weapon.hbs',
		'systems/talesoftheoldwest/templates/actor/parts/actor-talent.hbs',
		'systems/talesoftheoldwest/templates/actor/parts/actor-gear.hbs',
		'systems/talesoftheoldwest/templates/actor/parts/actor-items-inline.hbs',
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
	]);
};
