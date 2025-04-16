import totowItemBase from './item-base.mjs';

export default class totowAnimalQuality extends totowItemBase {
	static defineSchema() {
		const fields = foundry.data.fields;
		const requiredInteger = { required: true, nullable: false, integer: true };
		const schema = super.defineSchema();

		schema.general = new fields.SchemaField({
			subtype: new fields.StringField({ required: false, blank: true, initial: 'quality' }),
		});
		return schema;
	}

	prepareDerivedData() {}
}
