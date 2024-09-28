export const TALES_OF_THE_OLD_WEST = {};

/**
 * The set of Ability Scores used within the system.
 * @type {Object}
 *
 *
 */

TALES_OF_THE_OLD_WEST.attributes = {
	grit: 'TALES_OF_THE_OLD_WEST.Attributes.grit',
	quick: 'TALES_OF_THE_OLD_WEST.Attributes.quick',
	cunning: 'TALES_OF_THE_OLD_WEST.Attributes.cunning',
	docity: 'TALES_OF_THE_OLD_WEST.Attributes.docity',
};

TALES_OF_THE_OLD_WEST.abilities = {
	labor: { name: 'TALES_OF_THE_OLD_WEST.Ability.Labor.long', atob: 'grit' },
	presence: { name: 'TALES_OF_THE_OLD_WEST.Ability.Presence.long', atob: 'grit' },
	fightin: { name: 'TALES_OF_THE_OLD_WEST.Ability.Fightin.long', atob: 'grit' },
	resilience: { name: 'TALES_OF_THE_OLD_WEST.Ability.Resilience.long', atob: 'grit' },
	move: { name: 'TALES_OF_THE_OLD_WEST.Ability.Move.long', atob: 'quick' },
	operate: { name: 'TALES_OF_THE_OLD_WEST.Ability.Operate.long', atob: 'quick' },
	shootin: { name: 'TALES_OF_THE_OLD_WEST.Ability.Shootin.long', atob: 'quick' },
	lightfingered: { name: 'TALES_OF_THE_OLD_WEST.Ability.Lightfingered.long', atob: 'quick' },
	hawkeye: { name: 'TALES_OF_THE_OLD_WEST.Ability.Hawkeye.long', atob: 'cunning' },
	nature: { name: 'TALES_OF_THE_OLD_WEST.Ability.Nature.long', atob: 'cunning' },
	insight: { name: 'TALES_OF_THE_OLD_WEST.Ability.Insight.long', atob: 'cunning' },
	animalhandlin: { name: 'TALES_OF_THE_OLD_WEST.Ability.Animalhandlin.long', atob: 'cunning' },
	performin: { name: 'TALES_OF_THE_OLD_WEST.Ability.Performin.long', atob: 'docity' },
	makin: { name: 'TALES_OF_THE_OLD_WEST.Ability.Makin.long', atob: 'docity' },
	doctorin: { name: 'TALES_OF_THE_OLD_WEST.Ability.Doctorin.long', atob: 'docity' },
	booklearnin: { name: 'TALES_OF_THE_OLD_WEST.Ability.Booklearnin.long', atob: 'docity' },
};

TALES_OF_THE_OLD_WEST.abilityAbbreviations = {
	labor: 'TALES_OF_THE_OLD_WEST.Ability.Labor.abbr',
	presence: 'TALES_OF_THE_OLD_WEST.Ability.Presence.abbr',
	fightin: 'TALES_OF_THE_OLD_WEST.Ability.Fightin.abbr',
	resilience: 'TALES_OF_THE_OLD_WEST.Ability.Resilience.abbr',
	move: 'TALES_OF_THE_OLD_WEST.Ability.Move.abbr',
	operate: 'TALES_OF_THE_OLD_WEST.Ability.Operate.abbr',
	shootin: 'TALES_OF_THE_OLD_WEST.Ability.Shootin.abbr',
	lightfingered: 'TALES_OF_THE_OLD_WEST.Ability.Lightfingered.abbr',
	hawkeye: 'TALES_OF_THE_OLD_WEST.Ability.Hawkeye.abbr',
	nature: 'TALES_OF_THE_OLD_WEST.Ability.Nature.abbr',
	insight: 'TALES_OF_THE_OLD_WEST.Ability.Insight.abbr',
	animalhandlin: 'TALES_OF_THE_OLD_WEST.Ability.Animalhandlin.abbr',
	performin: 'TALES_OF_THE_OLD_WEST.Ability.Performin.abbr',
	makin: 'TALES_OF_THE_OLD_WEST.Ability.Makin.abbr',
	doctorin: 'TALES_OF_THE_OLD_WEST.Ability.Doctorin.abbr',
	booklearnin: 'TALES_OF_THE_OLD_WEST.Ability.Booklearnin.abbr',
};

TALES_OF_THE_OLD_WEST.archtype_list = {
	Trader: { id: 'Trader', label: 'Trader' },
	Andorian: { id: 'Andorian', label: 'Andorian' },
	Caitian: { id: 'Caitian', label: 'Caitian' },
	Edoan: { id: 'Edoan', label: 'Edoan' },
	Tellerite: { id: 'Tellerite', label: 'Tellerite' },
	Vulcan: { id: 'Vulcan', label: 'Vulcan' },
};

TALES_OF_THE_OLD_WEST.heritage_list = {
	AfricanAmerican: { id: 'African American', label: 'African American' },
	LieutenantJG: { id: 'Lieutenant, JG', label: 'Lieutenant, JG' },
	Lieutenant: { id: 'Lieutenant', label: 'Lieutenant' },
	LieutenantCommander: { id: 'Lieutenant Commander', label: 'Lieutenant Commander' },
	Commander: { id: 'Commander', label: 'Commander' },
	Captain: { id: 'Captain', label: 'Captain' },
	Commodore: { id: 'Commodore', label: 'Commodore' },
	Admiral: { id: 'Admiral', label: 'Admiral' },
};
TALES_OF_THE_OLD_WEST.subtype_list = {
	fightin: { id: 'Fightin', label: 'Fightin' },
	shootin: { id: 'Shootin', label: 'Shootin' },
};
TALES_OF_THE_OLD_WEST.action_list = {
	single: { id: 'Single', label: 'Single' },
	double: { id: 'Double', label: 'Double' },
	lever: { id: 'Lever', label: 'Lever' },
	breech: { id: 'Breech', label: 'Breech' },
};
TALES_OF_THE_OLD_WEST.range_list = {
	armslength: { id: 'Arms Length', label: 'TALES_OF_THE_OLD_WEST.Ranges.armslength.long' },
	near: { id: 'Near', label: 'TALES_OF_THE_OLD_WEST.Ranges.near.long' },
	short: { id: 'Short', label: 'TALES_OF_THE_OLD_WEST.Ranges.short.long' },
	medium: { id: 'Medium', label: 'TALES_OF_THE_OLD_WEST.Ranges.medium.long' },
	long: { id: 'Long', label: 'TALES_OF_THE_OLD_WEST.Ranges.long.long' },
	distant: { id: 'Distant', label: 'TALES_OF_THE_OLD_WEST.Ranges.distant.long' },
};

TALES_OF_THE_OLD_WEST.item_modifier_list = {
	grit: { id: 'attribute-grit', label: 'TALES_OF_THE_OLD_WEST.Attributes.grit' },
	quick: { id: 'attribute-quick', label: 'TALES_OF_THE_OLD_WEST.Attributes.quick' },
	cunning: { id: 'attribute-cunning', label: 'TALES_OF_THE_OLD_WEST.Attributes.cunning' },
	docity: { id: 'attribute-docity', label: 'TALES_OF_THE_OLD_WEST.Attributes.docity' },
	labor: { id: 'ability-labor', label: 'TALES_OF_THE_OLD_WEST.Ability.Labor.long' },
	presence: { id: 'ability-presence', label: 'TALES_OF_THE_OLD_WEST.Ability.Presence.long' },
	fightin: { id: 'ability-fightin', label: 'TALES_OF_THE_OLD_WEST.Ability.Fightin.long' },
	resilience: { id: 'ability-resilience', label: 'TALES_OF_THE_OLD_WEST.Ability.Resilience.long' },
	move: { id: 'ability-move', label: 'TALES_OF_THE_OLD_WEST.Ability.Move.long' },
	operate: { id: 'ability-operate', label: 'TALES_OF_THE_OLD_WEST.Ability.Operate.long' },
	shootin: { id: 'ability-shootin', label: 'TALES_OF_THE_OLD_WEST.Ability.Shootin.long' },
	lightfingered: { id: 'ability-lightfingered', label: 'TALES_OF_THE_OLD_WEST.Ability.Lightfingered.long' },
	hawkeye: { id: 'ability-hawkeye', label: 'TALES_OF_THE_OLD_WEST.Ability.Hawkeye.long' },
	nature: { id: 'ability-nature', label: 'TALES_OF_THE_OLD_WEST.Ability.Nature.long' },
	insight: { id: 'ability-insight', label: 'TALES_OF_THE_OLD_WEST.Ability.Insight.long' },
	animalhandlin: { id: 'ability-animalhandlin', label: 'TALES_OF_THE_OLD_WEST.Ability.Animalhandlin.long' },
	performin: { id: 'ability-dociperforminty', label: 'TALES_OF_THE_OLD_WEST.Ability.Performin.long' },
	makin: { id: 'ability-makin', label: 'TALES_OF_THE_OLD_WEST.Ability.Makin.long' },
	doctorin: { id: 'ability-doctorin', label: 'TALES_OF_THE_OLD_WEST.Ability.Doctorin.long' },
	booklearnin: { id: 'ability-booklearnin', label: 'TALES_OF_THE_OLD_WEST.Ability.Booklearnin.long' },
};
