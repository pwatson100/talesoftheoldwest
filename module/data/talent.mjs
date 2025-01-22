import totowItemBase from './item-base.mjs';

export default class totowTalent extends totowItemBase {
	static defineSchema() {
		const fields = foundry.data.fields;
		const requiredInteger = { required: true, nullable: false, integer: true };
		const schema = super.defineSchema();

		// schema.level = new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 });

		schema.basicisActive = new fields.BooleanField({ initial: false });
		schema.basicAction = new fields.HTMLField();
		schema.advisActive = new fields.BooleanField({ initial: false });
		schema.advAction = new fields.HTMLField();

		return schema;
	}

	prepareDerivedData() {}
}
