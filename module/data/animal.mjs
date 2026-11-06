import totowCreatureBase from './creature-base.mjs';
import { TALESOFTHEOLDWEST } from '../helpers/config.mjs';

export default class totowANIMAL extends totowCreatureBase {
	static ATTRIBUTE_LIMITS = { initial: 0, valueMax: 10, maxMax: 10 };

	// Animals have no doubts track.
	static DAMAGE_TRACKS = Object.fromEntries(
		['hurts', 'shakes', 'vexes'].map((track) => [track, { attr: TALESOFTHEOLDWEST.damageTracks[track].attr, value: 10, max: 10 }])
	);

	static CONDITIONS = ['broken'];

	static MOD_STATE = 'onAnimal';

	static abilityConfig() {
		return CONFIG.TALESOFTHEOLDWEST.animalabilities;
	}

	static abilityFields() {
		const fields = foundry.data.fields;
		const requiredInteger = { required: true, nullable: false, integer: true };
		return {
			...super.abilityFields(),
			max: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0, max: 5 }),
		};
	}

	static defineSchema() {
		const fields = foundry.data.fields;
		const requiredInteger = { required: true, nullable: false, integer: true };
		const schema = super.defineSchema();

		schema.general = new fields.SchemaField({
			breed: new fields.StringField({ required: true, blank: true }),
			cost: new fields.StringField({ initial: '0', min: 0, required: false, blank: true }),
			attacks: new fields.HTMLField(),
			subtype: new fields.StringField({ required: false, blank: true, initial: 'horse' }),
			mounted: new fields.BooleanField({ initial: false }),

			ridingmodifier: new fields.SchemaField({
				value: new fields.NumberField({ ...requiredInteger, initial: 0 }),
			}),
		});
		return schema;
	}
}
