import totowActorBase from './actor-base.mjs';

export default class totowPC extends totowActorBase {
	static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, 'TALESOFTHEOLDWEST.Actor.PC'];

	static defineSchema() {
		const fields = foundry.data.fields;
		const requiredInteger = { required: true, nullable: false, integer: true };
		const schema = super.defineSchema();
		// Iterate over attribute names and create a new SchemaField for each.
		schema.attributes = new fields.SchemaField(
			Object.keys(CONFIG.TALESOFTHEOLDWEST.attributes).reduce((obj, attribute) => {
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
			archetype: new fields.StringField({ required: true, blank: true }),
			groupconcept: new fields.StringField({ required: true, blank: true }),
			faith: new fields.StringField({ required: true, blank: true }),
			bigdream: new fields.StringField({ required: true, blank: true }),
			yourpardner: new fields.StringField({ required: true, blank: true }),
			lifestyle: new fields.StringField({ required: true, blank: true }),
			reputation: new fields.StringField({ required: false, blank: true }),
			cash: new fields.StringField({ initial: '0', min: 0, required: false, blank: true }),
			capital: new fields.StringField({ initial: '0', min: 0, required: false, blank: true }),

			faithpoints: new fields.SchemaField({
				value: new fields.NumberField({ ...requiredInteger, initial: 4, min: 0, max: 10 }),
				max: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0, max: 10 }),
			}),
			age: new fields.SchemaField({
				value: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
			}),
			fame: new fields.SchemaField({
				value: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
			}),
			morals: new fields.SchemaField({
				value: new fields.NumberField({ ...requiredInteger, initial: 3, min: 1, max: 6 }),
			}),
			publicspirit: new fields.SchemaField({
				value: new fields.NumberField({ ...requiredInteger, initial: 3, min: 1, max: 6 }),
			}),
			xp: new fields.SchemaField({
				value: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0, max: 10 }),
				max: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0, max: 10 }),
			}),
			canPush: new fields.StringField({ required: true, initial: 'push' }),
		});
		// Iterate over ability names and create a new SchemaField for each.
		schema.abilities = new fields.SchemaField(
			Object.keys(CONFIG.TALESOFTHEOLDWEST.abilities).reduce((obj, ability) => {
				obj[ability] = new fields.SchemaField({
					value: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0, max: 5 }),
					mod: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
					total: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
					label: new fields.StringField({ required: true, blank: true }),
					upper: new fields.StringField({ required: true, blank: true }),
					attr: new fields.StringField({ required: true, blank: true }),
				});
				return obj;
			}, {})
		);

		schema.conditions = new fields.SchemaField({
			starving: new fields.BooleanField({ initial: false }),
			dehydrated: new fields.BooleanField({ initial: false }),
			exhausted: new fields.BooleanField({ initial: false }),
			freezing: new fields.BooleanField({ initial: false }),
			encumbered: new fields.BooleanField({ initial: false }),
			overwatch: new fields.BooleanField({ initial: false }),
			heatstroke: new fields.BooleanField({ initial: false }),
		});

		schema.damage = new fields.SchemaField({
			hurts: new fields.SchemaField({
				value: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0, max: 5 }),
				max: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0, max: 5 }),
			}),
			shakes: new fields.SchemaField({
				value: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0, max: 5 }),
				max: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0, max: 5 }),
			}),
			vexes: new fields.SchemaField({
				value: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0, max: 15 }),
				max: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0, max: 5 }),
			}),
			doubts: new fields.SchemaField({
				value: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0, max: 5 }),
				max: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0, max: 5 }),
			}),
		});

		schema.compadres = new fields.SchemaField({
			details: new fields.ArrayField(
				new fields.SchemaField({
					id: new fields.StringField({ required: true, blank: false }),
				})
			),
			compadresQty: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0, max: 4 }),
		});
		schema.remuda = new fields.SchemaField({
			details: new fields.ArrayField(
				new fields.SchemaField({
					id: new fields.StringField({ required: true, blank: false }),
				})
			),
			remudaQty: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0, max: 3 }),
		});

		schema.horse = new fields.SchemaField({
			name: new fields.StringField({ required: true, blank: true }),

			attributes: new fields.SchemaField({
				grit: new fields.SchemaField({
					value: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0, max: 10 }),
					mod: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
					max: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
					label: new fields.StringField({ required: true, blank: true }),
				}),
				quick: new fields.SchemaField({
					value: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0, max: 10 }),
					mod: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
					max: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
					label: new fields.StringField({ required: true, blank: true }),
				}),
				cunning: new fields.SchemaField({
					value: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0, max: 10 }),
					mod: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
					max: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
					label: new fields.StringField({ required: true, blank: true }),
				}),
			}),
			abilities: new fields.SchemaField({
				resilience: new fields.SchemaField({
					value: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0, max: 5 }),
					mod: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
					max: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
					label: new fields.StringField({ required: true, blank: true }),
					total: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
					upper: new fields.StringField({ required: true, blank: true }),
					attr: new fields.StringField({ required: true, blank: true }),
				}),
				fightin: new fields.SchemaField({
					value: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0, max: 5 }),
					mod: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
					max: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
					label: new fields.StringField({ required: true, blank: true }),
					total: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
					upper: new fields.StringField({ required: true, blank: true }),
					attr: new fields.StringField({ required: true, blank: true }),
				}),
				move: new fields.SchemaField({
					value: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0, max: 5 }),
					mod: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
					max: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
					label: new fields.StringField({ required: true, blank: true }),
					total: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
					upper: new fields.StringField({ required: true, blank: true }),
					attr: new fields.StringField({ required: true, blank: true }),
				}),
				hawkeye: new fields.SchemaField({
					value: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0, max: 5 }),
					mod: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
					max: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
					label: new fields.StringField({ required: true, blank: true }),
					total: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
					upper: new fields.StringField({ required: true, blank: true }),
					attr: new fields.StringField({ required: true, blank: true }),
				}),
			}),

			general: new fields.SchemaField({
				breed: new fields.StringField({ required: true, blank: true }),
				cost: new fields.StringField({ initial: '0', min: 0, required: false, blank: true }),
				attacks: new fields.HTMLField(),
				subtype: new fields.StringField({ required: false, blank: true, initial: 'horse' }),

				ridingmodifier: new fields.SchemaField({
					value: new fields.NumberField({ ...requiredInteger, initial: 0 }),
				}),
			}),
			horseNotes: new fields.HTMLField(),
		});
		return schema;
	}

	prepareDerivedData() {
		for (const akey in this.attributes) {
			this.attributes[akey].label = game.i18n.localize(CONFIG.TALESOFTHEOLDWEST.attributes[akey].name) ?? akey;
		}

		for (const key in this.abilities) {
			this.abilities[key].attr = game.i18n.localize(CONFIG.TALESOFTHEOLDWEST.abilities[key].atob) ?? key;

			// Handle ability label localization.
			this.abilities[key].label = game.i18n.localize(CONFIG.TALESOFTHEOLDWEST.abilities[key].name) ?? key;
			this.abilities[key].upper = game.i18n.localize(CONFIG.TALESOFTHEOLDWEST.abilities[key].name).toUpperCase() ?? key;
		}

		for (const akey in this.horse.attributes) {
			this.horse.attributes[akey].label = game.i18n.localize(CONFIG.TALESOFTHEOLDWEST.attributes[akey].name) ?? akey;
		}

		for (const key in this.horse.abilities) {
			this.horse.abilities[key].attr = game.i18n.localize(CONFIG.TALESOFTHEOLDWEST.animalabilities[key].atob) ?? key;

			// Handle ability label localization.
			this.horse.abilities[key].label = game.i18n.localize(CONFIG.TALESOFTHEOLDWEST.animalabilities[key].name) ?? key;
			this.horse.abilities[key].upper = game.i18n.localize(CONFIG.TALESOFTHEOLDWEST.animalabilities[key].name).toUpperCase() ?? key;
		}

		this.general.faithpoints.max = 10 - this.general.faithpoints.value;
		this.general.xp.max = 10 - this.general.xp.value;

		this.damage.hurts.max = this.attributes.grit.max - this.damage.hurts.value;
		this.damage.shakes.max = this.attributes.quick.max - this.damage.shakes.value;
		this.damage.vexes.max = this.attributes.cunning.max - this.damage.vexes.value;
		this.damage.doubts.max = this.attributes.docity.max - this.damage.doubts.value;

		// Rem the Try/Catch back in when the table data is included in the Core Rules Module and we have a registered setting.
		// try {
		// 	if (game.settings.get('talesoftheoldwest.corerules', 'imported')) {
		let x = this.general.publicspirit.value;
		let y = this.general.morals.value;
		switch (x) {
			case 1:
				switch (y) {
					case 1:
						this.general.reputation = game.i18n.localize(CONFIG.TALESOFTHEOLDWEST.Reputation.oneone.label);
						break;
					case 2:
						this.general.reputation = game.i18n.localize(CONFIG.TALESOFTHEOLDWEST.Reputation.onetwo.label);
						break;
					case 3:
						this.general.reputation = game.i18n.localize(CONFIG.TALESOFTHEOLDWEST.Reputation.onethree.label);
						break;
					case 4:
						this.general.reputation = game.i18n.localize(CONFIG.TALESOFTHEOLDWEST.Reputation.onefour.label);
						break;
					case 5:
						this.general.reputation = game.i18n.localize(CONFIG.TALESOFTHEOLDWEST.Reputation.onefive.label);
						break;
					case 6:
						this.general.reputation = game.i18n.localize(CONFIG.TALESOFTHEOLDWEST.Reputation.onesix.label);
						break;
				}
				break;
			case 2:
				switch (y) {
					case 1:
						this.general.reputation = game.i18n.localize(CONFIG.TALESOFTHEOLDWEST.Reputation.twoone.label);
						break;
					case 2:
						this.general.reputation = game.i18n.localize(CONFIG.TALESOFTHEOLDWEST.Reputation.twotwo.label);
						break;
					case 3:
						this.general.reputation = game.i18n.localize(CONFIG.TALESOFTHEOLDWEST.Reputation.twothree.label);
						break;
					case 4:
						this.general.reputation = game.i18n.localize(CONFIG.TALESOFTHEOLDWEST.Reputation.twofour.label);
						break;
					case 5:
						this.general.reputation = game.i18n.localize(CONFIG.TALESOFTHEOLDWEST.Reputation.twofive.label);
						break;
					case 6:
						this.general.reputation = game.i18n.localize(CONFIG.TALESOFTHEOLDWEST.Reputation.twosix.label);
						break;
				}
				break;
			case 3:
				switch (y) {
					case 1:
						this.general.reputation = game.i18n.localize(CONFIG.TALESOFTHEOLDWEST.Reputation.threeone.label);
						break;
					case 2:
						this.general.reputation = game.i18n.localize(CONFIG.TALESOFTHEOLDWEST.Reputation.threetwo.label);
						break;
					case 3:
						this.general.reputation = game.i18n.localize(CONFIG.TALESOFTHEOLDWEST.Reputation.threethree.label);
						break;
					case 4:
						this.general.reputation = game.i18n.localize(CONFIG.TALESOFTHEOLDWEST.Reputation.threefour.label);
						break;
					case 5:
						this.general.reputation = game.i18n.localize(CONFIG.TALESOFTHEOLDWEST.Reputation.threefive.label);
						break;
					case 6:
						this.general.reputation = game.i18n.localize(CONFIG.TALESOFTHEOLDWEST.Reputation.threesix.label);
						break;
				}
				break;
			case 4:
				switch (y) {
					case 1:
						this.general.reputation = game.i18n.localize(CONFIG.TALESOFTHEOLDWEST.Reputation.fourone.label);
						break;
					case 2:
						this.general.reputation = game.i18n.localize(CONFIG.TALESOFTHEOLDWEST.Reputation.fourtwo.label);
						break;
					case 3:
						this.general.reputation = game.i18n.localize(CONFIG.TALESOFTHEOLDWEST.Reputation.fourthree.label);
						break;
					case 4:
						this.general.reputation = game.i18n.localize(CONFIG.TALESOFTHEOLDWEST.Reputation.fourfour.label);
						break;
					case 5:
						this.general.reputation = game.i18n.localize(CONFIG.TALESOFTHEOLDWEST.Reputation.fourfive.label);
						break;
					case 6:
						this.general.reputation = game.i18n.localize(CONFIG.TALESOFTHEOLDWEST.Reputation.foursix.label);
						break;
				}
				break;
			case 5:
				switch (y) {
					case 1:
						this.general.reputation = game.i18n.localize(CONFIG.TALESOFTHEOLDWEST.Reputation.fiveone.label);
						break;
					case 2:
						this.general.reputation = game.i18n.localize(CONFIG.TALESOFTHEOLDWEST.Reputation.fivetwo.label);
						break;
					case 3:
						this.general.reputation = game.i18n.localize(CONFIG.TALESOFTHEOLDWEST.Reputation.fivethree.label);
						break;
					case 4:
						this.general.reputation = game.i18n.localize(CONFIG.TALESOFTHEOLDWEST.Reputation.fivefour.label);
						break;
					case 5:
						this.general.reputation = game.i18n.localize(CONFIG.TALESOFTHEOLDWEST.Reputation.fivefive.label);
						break;
					case 6:
						this.general.reputation = game.i18n.localize(CONFIG.TALESOFTHEOLDWEST.Reputation.fivesix.label);
						break;
				}
				break;
			case 6:
				switch (y) {
					case 1:
						this.general.reputation = game.i18n.localize(CONFIG.TALESOFTHEOLDWEST.Reputation.sixone.label);
						break;
					case 2:
						this.general.reputation = game.i18n.localize(CONFIG.TALESOFTHEOLDWEST.Reputation.sixtwo.label);
						break;
					case 3:
						this.general.reputation = game.i18n.localize(CONFIG.TALESOFTHEOLDWEST.Reputation.sixthree.label);
						break;
					case 4:
						this.general.reputation = game.i18n.localize(CONFIG.TALESOFTHEOLDWEST.Reputation.sixfour.label);
						break;
					case 5:
						this.general.reputation = game.i18n.localize(CONFIG.TALESOFTHEOLDWEST.Reputation.sixfive.label);
						break;
					case 6:
						this.general.reputation = game.i18n.localize(CONFIG.TALESOFTHEOLDWEST.Reputation.sixsix.label);
						break;
				}
				break;

			default:
				this.general.reputation = '';

				break;
		}
		// 	}
		// } catch (error) {}
	}

	getRollData() {}
}
