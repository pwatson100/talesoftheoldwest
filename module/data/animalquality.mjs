import totowItemBase from './item-base.mjs';

export default class totowAnimalQuality extends totowItemBase {
	static defineSchema() {
		const fields = foundry.data.fields;
		const requiredInteger = { required: true, nullable: false, integer: true };
		const schema = super.defineSchema();

		// schema.quantity = new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 });
		// schema.weight = new fields.NumberField({ required: true, nullable: false, initial: 0, min: 0 });

		return schema;
	}

	prepareDerivedData() {}
}
