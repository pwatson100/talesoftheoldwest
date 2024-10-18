export default class totowItemBase extends foundry.abstract.TypeDataModel {
	static defineSchema() {
		const fields = foundry.data.fields;
		const schema = {};

		schema.description = new fields.HTMLField();
		schema.itemModifiers = new fields.ObjectField({ nullable: true });
		// { fred: new fields.StringField({ required: true, blank: true }) }

		// new StringField()
		return schema;
	}
}
