export const TALESOFTHEOLDWEST = {};

/**
 * The set of Ability Scores used within the system.
 * @type {Object}
 *
 *
 */

TALESOFTHEOLDWEST.attributes = {
	grit: 'TALESOFTHEOLDWEST.Attributes.grit.name',
	quick: 'TALESOFTHEOLDWEST.Attributes.quick.name',
	cunning: 'TALESOFTHEOLDWEST.Attributes.cunning.name',
	docity: 'TALESOFTHEOLDWEST.Attributes.docity.name',
};

TALESOFTHEOLDWEST.abilities = {
	labor: { name: 'TALESOFTHEOLDWEST.Ability.Labor.long', atob: 'grit' },
	presence: { name: 'TALESOFTHEOLDWEST.Ability.Presence.long', atob: 'grit' },
	fightin: { name: 'TALESOFTHEOLDWEST.Ability.Fightin.long', atob: 'grit' },
	resilience: { name: 'TALESOFTHEOLDWEST.Ability.Resilience.long', atob: 'grit' },
	move: { name: 'TALESOFTHEOLDWEST.Ability.Move.long', atob: 'quick' },
	operate: { name: 'TALESOFTHEOLDWEST.Ability.Operate.long', atob: 'quick' },
	shootin: { name: 'TALESOFTHEOLDWEST.Ability.Shootin.long', atob: 'quick' },
	lightfingered: { name: 'TALESOFTHEOLDWEST.Ability.Lightfingered.long', atob: 'quick' },
	hawkeye: { name: 'TALESOFTHEOLDWEST.Ability.Hawkeye.long', atob: 'cunning' },
	nature: { name: 'TALESOFTHEOLDWEST.Ability.Nature.long', atob: 'cunning' },
	insight: { name: 'TALESOFTHEOLDWEST.Ability.Insight.long', atob: 'cunning' },
	animalhandlin: { name: 'TALESOFTHEOLDWEST.Ability.Animalhandlin.long', atob: 'cunning' },
	performin: { name: 'TALESOFTHEOLDWEST.Ability.Performin.long', atob: 'docity' },
	makin: { name: 'TALESOFTHEOLDWEST.Ability.Makin.long', atob: 'docity' },
	doctorin: { name: 'TALESOFTHEOLDWEST.Ability.Doctorin.long', atob: 'docity' },
	booklearnin: { name: 'TALESOFTHEOLDWEST.Ability.Booklearnin.long', atob: 'docity' },
};
TALESOFTHEOLDWEST.animalabilities = {
	flight: { name: 'TALESOFTHEOLDWEST.Ability.flight.long', atob: 'quick' },
	resilience: { name: 'TALESOFTHEOLDWEST.Ability.resilience.long', atob: 'grit' },
};

TALESOFTHEOLDWEST.abilityAbbreviations = {
	labor: 'TALESOFTHEOLDWEST.Ability.Labor.abbr',
	presence: 'TALESOFTHEOLDWEST.Ability.Presence.abbr',
	fightin: 'TALESOFTHEOLDWEST.Ability.Fightin.abbr',
	resilience: 'TALESOFTHEOLDWEST.Ability.Resilience.abbr',
	move: 'TALESOFTHEOLDWEST.Ability.Move.abbr',
	operate: 'TALESOFTHEOLDWEST.Ability.Operate.abbr',
	shootin: 'TALESOFTHEOLDWEST.Ability.Shootin.abbr',
	lightfingered: 'TALESOFTHEOLDWEST.Ability.Lightfingered.abbr',
	hawkeye: 'TALESOFTHEOLDWEST.Ability.Hawkeye.abbr',
	nature: 'TALESOFTHEOLDWEST.Ability.Nature.abbr',
	insight: 'TALESOFTHEOLDWEST.Ability.Insight.abbr',
	animalhandlin: 'TALESOFTHEOLDWEST.Ability.Animalhandlin.abbr',
	performin: 'TALESOFTHEOLDWEST.Ability.Performin.abbr',
	makin: 'TALESOFTHEOLDWEST.Ability.Makin.abbr',
	doctorin: 'TALESOFTHEOLDWEST.Ability.Doctorin.abbr',
	booklearnin: 'TALESOFTHEOLDWEST.Ability.Booklearnin.abbr',
};

TALESOFTHEOLDWEST.archtype_list = {
	Trader: { id: 'Trader', label: 'Trader' },
	Tracker: { id: 'Tracker', label: 'Tracker' },
	Caitian: { id: 'Caitian', label: 'Caitian' },
	Edoan: { id: 'Edoan', label: 'Edoan' },
	Tellerite: { id: 'Tellerite', label: 'Tellerite' },
	Vulcan: { id: 'Vulcan', label: 'Vulcan' },
};

TALESOFTHEOLDWEST.heritage_list = {
	AfricanAmerican: { id: 'African American', label: 'African American' },
	MexicanCibolero: { id: 'Mexican Cibolero', label: 'Mexican Cibolero' },
	Lieutenant: { id: 'Lieutenant', label: 'Lieutenant' },
	LieutenantCommander: { id: 'Lieutenant Commander', label: 'Lieutenant Commander' },
	Commander: { id: 'Commander', label: 'Commander' },
	Captain: { id: 'Captain', label: 'Captain' },
	Commodore: { id: 'Commodore', label: 'Commodore' },
	Admiral: { id: 'Admiral', label: 'Admiral' },
};
TALESOFTHEOLDWEST.subtype_list = {
	fightin: { id: 'Fightin', label: 'Fightin' },
	shootin: { id: 'Shootin', label: 'Shootin' },
};
TALESOFTHEOLDWEST.action_list = {
	single: { id: 'Single', label: 'Single' },
	double: { id: 'Double', label: 'Double' },
	lever: { id: 'Lever', label: 'Lever' },
	breech: { id: 'Breech', label: 'Breech' },
};
TALESOFTHEOLDWEST.range_list = {
	armslength: { id: 'Arms Length', label: 'TALESOFTHEOLDWEST.Ranges.armslength.long' },
	near: { id: 'Near', label: 'TALESOFTHEOLDWEST.Ranges.near.long' },
	short: { id: 'Short', label: 'TALESOFTHEOLDWEST.Ranges.short.long' },
	medium: { id: 'Medium', label: 'TALESOFTHEOLDWEST.Ranges.medium.long' },
	long: { id: 'Long', label: 'TALESOFTHEOLDWEST.Ranges.long.long' },
	distant: { id: 'Distant', label: 'TALESOFTHEOLDWEST.Ranges.distant.long' },
};
TALESOFTHEOLDWEST.range_modifiers = {
	inactivearmslength: { id: 'InactiveArmsLength', label: 'TALESOFTHEOLDWEST.ModRanges.inactivearmslength', value: '3' },
	activearmslength: { id: 'ActiveArmsLength', label: 'TALESOFTHEOLDWEST.ModRanges.activearmslength', value: '-3' },
	near: { id: 'Near', label: 'TALESOFTHEOLDWEST.ModRanges.near', value: '1' },
	short: { id: 'Short', label: 'TALESOFTHEOLDWEST.ModRanges.short', value: '0' },
	medium: { id: 'Medium', label: 'TALESOFTHEOLDWEST.ModRanges.medium', value: '-1' },
	long: { id: 'Long', label: 'TALESOFTHEOLDWEST.ModRanges.long', value: '-2' },
	distant: { id: 'Distant', label: 'TALESOFTHEOLDWEST.ModRanges.distant', value: '-3' },
};
TALESOFTHEOLDWEST.called_shots = {
	aimedshot: { id: 'aimedshot', label: 'TALESOFTHEOLDWEST.Called.aimedshot', value: '2' },
	quickshot: { id: 'quickshot', label: 'TALESOFTHEOLDWEST.Called.quickshot', value: '-2' },
	calledshot: { id: 'calledshot', label: 'TALESOFTHEOLDWEST.Called.calledshot', value: '-3' },
	aimingacalledshot: { id: 'aimingacalledshot', label: 'TALESOFTHEOLDWEST.Called.aimingcalledshot', value: '1' },
};
TALESOFTHEOLDWEST.target_cover = {
	none: { id: 'none', label: 'TALESOFTHEOLDWEST.Cover.none', value: '0' },
	partialcover: { id: 'partialcover', label: 'TALESOFTHEOLDWEST.Cover.partialcover', value: '-1' },
	goodcover: { id: 'goodcover', label: 'TALESOFTHEOLDWEST.Cover.goodcover', value: '-2' },
	// heavycover: { id: 'heavycover', label: 'TALESOFTHEOLDWEST.Cover.heavycover', value: '+1' },
};

TALESOFTHEOLDWEST.target_size = {
	normal: { id: 'normal', label: 'TALESOFTHEOLDWEST.TargetSize.normal', value: '0' },
	large: { id: 'large', label: 'TALESOFTHEOLDWEST.TargetSize.large', value: '2' },
	small: { id: 'small', label: 'TALESOFTHEOLDWEST.TargetSize.small', value: '-2' },
};

TALESOFTHEOLDWEST.target_visibility = {
	daylight: { id: 'daylight', label: 'TALESOFTHEOLDWEST.TargetVisibility.daylight', value: '0' },
	dimlight: { id: 'dimlight', label: 'TALESOFTHEOLDWEST.TargetVisibility.dimlight', value: '-1' },
	darkness: { id: 'darkness', label: 'TALESOFTHEOLDWEST.TargetVisibility.darkness', value: '-3' },
};

TALESOFTHEOLDWEST.item_modifier_list = {
	grit: { id: 'attribute-grit', label: 'TALESOFTHEOLDWEST.Attributes.grit.name' },
	quick: { id: 'attribute-quick', label: 'TALESOFTHEOLDWEST.Attributes.quick.name' },
	cunning: { id: 'attribute-cunning', label: 'TALESOFTHEOLDWEST.Attributes.cunning.name' },
	docity: { id: 'attribute-docity', label: 'TALESOFTHEOLDWEST.Attributes.docity.name' },
	labor: { id: 'ability-labor', label: 'TALESOFTHEOLDWEST.Ability.Labor.long' },
	presence: { id: 'ability-presence', label: 'TALESOFTHEOLDWEST.Ability.Presence.long' },
	fightin: { id: 'ability-fightin', label: 'TALESOFTHEOLDWEST.Ability.Fightin.long' },
	resilience: { id: 'ability-resilience', label: 'TALESOFTHEOLDWEST.Ability.Resilience.long' },
	move: { id: 'ability-move', label: 'TALESOFTHEOLDWEST.Ability.Move.long' },
	operate: { id: 'ability-operate', label: 'TALESOFTHEOLDWEST.Ability.Operate.long' },
	shootin: { id: 'ability-shootin', label: 'TALESOFTHEOLDWEST.Ability.Shootin.long' },
	lightfingered: { id: 'ability-lightfingered', label: 'TALESOFTHEOLDWEST.Ability.Lightfingered.long' },
	hawkeye: { id: 'ability-hawkeye', label: 'TALESOFTHEOLDWEST.Ability.Hawkeye.long' },
	nature: { id: 'ability-nature', label: 'TALESOFTHEOLDWEST.Ability.Nature.long' },
	insight: { id: 'ability-insight', label: 'TALESOFTHEOLDWEST.Ability.Insight.long' },
	animalhandlin: { id: 'ability-animalhandlin', label: 'TALESOFTHEOLDWEST.Ability.Animalhandlin.long' },
	performin: { id: 'ability-dociperforminty', label: 'TALESOFTHEOLDWEST.Ability.Performin.long' },
	makin: { id: 'ability-makin', label: 'TALESOFTHEOLDWEST.Ability.Makin.long' },
	doctorin: { id: 'ability-doctorin', label: 'TALESOFTHEOLDWEST.Ability.Doctorin.long' },
	booklearnin: { id: 'ability-booklearnin', label: 'TALESOFTHEOLDWEST.Ability.Booklearnin.long' },
};

TALESOFTHEOLDWEST.crit_location_list = {
	lowerleg: { id: 'lowerleg', label: 'TALESOFTHEOLDWEST.CritLocation.lowerleg' },
	upperleg: { id: 'upperleg', label: 'TALESOFTHEOLDWEST.CritLocation.upperleg' },
	arm: { id: 'arm', label: 'TALESOFTHEOLDWEST.CritLocation.arm' },
	gut: { id: 'gut', label: 'TALESOFTHEOLDWEST.CritLocation.gut' },
	chest: { id: 'chest', label: 'TALESOFTHEOLDWEST.CritLocation.chest' },
	head: { id: 'head', label: 'TALESOFTHEOLDWEST.CritLocation.head' },
};
