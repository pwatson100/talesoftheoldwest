import totowCreatureBase from './creature-base.mjs';

/**
 * Row = publicspirit (1–6), Column = morals (1–6).
 * Each entry is the key used in CONFIG.TALESOFTHEOLDWEST.Reputation[key].label.
 */
const REPUTATION_KEYS = [
	['oneone',   'onetwo',   'onethree',   'onefour',   'onefive',   'onesix'  ],
	['twoone',   'twotwo',   'twothree',   'twofour',   'twofive',   'twosix'  ],
	['threeone', 'threetwo', 'threethree', 'threefour', 'threefive', 'threesix'],
	['fourone',  'fourtwo',  'fourthree',  'fourfour',  'fourfive',  'foursix' ],
	['fiveone',  'fivetwo',  'fivethree',  'fivefour',  'fivefive',  'fivesix' ],
	['sixone',   'sixtwo',   'sixthree',   'sixfour',   'sixfive',   'sixsix'  ],
];

export default class totowPC extends totowCreatureBase {
	static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, 'TALESOFTHEOLDWEST.Actor.PC'];

	static defineSchema() {
		const fields = foundry.data.fields;
		const requiredInteger = { required: true, nullable: false, integer: true };
		const schema = super.defineSchema();

		schema.general = new fields.SchemaField({
			archetype: new fields.StringField({ required: true, blank: true }),
			groupconcept: new fields.StringField({ required: true, blank: true }),
			faith: new fields.StringField({ required: true, blank: true }),
			bigdream: new fields.StringField({ required: true, blank: true }),
			yourpardner: new fields.StringField({ required: true, blank: true }),
			lifestyle: new fields.StringField({ required: true, blank: true }),
			reputation: new fields.StringField({ required: false, blank: true }),
			cash: new fields.StringField({ initial: '0', min: 0, required: false, blank: true }),
			capital: new fields.StringField({ initial: '0', min: 0, required: false, blank: true }),

			faithpoints: new fields.SchemaField({
				value: new fields.NumberField({ ...requiredInteger, initial: 4, min: 0, max: 10 }),
				max: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0, max: 10 }),
			}),
			age: new fields.SchemaField({
				value: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
			}),
			fame: new fields.SchemaField({
				value: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
			}),
			morals: new fields.SchemaField({
				value: new fields.NumberField({ ...requiredInteger, initial: 3, min: 1, max: 6 }),
			}),
			publicspirit: new fields.SchemaField({
				value: new fields.NumberField({ ...requiredInteger, initial: 3, min: 1, max: 6 }),
			}),
			xp: new fields.SchemaField({
				value: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
				max: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
			}),
			canPush: new fields.StringField({ required: true, initial: 'push' }),
		});
		schema.compadres = new fields.SchemaField({
			details: new fields.ArrayField(
				new fields.SchemaField({
					id: new fields.StringField({ required: true, blank: false }),
				})
			),
			compadresQty: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0, max: 3 }),
		});
		schema.remuda = new fields.SchemaField({
			details: new fields.ArrayField(
				new fields.SchemaField({
					id: new fields.StringField({ required: true, blank: false }),
				})
			),
			remudaQty: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0, max: 3 }),
			remudaMounted: new fields.StringField({ required: true, blank: false, initial: 'false' }),
		});

		return schema;
	}

	prepareDerivedData() {
		super.prepareDerivedData();

		this.general.faithpoints.max = 10 - this.general.faithpoints.value;
		this.general.xp.max = 10 - this.general.xp.value;

		const x = this.general.publicspirit.value;
		const y = this.general.morals.value;
		const key = REPUTATION_KEYS[x - 1]?.[y - 1];
		this.general.reputation = key
			? game.i18n.localize(CONFIG.TALESOFTHEOLDWEST.Reputation[key].label)
			: '';
	}
}
