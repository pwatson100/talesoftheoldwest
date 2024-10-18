import totowActorBase from './actor-base.mjs';

export default class totowNPC extends totowActorBase {
	static defineSchema() {
		const fields = foundry.data.fields;
		const requiredInteger = { required: true, nullable: false, integer: true };
		const schema = super.defineSchema();

		// Iterate over attribute names and create a new SchemaField for each.
		schema.attributes = new fields.SchemaField(
			Object.keys(CONFIG.TALESOFTHEOLDWEST.attributes).reduce((obj, attribute) => {
				obj[attribute] = new fields.SchemaField({
					value: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0, max: 5 }),
					mod: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
					max: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
					label: new fields.StringField({ required: true, blank: true }),
				});
				return obj;
			}, {})
		);
		// Iterate over ability names and create a new SchemaField for each.
		schema.abilities = new fields.SchemaField(
			Object.keys(CONFIG.TALESOFTHEOLDWEST.abilities).reduce((obj, ability) => {
				obj[ability] = new fields.SchemaField({
					value: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0, max: 5 }),
					mod: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
					total: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
					label: new fields.StringField({ required: true, blank: true }),
					attr: new fields.StringField({ required: true, blank: true }),
				});
				return obj;
			}, {})
		);

		return schema;
	}

	prepareDerivedData() {
		for (const akey in this.attributes) {
			this.attributes[akey].label = game.i18n.localize(CONFIG.TALESOFTHEOLDWEST.attributes[akey].name) ?? akey;
		}

		for (const key in this.abilities) {
			this.abilities[key].attr = game.i18n.localize(CONFIG.TALESOFTHEOLDWEST.abilities[key].atob) ?? key;
			// Calculate the modifier using d20 rules.
			this.abilities[key].total = this.abilities[key].value + this.abilities[key].mod + this.attributes[CONFIG.TALESOFTHEOLDWEST.abilities[key].atob].value;
			// Handle ability label localization.
			this.abilities[key].label = game.i18n.localize(CONFIG.TALESOFTHEOLDWEST.abilities[key].name) ?? key;
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

		// data.lvl = this.attributes.level.value;
		return data;
	}
}
