import totowItemBase from './item-base.mjs';

export default class totowAmenities extends totowItemBase {
	static defineSchema() {
		const fields = foundry.data.fields;
		const requiredInteger = { required: true, nullable: false, integer: true };
		const schema = super.defineSchema();
		schema.subtype = new fields.StringField({ required: true, blank: true, initial: 'farming' });
		schema.rank = new fields.StringField({ required: true, blank: true, initial: 'none' });
		schema.completed = new fields.BooleanField({ initial: false });
		schema.year = new fields.StringField({ required: true, blank: true });
		schema.season = new fields.StringField({ required: true, blank: true });

		schema.modifiers = new fields.SchemaField({
			farming: new fields.NumberField({ ...requiredInteger, initial: 0 }),
			mercantile: new fields.NumberField({ ...requiredInteger, initial: 0 }),
			natural: new fields.NumberField({ ...requiredInteger, initial: 0 }),
			law: new fields.NumberField({ ...requiredInteger, initial: 0 }),
			civic: new fields.NumberField({ ...requiredInteger, initial: 0 }),
			welfare: new fields.NumberField({ ...requiredInteger, initial: 0 }),
		});

		return schema;
	}

	prepareDerivedData() {}
}
