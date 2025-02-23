const { JSONField, StringField } = foundry.data.fields;
const { DialogV2 } = foundry.applications.api;

// creating the input/textarea for the dialog.
const nameInput = new StringField({
	label: 'Journal Name',
}).toFormGroup({}, { name: 'name', autofocus: true }).outerHTML;
const textInput = new JSONField({
	label: 'Content',
}).toFormGroup({ classes: ['stacked'] }, { name: 'content' }).outerHTML;

// DialogV2 that creates the data used to make the journal entry + contents
const data = await DialogV2.prompt({
	position: { width: 800 },
	content: '<fieldset>' + nameInput + '</fieldset>' + '<fieldset>' + textInput + '</fieldset>',
	ok: {
		callback: (event, button) => new FormDataExtended(button.form).object,
	},
	rejectClose: false,
});

if (!data) return;
if (!data.name) return ui.notifications.warn('No Journal Entry given, process aborted.');

// creating the journal entry + page.
const j = await JournalEntry.create({ name: data.name });
await JournalEntryPage.create(
	{
		name: data.name,
		text: {
			markdown: data.content,
			format: CONST.JOURNAL_ENTRY_PAGE_FORMATS.MARKDOWN,
		},
	},
	{ parent: j }
);

// Shootin' Qualities
const data = [
	{
		type: 'weaponquality',
		name: 'Calibrated',
		'system.weapontype': 'ranged',
		'system.feature': 'quality',
		'system.onweapon': 'pistol',
		'system.description': 'The weapon is so well calibrated its aim is true. Gain +1 bonus to the weapon’s Attack modifier. ',
	},
	{
		type: 'weaponquality',
		name: 'Concealable',
		'system.weapontype': 'ranged',
		'system.feature': 'quality',
		'system.onweapon': 'pistol',
		'system.description':
			'Small and compact, a pistol with this quality is easily concealed about your person. Those trying to spot it get a −1 penalty on their HAWKEYE test.',
	},
	{
		type: 'weaponquality',
		name: 'Fanning',
		'system.weapontype': 'ranged',
		'system.feature': 'quality',
		'system.onweapon': 'pistol',
		'system.description': 'The gun is ideal for fanning. You gain a +1 bonus to your SHOOTIN’ ability when fanning with this weapon.',
	},
	{
		type: 'weaponquality',
		name: 'Fast Draw',
		'system.weapontype': 'ranged',
		'system.feature': 'quality',
		'system.onweapon': 'pistol',
		'system.description': 'The weapon is designed for the quick draw. You gain a +1 bonus to the Draw.',
	},
	{
		type: 'weaponquality',
		name: 'Heavy',
		'system.weapontype': 'ranged',
		'system.feature': 'quality',
		'system.onweapon': 'pistol',
		'system.description':
			'The pistol is heavy in your hand and kicks like a mule but delivers a powerful blast. It does +1 extra damage, but has a −1 penalty to Draw.',
	},
	{
		type: 'weaponquality',
		name: 'Hidden',
		'system.weapontype': 'ranged',
		'system.feature': 'quality',
		'system.onweapon': 'pistol',
		'system.description': 'A palm-sized gun designed for concealment. Those trying to spot it suffer a −3 penalty on their HAWKEYE test.',
	},
	{
		type: 'weaponquality',
		name: 'Hot Loader',
		'system.weapontype': 'ranged',
		'system.feature': 'quality',
		'system.onweapon': 'pistol',
		'system.description':
			'Loading is slow, so anything that makes it quicker can only be a good thing. This gun has a swappable revolver cylinder (2 actions for full reload).',
	},
	{
		type: 'weaponquality',
		name: 'Light',
		'system.weapontype': 'ranged',
		'system.feature': 'quality',
		'system.onweapon': 'pistol',
		'system.description': 'The weapon is very small and counts as a Tiny item, but it’s not made for fast drawing so you suffer a −1 penalty on the Draw.',
	},
	{
		type: 'weaponquality',
		name: 'Long Barrel',
		'system.weapontype': 'ranged',
		'system.feature': 'quality',
		'system.onweapon': 'pistol',
		'system.description': 'A long barrel makes gunplay easier, but it’s slower on the draw. Gain a +1 bonus to SHOOTIN’, but a −1 penalty on the Draw.',
	},
	{
		type: 'weaponquality',
		name: 'Short Barrel',
		'system.weapontype': 'ranged',
		'system.feature': 'quality',
		'system.onweapon': 'pistol',
		'system.description':
			'A short barrel isn’t great for accuracy, but it’s quicker to get that iron from your holster. Gain a +1 bonus on Draw, but a −1 penalty on SHOOTIN’.',
	},
	{
		type: 'weaponquality',
		name: 'Sights',
		'system.weapontype': 'ranged',
		'system.feature': 'quality',
		'system.onweapon': 'pistol',
		'system.description':
			'Well-made sights make shooting at range easy. Range negatives are one die less for all ranges when using an Aim action before making a shot.',
	},
	{
		type: 'weaponquality',
		name: 'Balanced',
		'system.weapontype': 'ranged',
		'system.feature': 'quality',
		'system.onweapon': 'any',
		'system.description': 'The weapon feels good in your hand and you can’t help but shoot straight with it. Grants a +1 bonus to SHOOTIN’.',
	},
	{
		type: 'weaponquality',
		name: 'Maintained',
		'system.weapontype': 'ranged',
		'system.feature': 'quality',
		'system.onweapon': 'any',
		'system.description':
			'Beautifully made with maintenance in mind, this weapon is easy to keep working. Once per scene you may reroll all Trouble dice showing a ‘1’, but only before pushing.',
	},
	{
		type: 'weaponquality',
		name: 'Piercing',
		'system.weapontype': 'ranged',
		'system.feature': 'quality',
		'system.onweapon': 'any',
		'system.description': 'The weapon is renowned for being deadly in the hands of an expert. Gain +1 to the Units die on critical injury rolls.',
	},
	{
		type: 'weaponquality',
		name: 'Powerful',
		'system.weapontype': 'ranged',
		'system.feature': 'quality',
		'system.onweapon': 'any',
		'system.description': 'The weapon packs a real punch. Grants +1 to the weapon’s Damage.',
	},
	{
		type: 'weaponquality',
		name: 'Reliable',
		'system.weapontype': 'ranged',
		'system.feature': 'quality',
		'system.onweapon': 'any',
		'system.description':
			'Tough and sturdy, this weapon is reliable and just doesn’t break. If Trouble is rolled while using this weapon, the amount of Trouble is reduced by 1, to a minimum of 1.',
	},
	{
		type: 'weaponquality',
		name: 'Sawn-Off',
		'system.weapontype': 'ranged',
		'system.feature': 'quality',
		'system.onweapon': 'shotgun',
		'system.description':
			'A short-barreled shotgun is deadly in close quarters, but terrible further away. Grants a +1 bonus to SHOOTIN’ but the maximum range is Short.',
	},
];
// All Conditions
const data = [
	{
		type: 'weaponquality',
		name: 'Dirty',
		'system.weapontype': 'ranged',
		'system.feature': 'condition',
		'system.onweapon': 'any',
		'system.description': 'When you attack with this weapon your final total of successes is reduced by 1, to a minimum of 0.',
	},
	{
		type: 'weaponquality',
		name: 'Damaged Bore',
		'system.weapontype': 'ranged',
		'system.feature': 'condition',
		'system.onweapon': 'any',
		'system.description': 'The weapon is low powered. The damage rating is reduced by 1, to a minimum of 1.',
	},
	{
		type: 'weaponquality',
		name: 'Hard To Load',
		'system.weapontype': 'ranged',
		'system.feature': 'condition',
		'system.onweapon': 'any',
		'system.description': 'Loading takes an extra action per bullet.',
	},
	{
		type: 'weaponquality',
		name: 'Greasy',
		'system.weapontype': 'ranged',
		'system.feature': 'condition',
		'system.onweapon': 'any',
		'system.description': 'The weapon loses its punch, and its Crit Rating is increased by 1.',
	},
	{
		type: 'weaponquality',
		name: 'Misaligned',
		'system.weapontype': 'ranged',
		'system.feature': 'condition',
		'system.onweapon': 'any',
		'system.description': 'The weapon ain’t shootin’ straight. Suffer a −1 penalty on SHOOTIN’ rolls.',
	},
	{
		type: 'weaponquality',
		name: 'Weak Hammer',
		'system.weapontype': 'ranged',
		'system.feature': 'condition',
		'system.onweapon': 'pistol',
		'system.description': 'If the weapon suffers Trouble twice in the same scene it breaks beyond repair.',
	},
	{
		type: 'weaponquality',
		name: 'Blunt',
		'system.weapontype': 'meleee',
		'system.feature': 'condition',
		'system.onweapon': 'any',
		'system.description': 'When you attack with this weapon your final total of successes is reduced by 1, to a minimum of 0.',
	},
	{
		type: 'weaponquality',
		name: 'Loose Handle',
		'system.weapontype': 'melee',
		'system.feature': 'condition',
		'system.onweapon': 'any',
		'system.description': 'The weapon loses its punch, and its Crit Rating is increased by 1.',
	},
	{
		type: 'weaponquality',
		name: 'Bent',
		'system.weapontype': 'melee',
		'system.feature': 'condition',
		'system.onweapon': 'any',
		'system.description': 'The weapon is bent or twisted, and harder to handle. Suffer a −1 penalty to FIGHTIN’ rolls.',
	},
	{
		type: 'weaponquality',
		name: 'Hard To Hold',
		'system.weapontype': 'melee',
		'system.feature': 'condition',
		'system.onweapon': 'any',
		'system.description': 'When you suffer Trouble after a pushed roll, add +1 to the Trouble total when using this weapon.',
	},
	{
		type: 'weaponquality',
		name: 'Chipped',
		'system.weapontype': 'melee',
		'system.feature': 'condition',
		'system.onweapon': 'any',
		'system.description': 'Your weapon loses a random weapon quality.',
	},
	{
		type: 'weaponquality',
		name: 'Weakened',
		'system.weapontype': 'melee',
		'system.feature': 'condition',
		'system.onweapon': 'any',
		'system.description': 'If the weapon suffers Trouble twice in the same scene it breaks beyond repair.',
	},
];

// melee Quality
const data = [
	{
		type: 'weaponquality',
		name: 'Balanced',
		'system.weapontype': 'melee',
		'system.feature': 'quality',
		'system.onweapon': 'any',
		'system.description': 'The weapon feels good in your hand and you can’t help but shoot straight with it. Grants a +1 bonus to SHOOTIN’.',
	},
	{
		type: 'weaponquality',
		name: 'Forgiving',
		'system.weapontype': 'melee',
		'system.feature': 'quality',
		'system.onweapon': 'any',
		'system.description':
			'The weapon is reliable and easy to use. You can ignore one die of Trou- ble on your first roll when using this weapon as if you had spent a point of Faith (but not after a pushed roll).',
	},
	{
		type: 'weaponquality',
		name: 'Mounted',
		'system.weapontype': 'melee',
		'system.feature': 'quality',
		'system.onweapon': 'any',
		'system.description':
			'This weapon is especially deadly when used from horseback. After a pushed roll, when mounted, you can push again for free, although Trou- ble still applies.',
	},
	{
		type: 'weaponquality',
		name: 'Piercing',
		'system.weapontype': 'melee',
		'system.feature': 'quality',
		'system.onweapon': 'any',
		'system.description': 'The weapon is renowned for being deadly in the hands of an expert. Grants +1 to the Units die on critical injury rolls.',
	},
	{
		type: 'weaponquality',
		name: 'Sharpened ',
		'system.weapontype': 'melee',
		'system.feature': 'quality',
		'system.onweapon': 'any',
		'system.description': 'The weapon is made to inflict as much damage as possible. Gain +1 to the weapon’s Damage.',
	},
	{
		type: 'weaponquality',
		name: 'Sleek',
		'system.weapontype': 'melee',
		'system.feature': 'quality',
		'system.onweapon': 'pistol',
		'system.description': 'It’s designed to be drawn fast. You can draw this weapon as a free action.',
	},
	{
		type: 'weaponquality',
		name: 'Toughened',
		'system.weapontype': 'melee',
		'system.feature': 'quality',
		'system.onweapon': 'pistol',
		'system.description': 'The weapon cannot be broken by the outcome of Trouble.',
	},
	{
		type: 'weaponquality',
		name: 'Weighted',
		'system.weapontype': 'melee',
		'system.feature': 'quality',
		'system.onweapon': 'any',
		'system.description': 'The weapon is beautifully weighted to give you an advantage in the fight. Gain a +1 bonus to FIGHTIN’.',
	},
];
