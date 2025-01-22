import totowItemBase from './item-base.mjs';

export default class totowCrit extends totowItemBase {
	static defineSchema() {
		const fields = foundry.data.fields;
		const requiredInteger = { required: true, nullable: false, integer: true };
		const schema = super.defineSchema();

		schema.location = new fields.StringField({ required: true, blank: true });
		schema.injury = new fields.StringField({ required: true, blank: true });
		schema.fatal = new fields.BooleanField({ initial: false });
		schema.fatalmessage = new fields.StringField({ required: true, blank: true });
		schema.healingtime = new fields.StringField({ required: true, blank: true });
		schema.imediateeffect = new fields.StringField({ required: true, blank: true });
		schema.longtermeffect = new fields.StringField({ required: true, blank: true });

		return schema;
	}

	prepareDerivedData() {}
}
