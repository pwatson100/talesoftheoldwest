import totowItemBase from './item-base.mjs';

export default class totowWeapon extends totowItemBase {
	static defineSchema() {
		const fields = foundry.data.fields;
		const requiredInteger = { required: true, nullable: false, integer: true };
		const schema = super.defineSchema();
		schema.subtype = new fields.StringField({ required: true, blank: true, initial: 'fightin' });
		schema.conditionNames = new fields.StringField({ required: false, blank: true, initial: '' });
		schema.action = new fields.StringField({ required: true, blank: true, initial: 'na' });
		schema.bonusdraw = new fields.NumberField({ ...requiredInteger, initial: 0 });
		schema.attackbonus = new fields.NumberField({ ...requiredInteger, initial: 0 });
		schema.damage = new fields.NumberField({ ...requiredInteger, initial: 0 });
		schema.crit = new fields.NumberField({ ...requiredInteger, initial: 0 });
		schema.range = new fields.StringField({ required: true, blank: true, initial: 'armslength' });
		schema.ammo = new fields.NumberField({ ...requiredInteger, initial: 0 });
		schema.featureModifiers = new fields.ArrayField(
			new fields.SchemaField({
				id: new fields.StringField({ required: true, blank: false }),
				name: new fields.StringField({ required: true, blank: false }),
				feature: new fields.StringField({ required: true, blank: false }),
				type: new fields.StringField({ required: true, blank: false }),
				description: new fields.StringField({ required: true, blank: false }),
				onweapon: new fields.StringField({ required: true, blank: false }),
				img: new fields.StringField({ required: true, blank: false }),
				itemModifiers: new fields.ObjectField({ nullable: true }),
			})
		);

		// Break down roll formula into three independent fields
		// schema.roll = new fields.SchemaField({
		// 	diceNum: new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 }),
		// 	diceSize: new fields.StringField({ initial: 'd20' }),
		// 	diceBonus: new fields.StringField({ initial: '+@str.mod+ceil(@lvl / 2)' }),
		// });

		// schema.formula = new fields.StringField({ blank: true });

		return schema;
	}

	prepareDerivedData() {}
}
