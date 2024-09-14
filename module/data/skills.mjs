import TOTOWItemBase from './item-base.mjs';

export default class TOTOWSkills extends TOTOWItemBase {
	static defineSchema() {
		const fields = foundry.data.fields;
		const requiredInteger = { required: true, nullable: false, integer: true };
		const schema = super.defineSchema();
		schema.value = new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 });

		// Break down roll formula into three independent fields
		schema.roll = new fields.SchemaField({
			diceNum: new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 }),
			diceSize: new fields.StringField({ initial: 'd100' }),
			diceBonus: new fields.StringField({ initial: '+@str.mod' }),
		});

		schema.formula = new fields.StringField({ blank: true });

		return schema;
	}

	prepareDerivedData() {
		// Build the formula dynamically using string interpolation
		const roll = this.roll;
		const stat = this.value;
		const worker = stat.toString();
		const final = `-${worker}`;
		this.formula = `${roll.diceNum}${roll.diceSize}${final}`;
	}
}
