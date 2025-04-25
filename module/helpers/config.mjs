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
	fightin: { name: 'TALESOFTHEOLDWEST.Ability.Fightin.long', atob: 'grit' },
	lightfingered: { name: 'TALESOFTHEOLDWEST.Ability.Lightfingered.long', atob: 'quick' },
	animalhandlin: { name: 'TALESOFTHEOLDWEST.Ability.Animalhandlin.long', atob: 'cunning' },
	booklearnin: { name: 'TALESOFTHEOLDWEST.Ability.Booklearnin.long', atob: 'docity' },
	labor: { name: 'TALESOFTHEOLDWEST.Ability.Labor.long', atob: 'grit' },
	move: { name: 'TALESOFTHEOLDWEST.Ability.Move.long', atob: 'quick' },
	hawkeye: { name: 'TALESOFTHEOLDWEST.Ability.Hawkeye.long', atob: 'cunning' },
	doctorin: { name: 'TALESOFTHEOLDWEST.Ability.Doctorin.long', atob: 'docity' },
	presence: { name: 'TALESOFTHEOLDWEST.Ability.Presence.long', atob: 'grit' },
	operate: { name: 'TALESOFTHEOLDWEST.Ability.Operate.long', atob: 'quick' },
	insight: { name: 'TALESOFTHEOLDWEST.Ability.Insight.long', atob: 'cunning' },
	makin: { name: 'TALESOFTHEOLDWEST.Ability.Makin.long', atob: 'docity' },
	resilience: { name: 'TALESOFTHEOLDWEST.Ability.Resilience.long', atob: 'grit' },
	shootin: { name: 'TALESOFTHEOLDWEST.Ability.Shootin.long', atob: 'quick' },
	nature: { name: 'TALESOFTHEOLDWEST.Ability.Nature.long', atob: 'cunning' },
	performin: { name: 'TALESOFTHEOLDWEST.Ability.Performin.long', atob: 'docity' },
};

TALESOFTHEOLDWEST.animalabilities = {
	// flight: { name: 'TALESOFTHEOLDWEST.Ability.Flight.long', atob: 'quick' },
	resilience: { name: 'TALESOFTHEOLDWEST.Ability.Resilience.long', atob: 'grit' },
	fightin: { name: 'TALESOFTHEOLDWEST.Ability.Fightin.long', atob: 'grit' },
	move: { name: 'TALESOFTHEOLDWEST.Ability.Move.long', atob: 'quick' },
	hawkeye: { name: 'TALESOFTHEOLDWEST.Ability.Hawkeye.long', atob: 'cunning' },
};
TALESOFTHEOLDWEST.animal_subtypes_list = {
	horse: { id: 'horse', label: 'TALESOFTHEOLDWEST.Animals.horse' },
	wolf: { id: 'wolf', label: 'TALESOFTHEOLDWEST.Animals.wolf' },
	dog: { id: 'dog', label: 'TALESOFTHEOLDWEST.Animals.dog' },
	critters: { id: 'critters', label: 'TALESOFTHEOLDWEST.Animals.critters' },
};

TALESOFTHEOLDWEST.animal_quality_types_list = {
	quality: { id: 'quality', label: 'TALESOFTHEOLDWEST.Item.General.quality' },
	flaw: { id: 'flaw', label: 'TALESOFTHEOLDWEST.Item.General.flaw' },
};

TALESOFTHEOLDWEST.animal_breed_list = {
	americanquarter: { id: 'americanquarter', label: 'TALESOFTHEOLDWEST.HorseBreed.americanquarter' },
	americansaddlebred: { id: 'americansaddlebred', label: 'TALESOFTHEOLDWEST.HorseBreed.americansaddlebred' },
	appaloosa: { id: 'appaloosa', label: 'TALESOFTHEOLDWEST.HorseBreed.appaloosa' },
	arabian: { id: 'arabian', label: 'TALESOFTHEOLDWEST.HorseBreed.arabian' },
	cayuse: { id: 'cayuse', label: 'TALESOFTHEOLDWEST.HorseBreed.cayuse' },
	criollo: { id: 'criollo', label: 'TALESOFTHEOLDWEST.HorseBreed.criollo' },
	missourifoxtrotter: { id: 'missourifoxtrotter', label: 'TALESOFTHEOLDWEST.HorseBreed.missourifoxtrotter' },
	morgan: { id: 'morgan', label: 'TALESOFTHEOLDWEST.HorseBreed.morgan' },
	mustang: { id: 'mustang', label: 'TALESOFTHEOLDWEST.HorseBreed.mustang' },
	paintpinto: { id: 'paintpinto', label: 'TALESOFTHEOLDWEST.HorseBreed.paintpinto' },
	palomino: { id: 'palomino', label: 'TALESOFTHEOLDWEST.HorseBreed.palomino' },
	tennesseewalker: { id: 'tennesseewalker', label: 'TALESOFTHEOLDWEST.HorseBreed.tennesseewalker' },
	donkeymule: { id: 'donkeymule', label: 'TALESOFTHEOLDWEST.HorseBreed.donkeymule' },
	other: { id: 'other', label: 'TALESOFTHEOLDWEST.Animals.other' },
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

TALESOFTHEOLDWEST.archetype_list = {
	Gentlefolk: { id: 'Gentlefolk', label: 'TALESOFTHEOLDWEST.Archetype.Gentlefolk' },
	Grifter: { id: 'Grifter', label: 'TALESOFTHEOLDWEST.Archetype.Grifter' },
	Homesteader: { id: 'Homesteader', label: 'TALESOFTHEOLDWEST.Archetype.Homesteader' },
	Laborer: { id: 'Laborer', label: 'TALESOFTHEOLDWEST.Archetype.Laborer' },
	Lawman: { id: 'Lawman', label: 'TALESOFTHEOLDWEST.Archetype.Lawman' },
	Outlaw: { id: 'Outlaw', label: 'TALESOFTHEOLDWEST.Archetype.Outlaw' },
	Prospector: { id: 'Prospector', label: 'TALESOFTHEOLDWEST.Archetype.Prospector' },
	RanchHand: { id: 'RanchHand', label: 'TALESOFTHEOLDWEST.Archetype.Ranchhand' },
	Tracker: { id: 'Tracker', label: 'TALESOFTHEOLDWEST.Archetype.Tracker' },
	Trader: { id: 'Trader', label: 'TALESOFTHEOLDWEST.Archetype.Trader' },
};

TALESOFTHEOLDWEST.group_concept_list = {
	LawmenBountyHunters: { id: 'Lawmen & Bounty Hunters', label: 'TALESOFTHEOLDWEST.GroupConcept.LawmenBountyHunters' },
	Outlaws: { id: 'Outlaws', label: 'TALESOFTHEOLDWEST.GroupConcept.Outlaws' },
	Ranchers: { id: 'Ranchers', label: 'TALESOFTHEOLDWEST.GroupConcept.Ranchers' },
	Farmers: { id: 'Farmers', label: 'TALESOFTHEOLDWEST.GroupConcept.Farmers' },
	BusinessOwners: { id: 'Business Owners', label: 'TALESOFTHEOLDWEST.GroupConcept.BusinessOwners' },
	VaquerosCowboys: { id: 'Vaqueros & Cowboys', label: 'TALESOFTHEOLDWEST.GroupConcept.VaquerosCowboys' },
	MountainFolk: { id: 'Mountain Folk', label: 'TALESOFTHEOLDWEST.GroupConcept.MountainFolk' },
};
TALESOFTHEOLDWEST.subtype_list = {
	fightin: { id: 'Fightin', label: 'TALESOFTHEOLDWEST.General.fightin' },
	shootin: { id: 'Shootin', label: 'TALESOFTHEOLDWEST.General.shootin' },
};
TALESOFTHEOLDWEST.action_list = {
	na: { id: 'na', label: 'TALESOFTHEOLDWEST.Actions.na' },
	single: { id: 'Single', label: 'TALESOFTHEOLDWEST.Actions.single' },
	double: { id: 'Double', label: 'TALESOFTHEOLDWEST.Actions.double' },
	lever: { id: 'Lever', label: 'TALESOFTHEOLDWEST.Actions.lever' },
	breech: { id: 'Breech', label: 'TALESOFTHEOLDWEST.Actions.breech' },
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
	short: { id: 'Short', label: 'TALESOFTHEOLDWEST.ModRanges.short', value: '0', selected: true },
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

TALESOFTHEOLDWEST.weapon_feature_list = {
	quality: { id: 'quality', label: 'TALESOFTHEOLDWEST.Item.General.quality' },
	condition: { id: 'condition', label: 'TALESOFTHEOLDWEST.Item.General.condition' },
};

TALESOFTHEOLDWEST.weapon_type_list = {
	ranged: { id: 'ranged', label: 'TALESOFTHEOLDWEST.Item.General.ranged' },
	melee: { id: 'melee', label: 'TALESOFTHEOLDWEST.Item.General.melee' },
};

TALESOFTHEOLDWEST.onweapon_list = {
	any: { id: 'any', label: 'TALESOFTHEOLDWEST.Item.General.any' },
	pistol: { id: 'pistol', label: 'TALESOFTHEOLDWEST.Item.General.pistol' },
	rifle: { id: 'rifle', label: 'TALESOFTHEOLDWEST.Item.General.rifle' },
	shotgun: { id: 'shotgun', label: 'TALESOFTHEOLDWEST.Item.General.shotgun' },
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

TALESOFTHEOLDWEST.Reputation = {
	oneone: { id: 'oneone', label: 'TALESOFTHEOLDWEST.Reputation.oneone' },
	onetwo: { id: 'onetwo', label: 'TALESOFTHEOLDWEST.Reputation.onetwo' },
	onethree: { id: 'onethree', label: 'TALESOFTHEOLDWEST.Reputation.onethree' },
	onefour: { id: 'onefour', label: 'TALESOFTHEOLDWEST.Reputation.onefour' },
	onefive: { id: 'onefive', label: 'TALESOFTHEOLDWEST.Reputation.onefive' },
	onesix: { id: 'onesix', label: 'TALESOFTHEOLDWEST.Reputation.onesix' },
	twoone: { id: 'twoone', label: 'TALESOFTHEOLDWEST.Reputation.twoone' },
	twotwo: { id: 'twotwo', label: 'TALESOFTHEOLDWEST.Reputation.twotwo' },
	twothree: { id: 'twothree', label: 'TALESOFTHEOLDWEST.Reputation.twothree' },
	twofour: { id: 'twofour', label: 'TALESOFTHEOLDWEST.Reputation.twofour' },
	twofive: { id: 'twofive', label: 'TALESOFTHEOLDWEST.Reputation.twofive' },
	twosix: { id: 'twosix', label: 'TALESOFTHEOLDWEST.Reputation.twosix' },
	threeone: { id: 'threeone', label: 'TALESOFTHEOLDWEST.Reputation.threeone' },
	threetwo: { id: 'threetwo', label: 'TALESOFTHEOLDWEST.Reputation.threetwo' },
	threethree: { id: 'threethree', label: 'TALESOFTHEOLDWEST.Reputation.threethree' },
	threefour: { id: 'threefour', label: 'TALESOFTHEOLDWEST.Reputation.threefour' },
	threefive: { id: 'threefive', label: 'TALESOFTHEOLDWEST.Reputation.threefive' },
	threesix: { id: 'threesix', label: 'TALESOFTHEOLDWEST.Reputation.threesix' },
	fourone: { id: 'fourone', label: 'TALESOFTHEOLDWEST.Reputation.fourone' },
	fourtwo: { id: 'fourtwo', label: 'TALESOFTHEOLDWEST.Reputation.fourtwo' },
	fourthree: { id: 'fourthree', label: 'TALESOFTHEOLDWEST.Reputation.fourthree' },
	fourfour: { id: 'fourfour', label: 'TALESOFTHEOLDWEST.Reputation.fourfour' },
	fourfive: { id: 'fourfive', label: 'TALESOFTHEOLDWEST.Reputation.fourfive' },
	foursix: { id: 'foursix', label: 'TALESOFTHEOLDWEST.Reputation.foursix' },
	fiveone: { id: 'fiveone', label: 'TALESOFTHEOLDWEST.Reputation.fiveone' },
	fivetwo: { id: 'fivetwo', label: 'TALESOFTHEOLDWEST.Reputation.fivetwo' },
	fivethree: { id: 'fivethree', label: 'TALESOFTHEOLDWEST.Reputation.fivethree' },
	fivefour: { id: 'fivefour', label: 'TALESOFTHEOLDWEST.Reputation.fivefour' },
	fivefive: { id: 'fivefive', label: 'TALESOFTHEOLDWEST.Reputation.fivefive' },
	fivesix: { id: 'fivesix', label: 'TALESOFTHEOLDWEST.Reputation.fivesix' },
	sixone: { id: 'sixone', label: 'TALESOFTHEOLDWEST.Reputation.sixone' },
	sixtwo: { id: 'sixtwo', label: 'TALESOFTHEOLDWEST.Reputation.sixtwo' },
	sixthree: { id: 'sixthree', label: 'TALESOFTHEOLDWEST.Reputation.sixthree' },
	sixfour: { id: 'sixfour', label: 'TALESOFTHEOLDWEST.Reputation.sixfour' },
	sixfive: { id: 'sixfive', label: 'TALESOFTHEOLDWEST.Reputation.sixfive' },
	sixsix: { id: 'sixsix', label: 'TALESOFTHEOLDWEST.Reputation.sixsix' },
};

TALESOFTHEOLDWEST.item_modifier_list = {
	grit: { id: 'attribute-grit', label: 'TALESOFTHEOLDWEST.Attributes.grit.name', group: 'TALESOFTHEOLDWEST.General.capAttributes' },
	quick: { id: 'attribute-quick', label: 'TALESOFTHEOLDWEST.Attributes.quick.name', group: 'TALESOFTHEOLDWEST.General.capAttributes' },
	cunning: { id: 'attribute-cunning', label: 'TALESOFTHEOLDWEST.Attributes.cunning.name', group: 'TALESOFTHEOLDWEST.General.capAttributes' },
	docity: { id: 'attribute-docity', label: 'TALESOFTHEOLDWEST.Attributes.docity.name', group: 'TALESOFTHEOLDWEST.General.capAttributes' },
	labor: { id: 'ability-labor', label: 'TALESOFTHEOLDWEST.Ability.Labor.long', group: 'TALESOFTHEOLDWEST.General.capAbilities' },
	presence: { id: 'ability-presence', label: 'TALESOFTHEOLDWEST.Ability.Presence.long', group: 'TALESOFTHEOLDWEST.General.capAbilities' },
	fightin: { id: 'ability-fightin', label: 'TALESOFTHEOLDWEST.Ability.Fightin.long', group: 'TALESOFTHEOLDWEST.General.capAbilities' },
	resilience: { id: 'ability-resilience', label: 'TALESOFTHEOLDWEST.Ability.Resilience.long', group: 'TALESOFTHEOLDWEST.General.capAbilities' },
	move: { id: 'ability-move', label: 'TALESOFTHEOLDWEST.Ability.Move.long', group: 'TALESOFTHEOLDWEST.General.capAbilities' },
	operate: { id: 'ability-operate', label: 'TALESOFTHEOLDWEST.Ability.Operate.long', group: 'TALESOFTHEOLDWEST.General.capAbilities' },
	shootin: { id: 'ability-shootin', label: 'TALESOFTHEOLDWEST.Ability.Shootin.long', group: 'TALESOFTHEOLDWEST.General.capAbilities' },
	lightfingered: { id: 'ability-lightfingered', label: 'TALESOFTHEOLDWEST.Ability.Lightfingered.long', group: 'TALESOFTHEOLDWEST.General.capAbilities' },
	hawkeye: { id: 'ability-hawkeye', label: 'TALESOFTHEOLDWEST.Ability.Hawkeye.long', group: 'TALESOFTHEOLDWEST.General.capAbilities' },
	nature: { id: 'ability-nature', label: 'TALESOFTHEOLDWEST.Ability.Nature.long', group: 'TALESOFTHEOLDWEST.General.capAbilities' },
	insight: { id: 'ability-insight', label: 'TALESOFTHEOLDWEST.Ability.Insight.long', group: 'TALESOFTHEOLDWEST.General.capAbilities' },
	animalhandlin: { id: 'ability-animalhandlin', label: 'TALESOFTHEOLDWEST.Ability.Animalhandlin.long', group: 'TALESOFTHEOLDWEST.General.capAbilities' },
	performin: { id: 'ability-dociperforminty', label: 'TALESOFTHEOLDWEST.Ability.Performin.long', group: 'TALESOFTHEOLDWEST.General.capAbilities' },
	makin: { id: 'ability-makin', label: 'TALESOFTHEOLDWEST.Ability.Makin.long', group: 'TALESOFTHEOLDWEST.General.capAbilities' },
	doctorin: { id: 'ability-doctorin', label: 'TALESOFTHEOLDWEST.Ability.Doctorin.long', group: 'TALESOFTHEOLDWEST.General.capAbilities' },
	booklearnin: { id: 'ability-booklearnin', label: 'TALESOFTHEOLDWEST.Ability.Booklearnin.long', group: 'TALESOFTHEOLDWEST.General.capAbilities' },
	ridingBonus: { id: 'riding-bonus', label: 'TALESOFTHEOLDWEST.General.riding-bonus', group: 'TALESOFTHEOLDWEST.General.other' },
	trouble: { id: 'roll-trouble', label: 'TALESOFTHEOLDWEST.General.trouble', group: 'TALESOFTHEOLDWEST.General.other' },
	success: { id: 'roll-success', label: 'TALESOFTHEOLDWEST.General.success', group: 'TALESOFTHEOLDWEST.General.other' },
	pushdescription: { id: 'roll-pushdescription', label: 'TALESOFTHEOLDWEST.General.pushdescription', group: 'TALESOFTHEOLDWEST.General.other' },
};
TALESOFTHEOLDWEST.weapon_modifier_list = {
	grit: { id: 'attribute-grit', label: 'TALESOFTHEOLDWEST.Attributes.grit.name', group: 'TALESOFTHEOLDWEST.General.capAttributes' },
	quick: { id: 'attribute-quick', label: 'TALESOFTHEOLDWEST.Attributes.quick.name', group: 'TALESOFTHEOLDWEST.General.capAttributes' },
	cunning: { id: 'attribute-cunning', label: 'TALESOFTHEOLDWEST.Attributes.cunning.name', group: 'TALESOFTHEOLDWEST.General.capAttributes' },
	docity: { id: 'attribute-docity', label: 'TALESOFTHEOLDWEST.Attributes.docity.name', group: 'TALESOFTHEOLDWEST.General.capAttributes' },
	labor: { id: 'ability-labor', label: 'TALESOFTHEOLDWEST.Ability.Labor.long', group: 'TALESOFTHEOLDWEST.General.capAbilities' },
	presence: { id: 'ability-presence', label: 'TALESOFTHEOLDWEST.Ability.Presence.long', group: 'TALESOFTHEOLDWEST.General.capAbilities' },
	fightin: { id: 'ability-fightin', label: 'TALESOFTHEOLDWEST.Ability.Fightin.long', group: 'TALESOFTHEOLDWEST.General.capAbilities' },
	resilience: { id: 'ability-resilience', label: 'TALESOFTHEOLDWEST.Ability.Resilience.long', group: 'TALESOFTHEOLDWEST.General.capAbilities' },
	move: { id: 'ability-move', label: 'TALESOFTHEOLDWEST.Ability.Move.long', group: 'TALESOFTHEOLDWEST.General.capAbilities' },
	operate: { id: 'ability-operate', label: 'TALESOFTHEOLDWEST.Ability.Operate.long', group: 'TALESOFTHEOLDWEST.General.capAbilities' },
	shootin: { id: 'ability-shootin', label: 'TALESOFTHEOLDWEST.Ability.Shootin.long', group: 'TALESOFTHEOLDWEST.General.capAbilities' },
	lightfingered: { id: 'ability-lightfingered', label: 'TALESOFTHEOLDWEST.Ability.Lightfingered.long', group: 'TALESOFTHEOLDWEST.General.capAbilities' },
	hawkeye: { id: 'ability-hawkeye', label: 'TALESOFTHEOLDWEST.Ability.Hawkeye.long', group: 'TALESOFTHEOLDWEST.General.capAbilities' },
	nature: { id: 'ability-nature', label: 'TALESOFTHEOLDWEST.Ability.Nature.long', group: 'TALESOFTHEOLDWEST.General.capAbilities' },
	insight: { id: 'ability-insight', label: 'TALESOFTHEOLDWEST.Ability.Insight.long', group: 'TALESOFTHEOLDWEST.General.capAbilities' },
	animalhandlin: { id: 'ability-animalhandlin', label: 'TALESOFTHEOLDWEST.Ability.Animalhandlin.long', group: 'TALESOFTHEOLDWEST.General.capAbilities' },
	performin: { id: 'ability-dociperforminty', label: 'TALESOFTHEOLDWEST.Ability.Performin.long', group: 'TALESOFTHEOLDWEST.General.capAbilities' },
	makin: { id: 'ability-makin', label: 'TALESOFTHEOLDWEST.Ability.Makin.long', group: 'TALESOFTHEOLDWEST.General.capAbilities' },
	doctorin: { id: 'ability-doctorin', label: 'TALESOFTHEOLDWEST.Ability.Doctorin.long', group: 'TALESOFTHEOLDWEST.General.capAbilities' },
	booklearnin: { id: 'ability-booklearnin', label: 'TALESOFTHEOLDWEST.Ability.Booklearnin.long', group: 'TALESOFTHEOLDWEST.General.capAbilities' },
	attackbonus: { id: 'weapon-attackbonus', label: 'TALESOFTHEOLDWEST.Item.General.attackBonus', group: 'TALESOFTHEOLDWEST.General.weaponStats' },
	damage: { id: 'weapon-damage', label: 'TALESOFTHEOLDWEST.General.damage', group: 'TALESOFTHEOLDWEST.General.weaponStats' },
	crit: { id: 'weapon-drit', label: 'TALESOFTHEOLDWEST.General.crit', group: 'TALESOFTHEOLDWEST.General.weaponStats' },
	drawbonus: { id: 'weapon-drawbonus', label: 'TALESOFTHEOLDWEST.Item.General.bonusDraw', group: 'TALESOFTHEOLDWEST.General.weaponStats' },
	trouble: { id: 'roll-trouble', label: 'TALESOFTHEOLDWEST.General.trouble', group: 'TALESOFTHEOLDWEST.General.other' },
	success: { id: 'roll-success', label: 'TALESOFTHEOLDWEST.General.success', group: 'TALESOFTHEOLDWEST.General.other' },
	pushdescription: { id: 'roll-pushdescription', label: 'TALESOFTHEOLDWEST.General.pushdescription', group: 'TALESOFTHEOLDWEST.General.other' },
};

TALESOFTHEOLDWEST.crit_location_list = {
	lowerleg: { id: 'lowerleg', label: 'TALESOFTHEOLDWEST.CritLocation.lowerleg' },
	upperleg: { id: 'upperleg', label: 'TALESOFTHEOLDWEST.CritLocation.upperleg' },
	arm: { id: 'arm', label: 'TALESOFTHEOLDWEST.CritLocation.arm' },
	gut: { id: 'gut', label: 'TALESOFTHEOLDWEST.CritLocation.gut' },
	chest: { id: 'chest', label: 'TALESOFTHEOLDWEST.CritLocation.chest' },
	head: { id: 'head', label: 'TALESOFTHEOLDWEST.CritLocation.head' },
};

TALESOFTHEOLDWEST.item_modifier_state = {
	Active: { label: 'TALESOFTHEOLDWEST.General.active' },
	Conditional: { label: 'TALESOFTHEOLDWEST.General.conditional' },
	Chat: { label: 'TALESOFTHEOLDWEST.General.chat' },
};
TALESOFTHEOLDWEST.animal_quality_modifier_state = {
	onAnimal: { label: 'TALESOFTHEOLDWEST.General.onAnimal' },
	Conditional: { label: 'TALESOFTHEOLDWEST.General.conditional' },
	onPC: { label: 'TALESOFTHEOLDWEST.General.onPC' },
};

TALESOFTHEOLDWEST.conditionEffects = [
	{
		id: 'starving',
		name: 'TALESOFTHEOLDWEST.Conditions.Starving',
		label: 'TALESOFTHEOLDWEST.Conditions.Starving',
		icon: 'systems/talesoftheoldwest/assets/icons/starving.webp',
	},
	{
		id: 'dehydrated',
		name: 'TALESOFTHEOLDWEST.Conditions.Dehydrated',
		label: 'TALESOFTHEOLDWEST.Conditions.Dehydrated',
		icon: 'systems/talesoftheoldwest/assets/icons/water-flask.webp',
	},
	{
		id: 'exhausted',
		name: 'TALESOFTHEOLDWEST.Conditions.Exhausted',
		label: 'TALESOFTHEOLDWEST.Conditions.Exhausted',
		icon: 'systems/talesoftheoldwest/assets/icons/exhausted.webp',
	},
	{
		id: 'freezing',
		name: 'TALESOFTHEOLDWEST.Conditions.Freezing',
		label: 'TALESOFTHEOLDWEST.Conditions.Freezing',
		icon: 'systems/talesoftheoldwest/assets/icons/freezing.webp',
	},
	{
		id: 'overwatch',
		name: 'TALESOFTHEOLDWEST.Conditions.Overwatch',
		label: 'TALESOFTHEOLDWEST.Conditions.Overwatch',
		icon: 'systems/talesoftheoldwest/assets/icons/overwatch.webp',
	},
	{
		id: 'heatstroke',
		name: 'TALESOFTHEOLDWEST.Conditions.Heatstroke',
		label: 'TALESOFTHEOLDWEST.Conditions.Heatstroke',
		icon: 'systems/talesoftheoldwest/assets/icons/overwatch.webp',
	},
	{
		id: 'criticalinj',
		name: 'TALESOFTHEOLDWEST.General.criticalInjury',
		label: 'TALESOFTHEOLDWEST.General.criticalInjury',
		icon: 'icons/skills/wounds/injury-pain-body-orange.webp',
	},
];

TALESOFTHEOLDWEST.physicalItems = [];
