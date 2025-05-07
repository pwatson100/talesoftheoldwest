export default class totowItemBase extends foundry.abstract.TypeDataModel {
	static defineSchema() {
		const fields = foundry.data.fields;
		const schema = {};

		schema.description = new fields.HTMLField();
		schema.itemModifiers = new fields.ObjectField({ nullable: true });
		schema.reference = new fields.StringField({ required: false });
		schema.weight = new fields.NumberField({ initial: 0, min: 0 });
		schema.cost = new fields.StringField({ required: false, blank: true, initial: '0' });
		schema.stored = new fields.BooleanField({ initial: false });
		return schema;
	}
}
