import totowActorBase from './actor-base.mjs';
import { calculateMods } from '../helpers/utils.mjs';

const requiredInteger = { required: true, nullable: false, integer: true };

/**
 * Shared data model for actors that have attributes, abilities, damage tracks
 * and conditions (PC, NPC and Animal).
 *
 * Subclasses adapt it by overriding the static configuration below and add their
 * own `general` schema field. The static members are read lazily from
 * `defineSchema()` / `prepareDerivedData()` via `this`, so they resolve against
 * the concrete subclass.
 */
export default class totowCreatureBase extends totowActorBase {
	/**
	 * Initial value for each attribute's `value` and `max`, the cap on `value`,
	 * and an optional cap on `max` (omit for no cap).
	 */
	static ATTRIBUTE_LIMITS = { initial: 1, valueMax: 5 };

	/**
	 * Damage tracks, keyed by track name. `attr` is the attribute whose `max`
	 * bounds the track; `value` and `max` are the schema caps for that track.
	 * The attributes of the actor are the unique `attr` values listed here.
	 */
	static DAMAGE_TRACKS = {
		hurts: { attr: 'grit', value: 5, max: 5 },
		shakes: { attr: 'quick', value: 5, max: 5 },
		vexes: { attr: 'cunning', value: 5, max: 5 },
		doubts: { attr: 'docity', value: 5, max: 5 },
	};

	/** Boolean condition flags. */
	static CONDITIONS = ['starving', 'dehydrated', 'exhausted', 'freezing', 'encumbered', 'overwatch', 'heatstroke', 'broken'];

	/** State passed to calculateMods to select which item modifiers apply. */
	static MOD_STATE = 'Active';

	/** The ability configuration (name and governing attribute) for this actor type. */
	static abilityConfig() {
		return CONFIG.TALESOFTHEOLDWEST.abilities;
	}

	static attributeKeys() {
		return [...new Set(Object.values(this.DAMAGE_TRACKS).map((track) => track.attr))];
	}

	/** Schema fields for a single ability. */
	static abilityFields() {
		const fields = foundry.data.fields;
		return {
			value: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0, max: 5 }),
			mod: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
			total: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
			label: new fields.StringField({ required: true, blank: true }),
			upper: new fields.StringField({ required: true, blank: true }),
			attr: new fields.StringField({ required: true, blank: true }),
		};
	}

	static defineSchema() {
		const fields = foundry.data.fields;
		const schema = super.defineSchema();
		const { initial, valueMax, maxMax } = this.ATTRIBUTE_LIMITS;

		schema.attributes = new fields.SchemaField(
			Object.fromEntries(
				this.attributeKeys().map((attribute) => [
					attribute,
					new fields.SchemaField({
						value: new fields.NumberField({ ...requiredInteger, initial, min: 0, max: valueMax }),
						mod: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
						max: new fields.NumberField({ ...requiredInteger, initial, min: 0, ...(maxMax !== undefined && { max: maxMax }) }),
						label: new fields.StringField({ required: true, blank: true }),
					}),
				])
			)
		);

		schema.abilities = new fields.SchemaField(
			Object.fromEntries(Object.keys(this.abilityConfig()).map((ability) => [ability, new fields.SchemaField(this.abilityFields())]))
		);

		schema.damage = new fields.SchemaField(
			Object.fromEntries(
				Object.entries(this.DAMAGE_TRACKS).map(([track, limits]) => [
					track,
					new fields.SchemaField({
						value: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0, max: limits.value }),
						max: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0, max: limits.max }),
					}),
				])
			)
		);

		schema.conditions = new fields.SchemaField(
			Object.fromEntries(this.CONDITIONS.map((condition) => [condition, new fields.BooleanField({ initial: false })]))
		);

		return schema;
	}

	prepareDerivedData() {
		const { MOD_STATE, DAMAGE_TRACKS } = this.constructor;
		const abilityConfig = this.constructor.abilityConfig();

		for (const akey in this.attributes) {
			this.attributes[akey].label = game.i18n.localize(CONFIG.TALESOFTHEOLDWEST.attributes[akey].name) ?? akey;
		}

		for (const key in this.abilities) {
			this.abilities[key].attr = game.i18n.localize(abilityConfig[key].atob) ?? key;
			this.abilities[key].label = game.i18n.localize(abilityConfig[key].name) ?? key;
			this.abilities[key].upper = game.i18n.localize(abilityConfig[key].name).toUpperCase() ?? key;
		}

		for (const [track, { attr }] of Object.entries(DAMAGE_TRACKS)) {
			this.damage[track].max = this.attributes[attr].max - this.damage[track].value;
		}

		this.conditions.broken = this.isBroken();

		// --- Attribute and ability mod calculation from active items ---
		const attrMod = Object.fromEntries(Object.keys(this.attributes).map((attribute) => [attribute, 0]));
		const sklMod = {};

		if (this.parent?.items?.size) {
			calculateMods(this.parent.items, attrMod, sklMod, MOD_STATE);
		}

		for (const [a, abl] of Object.entries(this.attributes)) {
			this.attributes[a].mod = Number(abl.value) + Number(attrMod[a] ?? 0);
		}

		for (const [s, skl] of Object.entries(this.abilities)) {
			const attrBase = this.attributes[skl.attr]?.mod ?? Number(this.attributes[skl.attr]?.value || 0);
			this.abilities[s].mod = Number(skl.value) + Number(attrBase) + Number(sklMod[s] ?? 0);
		}
	}

	isBroken() {
		return Object.keys(this.constructor.DAMAGE_TRACKS).some((track) => !this.damage[track].max);
	}

	getRollData() {
		const data = {};
		// Copy the ability scores and attributes to the top level, so that rolls can use
		// formulas like `@fightin.mod + 4`.
		if (this.abilities) {
			for (let [k, v] of Object.entries(this.abilities)) {
				data[k] = foundry.utils.deepClone(v);
			}
		}
		if (this.attributes) {
			for (let [k, v] of Object.entries(this.attributes)) {
				data[k] = foundry.utils.deepClone(v);
			}
		}
		return data;
	}
}
