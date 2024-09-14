export default class TOTOWActorBase extends foundry.abstract.TypeDataModel {
	static defineSchema() {
		const fields = foundry.data.fields;
		const requiredInteger = { required: true, nullable: false, integer: true };
		const schema = {};

		// // Iterate over attribute names and create a new SchemaField for each.
		// schema.attributes = new fields.SchemaField(
		// 	Object.keys(CONFIG.TALES_OF_THE_OLD_WEST.attributes).reduce((obj, attribute) => {
		// 		obj[attribute] = new fields.SchemaField({
		// 			value: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0, max: 5 }),
		// 			mod: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
		// 			max: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
		// 			label: new fields.StringField({ required: true, blank: true }),
		// 		});
		// 		return obj;
		// 	}, {})
		// );

		schema.biography = new fields.StringField({ required: true, blank: true }); // equivalent to passing ({initial: ""}) for StringFields
		return schema;
	}
}
