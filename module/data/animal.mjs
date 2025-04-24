import totowActorBase from './actor-base.mjs';

export default class totowANIMAL extends totowActorBase {
	static defineSchema() {
		const fields = foundry.data.fields;
		const requiredInteger = { required: true, nullable: false, integer: true };
		const schema = super.defineSchema();

		schema.attributes = new fields.SchemaField({
			grit: new fields.SchemaField({
				value: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0, max: 5 }),
				mod: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
				max: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
				label: new fields.StringField({ required: true, blank: true }),
			}),
			quick: new fields.SchemaField({
				value: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0, max: 5 }),
				mod: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
				max: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
				label: new fields.StringField({ required: true, blank: true }),
			}),
			cunning: new fields.SchemaField({
				value: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0, max: 5 }),
				mod: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
				max: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
				label: new fields.StringField({ required: true, blank: true }),
			}),
		});
		schema.abilities = new fields.SchemaField({
			resilience: new fields.SchemaField({
				value: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0, max: 5 }),
				mod: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
				max: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
				label: new fields.StringField({ required: true, blank: true }),
				total: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
				upper: new fields.StringField({ required: true, blank: true }),
				attr: new fields.StringField({ required: true, blank: true }),
			}),
			fightin: new fields.SchemaField({
				value: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0, max: 5 }),
				mod: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
				max: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
				label: new fields.StringField({ required: true, blank: true }),
				total: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
				upper: new fields.StringField({ required: true, blank: true }),
				attr: new fields.StringField({ required: true, blank: true }),
			}),
			move: new fields.SchemaField({
				value: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0, max: 5 }),
				mod: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
				max: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
				label: new fields.StringField({ required: true, blank: true }),
				total: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
				upper: new fields.StringField({ required: true, blank: true }),
				attr: new fields.StringField({ required: true, blank: true }),
			}),
			hawkeye: new fields.SchemaField({
				value: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0, max: 5 }),
				mod: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
				max: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
				label: new fields.StringField({ required: true, blank: true }),
				total: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
				upper: new fields.StringField({ required: true, blank: true }),
				attr: new fields.StringField({ required: true, blank: true }),
			}),
		});

		schema.general = new fields.SchemaField({
			breed: new fields.StringField({ required: true, blank: true }),
			cost: new fields.StringField({ initial: '0', min: 0, required: false, blank: true }),
			attacks: new fields.HTMLField(),
			subtype: new fields.StringField({ required: false, blank: true, initial: 'horse' }),

			ridingmodifier: new fields.SchemaField({
				value: new fields.NumberField({ ...requiredInteger, initial: 0 }),
			}),
		});
		return schema;
	}

	prepareDerivedData() {
		for (const akey in this.attributes) {
			this.attributes[akey].label = game.i18n.localize(CONFIG.TALESOFTHEOLDWEST.attributes[akey].name) ?? akey;
		}

		for (const key in this.abilities) {
			this.abilities[key].attr = game.i18n.localize(CONFIG.TALESOFTHEOLDWEST.animalabilities[key].atob) ?? key;

			// Handle ability label localization.
			this.abilities[key].label = game.i18n.localize(CONFIG.TALESOFTHEOLDWEST.animalabilities[key].name) ?? key;
			this.abilities[key].upper = game.i18n.localize(CONFIG.TALESOFTHEOLDWEST.animalabilities[key].name).toUpperCase() ?? key;
		}
	}
	getRollData() {
		const data = {};

		// Copy the ability scores to the top level, so that rolls can use
		// formulas like `@str.mod + 4`.
		if (this.abilities) {
			for (let [k, v] of Object.entries(this.abilities)) {
				data[k] = foundry.utils.deepClone(v);
			}
		}
		if (this.attributes) {
			for (let [k, v] of Object.entries(this.attributes)) {
				data[k] = foundry.utils.deepClone(v);
			}
		}

		return data;
	}
}
