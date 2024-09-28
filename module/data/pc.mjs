import TOTOWActorBase from './actor-base.mjs';

export default class TOTOWPC extends TOTOWActorBase {
	static defineSchema() {
		const fields = foundry.data.fields;
		const requiredInteger = { required: true, nullable: false, integer: true };
		const schema = super.defineSchema();
		// Iterate over attribute names and create a new SchemaField for each.
		schema.attributes = new fields.SchemaField(
			Object.keys(CONFIG.TALES_OF_THE_OLD_WEST.attributes).reduce((obj, attribute) => {
				obj[attribute] = new fields.SchemaField({
					value: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0, max: 5 }),
					mod: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
					max: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
					label: new fields.StringField({ required: true, blank: true }),
				});
				return obj;
			}, {})
		);
		schema.general = new fields.SchemaField({
			archtype: new fields.StringField({ required: true, blank: true }),
			heritage: new fields.StringField({ required: true, blank: true }),
			faith: new fields.StringField({ required: true, blank: true }),
			bigdream: new fields.StringField({ required: true, blank: true }),
			yourpardner: new fields.StringField({ required: true, blank: true }),

			faithpoints: new fields.SchemaField({
				value: new fields.NumberField({ ...requiredInteger, initial: 4, min: 0, max: 10 }),
				max: new fields.NumberField({ ...requiredInteger, initial: 4 }),
			}),
			money: new fields.SchemaField({
				value: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
			}),
			xp: new fields.SchemaField({
				value: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0, max: 100 }),
			}),
		});
		// Iterate over ability names and create a new SchemaField for each.
		schema.abilities = new fields.SchemaField(
			Object.keys(CONFIG.TALES_OF_THE_OLD_WEST.abilities).reduce((obj, ability) => {
				obj[ability] = new fields.SchemaField({
					value: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0, max: 5 }),
					mod: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
					total: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
					label: new fields.StringField({ required: true, blank: true }),
					attr: new fields.StringField({ required: true, blank: true }),
				});
				return obj;
			}, {})
		);

		return schema;
	}

	prepareDerivedData() {
		for (const akey in this.attributes) {
			this.attributes[akey].label = game.i18n.localize(CONFIG.TALES_OF_THE_OLD_WEST.attributes[akey].name) ?? akey;
		}

		for (const key in this.abilities) {
			this.abilities[key].attr = game.i18n.localize(CONFIG.TALES_OF_THE_OLD_WEST.abilities[key].atob) ?? key;
			// Calculate the modifier using d20 rules.
			// this.abilities[key].total = this.abilities[key].value + this.abilities[key].mod + this.attributes[CONFIG.TALES_OF_THE_OLD_WEST.abilities[key].atob].value;
			// Handle ability label localization.
			this.abilities[key].label = game.i18n.localize(CONFIG.TALES_OF_THE_OLD_WEST.abilities[key].name) ?? key;
		}
		// }

		// switch (this.abilities) {
		// 	case 'labor':
		// 		this.abilities.labor.mod = this.abilities.labor.value + this.attributes.grit.value;
		// 		break;
		// 	case 'Andorian':
		// 		this.abilities.str.mod = +10;
		// 		this.abilities.end.mod = +5;
		// 		this.abilities.int.mod = 0;
		// 		this.abilities.dex.mod = 0;
		// 		this.abilities.cha.mod = 0;
		// 		this.abilities.luc.mod = -20;
		// 		this.abilities.psi.mod - 30;
		// 		break;
		// 	case 'Catian':
		// 		this.abilities.str.mod = 0;
		// 		this.abilities.end.mod = -5;
		// 		this.abilities.int.mod = 0;
		// 		this.abilities.dex.mod = +20;
		// 		this.abilities.cha.mod = +5;
		// 		this.abilities.luc.mod = -20;
		// 		this.abilities.psi.mod = -20;
		// 		break;
		// 	case 'Tellerite':
		// 		this.abilities.str.mod = +5;
		// 		this.abilities.end.mod = +5;
		// 		this.abilities.int.mod = 0;
		// 		this.abilities.dex.mod = 0;
		// 		this.abilities.cha.mod = -10;
		// 		this.abilities.luc.mod = -20;
		// 		this.abilities.psi.mod = -40;
		// 		break;
		// 	case 'Vulcan':
		// 		this.abilities.str.mod = +20;
		// 		this.abilities.end.mod = +10;
		// 		this.abilities.dex.mod = 0;
		// 		this.abilities.cha.mod = 0;
		// 		this.abilities.int.mod = +10;
		// 		this.abilities.luc.mod = -40;
		// 		this.abilities.psi.mod = 0;
		// 		break;
		// 	default:
		// 		break;
		// }
		// Loop through ability scores, and add their modifiers to our sheet output.
		// for (const key in this.abilities) {
		// 	// Calculate the modifier using d20 rules.
		// 	this.abilities[key].total = this.abilities[key].value + this.abilities[key].mod;
		// 	// Handle ability label localization.
		// 	this.abilities[key].label = game.i18n.localize(CONFIG.TALES_OF_THE_OLD_WEST.abilities[key]) ?? key;
		// }
		// this.woundhealrate.value = Math.floor(this.abilities.end.total / 20);
		// this.fatiguehealrate.value = Math.floor(this.abilities.end.total / 10);
		// this.ap.value = Math.floor(this.abilities.dex.total / 10 + 4);
		// this.tohitmod.value = Math.ceil(this.abilities.dex.total + this.modernmarksmanship.value);
		// this.tohithth.value = Math.ceil(this.abilities.dex.total + this.unarmedconbat.value);
		// if (this.abilities.str.total <= 25) {
		// 	bhd = bhd10 + `-` + (3 + Math.floor(this.unarmedconbat.value / 10));
		// 	this.barehanddamage = bhd.toString();
		// } else if (this.abilities.str.total <= 50) {
		// 	this.barehanddamage = bhd10.toString();
		// } else if (this.abilities.str.total <= 75) {
		// 	bhd = bhd10 + `+` + (3 + Math.floor(this.unarmedconbat.value / 10));
		// 	this.barehanddamage = bhd.toString();
		// } else if (this.abilities.str.total <= 100) {
		// 	this.barehanddamage = bhd20.toString();
		// } else if (this.abilities.str.total <= 125) {
		// 	bhd = bhd20 + `+` + (3 + Math.floor(this.unarmedconbat.value / 10));
		// 	this.barehanddamage = bhd.toString();
		// } else if (this.abilities.str.total <= 150) {
		// 	this.barehanddamage = bhd30.toString();
		// } else if (this.abilities.str.total <= 175) {
		// 	bhd = bhd30 + `+` + (3 + Math.floor(this.unarmedconbat.value / 10));
		// 	this.barehanddamage = bhd.toString();
		// }
		// console.log(bhd);
		// this.barehanddamage.value = Math.floor(this.abilities.str.total + this.unarmedconbat.value);
	}

	getRollData() {
		const data = {};

		// Copy the ability scores to the top level, so that rolls can use
		// formulas like `@str.mod + 4`.
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

		// data.lvl = this.attributes.level.value;
		return data;
	}
}
