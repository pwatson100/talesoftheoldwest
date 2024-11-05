export default class totowActorBase extends foundry.abstract.TypeDataModel {
	static LOCALIZATION_PREFIXES = ['TALESOFTHEOLDWEST.Actor.base'];

	static defineSchema() {
		const fields = foundry.data.fields;
		const requiredInteger = { required: true, nullable: false, integer: true };
		const schema = {};

		schema.biography = new fields.HTMLField();

		return schema;
	}
}
