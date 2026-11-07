import { prepareActiveEffectCategories } from "../helpers/effects.mjs";
import { logger } from "../helpers/logger.mjs";
import TOTOWActiveEffect from "../documents/active-effect.mjs";
import { findMods, formatCurrencyInput } from "../helpers/utils.mjs";

const { api, sheets } = foundry.applications;

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheetV2}
 */
export class totowActorSheet extends api.HandlebarsApplicationMixin(sheets.ActorSheetV2) {
  constructor(options = {}) {
    super(options);
  }

  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ["actor", "talesoftheoldwest"],
    position: {
      width: 1015,
      height: 890,
    },
    window: {
      resizable: true,
    },
    actions: {
      onEditImage: this._onEditImage,
      viewDoc: this._viewDoc,
      createDoc: this._createDoc,
      deleteDoc: this._deleteDoc,
      toggleEffect: this._toggleEffect,
      roll: { handler: this._onRoll, buttons: [0, 2] },
      toggleCondition: this._toggleStatus,
      rollCrit: { handler: this._rollCrit, buttons: [0] },
      changeFaith: { handler: this._changeFaith, buttons: [0, 2] },
      changeDamage: { handler: this._changeDamage, buttons: [0, 2] },
      changeAspect: { handler: this._changeaspect, buttons: [0, 2] },
      changeSP: { handler: this._changeSP, buttons: [0, 2] },
      storeItem: { handler: this._storeItem, buttons: [0, 2] },
      reloadWeapon: { handler: this._reloadWeapon, buttons: [0] },
      remudaMount: { handler: this._onRemudaMount, buttons: [0, 2] },
      remudaView: { handler: this._onRemudaView, buttons: [0, 2] },
      remudaRemove: { handler: this._onRemudaRemove, buttons: [0, 2] },
      compadresView: { handler: this._onCompadresView, buttons: [0, 2] },
      compadresRemove: { handler: this._onCompadresRemove, buttons: [0, 2] },
      exportSaddlebag: this._exportSaddlebag,
    },
    form: {
      submitOnChange: true,
    },
  };

  /** @override */
  _getHeaderControls() {
    const controls = super._getHeaderControls();
    controls.push({
      icon: "fa-solid fa-file-export",
      label: "TALESOFTHEOLDWEST.Saddlebag.ExportButton",
      action: "exportSaddlebag",
      visible: () => this.document.type === "pc",
    });
    return controls;
  }

  /** Download this PC as a Saddlebag Markdown file. */
  static async _exportSaddlebag() {
    await game.talesoftheoldwest.saddlebag.exportActor(this.document);
  }

  /** @override */
  static PARTS = {
    header: {
      template: "systems/talesoftheoldwest/templates/actor/header.hbs",
      scrollable: [""],
    },
    tcheader: {
      template: "systems/talesoftheoldwest/templates/actor/tcheader.hbs",
      scrollable: [""],
    },
    tabs: {
      // Foundry-provided generic template
      template: "templates/generic/tab-navigation.hbs",
      scrollable: [""],
    },
    towncharter: {
      template: "systems/talesoftheoldwest/templates/actor/towncharter.hbs",
      scrollable: [""],
    },
    skills: {
      template: "systems/talesoftheoldwest/templates/actor/skills.hbs",
      scrollable: [""],
    },
    gear: {
      template: "systems/talesoftheoldwest/templates/actor/parts/actor-gear.hbs",
      scrollable: [""],
    },
    effects: {
      template: "systems/talesoftheoldwest/templates/actor/parts/actor-effects.hbs",
      scrollable: [""],
    },
    description: {
      template: "systems/talesoftheoldwest/templates/actor/biography.hbs",
      scrollable: [""],
    },
    weapons: {
      template: "systems/talesoftheoldwest/templates/actor/parts/actor-weapon.hbs",
      scrollable: [""],
    },
    talents: {
      template: "systems/talesoftheoldwest/templates/actor/parts/actor-talent.hbs",
      scrollable: [""],
    },
    itemsinline: {
      template: "systems/talesoftheoldwest/templates/actor/parts/actor-items-inline.hbs",
      scrollable: [""],
    },
    qualityoptions: {
      template: "systems/talesoftheoldwest/templates/actor/parts/quality-options.hbs",
      scrollable: [""],
    },
    compadres: {
      template: "systems/talesoftheoldwest/templates/actor/parts/actor-compadres.hbs",
      scrollable: [""],
    },
    compadresweapon: {
      template: "systems/talesoftheoldwest/templates/actor/parts/compadre-weapon.hbs",
      scrollable: [""],
    },
    remuda: {
      template: "systems/talesoftheoldwest/templates/actor/parts/actor-remuda.hbs",
      scrollable: [""],
    },
    horse: {
      template: "systems/talesoftheoldwest/templates/actor/parts/actor-horse.hbs",
      scrollable: [""],
    },
    horsequalityoptions: {
      template: "systems/talesoftheoldwest/templates/actor/parts/horse-quality-options.hbs",
      scrollable: [""],
    },
    horsesaddlebag: {
      template: "systems/talesoftheoldwest/templates/actor/parts/actor-horse-saddlebag.hbs",
      scrollable: [""],
    },
    horseitems: {
      template: "systems/talesoftheoldwest/templates/actor/parts/horse-items-inline.hbs",
      scrollable: [""],
    },
    actorhorsequality: {
      template: "systems/talesoftheoldwest/templates/actor/parts/actor-horse-quality-options.hbs",
      scrollable: [""],
    },
    amenities: {
      template: "systems/talesoftheoldwest/templates/actor/parts/towncharter-amenities.hbs",
      scrollable: [""],
    },
  };

  /** @override */
  _configureRenderOptions(options) {
    super._configureRenderOptions(options);
    // Not all parts always render
    options.parts = ["header", "tabs"];
    // Don't show the other tabs if only limited view
    if (this.document.limited) return;
    // Control which parts show based on document subtype
    switch (this.document.type) {
      case "pc":
        options.parts.push("skills", "gear", "compadres", "remuda", "description");
        break;
      case "npc":
        options.parts.push("skills", "description");
        break;
      case "animal":
        options.parts.push("skills");
        break;
      case "towncharter":
        options.parts = ["tcheader", "tabs", "towncharter", "amenities"];
        break;
    }
  }

  /* -------------------------------------------- */

  /** @override */
  async _prepareContext(options) {
    // Output initialization
    const context = {
      // Validates both permissions and compendium status
      editable: this.isEditable,
      owner: this.document.isOwner,
      limited: this.document.limited,
      isGM: game.user.isGM,
      isType: this.actor.type,
      // Add the actor document.
      actor: this.actor,
      // Add the actor's data to context.data for easier access, as well as flags.
      system: this.actor.system,
      flags: this.actor.flags,
      // Adding a pointer to CONFIG.TALESOFTHEOLDWEST
      config: CONFIG.TALESOFTHEOLDWEST,
      tabs: this._getTabs(options.parts),
    };

    // // Offloading context prep to a helper function

    // Prepare character data and items.
    if (context.actor.type === "towncharter") {
      if (this.document.img == "icons/svg/mystery-man.svg" && this.document.img != this.img) {
        this.document.update({ img: "systems/talesoftheoldwest/assets/icons/tied-scroll.webp" });
      }
      this._prepareItems(context);
    } else {
      if (context.actor.type === "pc") {
        this._prepareCompadres(context);
        await this._prepareRemuda(context);
      }
      context.statuses = await this._prepareStatusEffects();
      context.effects = await this._prepareActiveEffectCategories();
      this._prepareItems(context);
    }
    logger.debug("Actor Sheet derived data:", context);
    return context;
  }

  /** @override */
  async _preparePartContext(partId, context) {
    const options = {
            secrets: this.document.isOwner,
            rollData: this.actor.getRollData(),
            relativeTo: this.actor,
          };
    switch (partId) {
      case "skills":
      case "compadres":
      case "remuda":
        context.tab = context.tabs[partId];
        context.enrichedBiography = await foundry.applications.ux.TextEditor.enrichHTML(this.actor.system.biography, options);
        context.enrichedAttacks = await foundry.applications.ux.TextEditor.enrichHTML(this.actor.system.general.attacks, options);
        break;
      case "gear":
      case "towncharter":
        context.tab = context.tabs[partId];
        break;
      case "amenities":
        context.tab = context.tabs[partId];
        break;
      case "description":
        context.tab = context.tabs[partId];
        // Enrich biography info for display
        // Enrichment turns text like `[[/r 1d20]]` into buttons
        context.enrichedBiography = await foundry.applications.ux.TextEditor.enrichHTML(this.actor.system.biography, options);
        break;
      case "effects":
        context.tab = context.tabs[partId];
        context.effects = prepareActiveEffectCategories(
          this.actor.allApplicableEffects(),
        );
        break;
    }
    return context;
  }

  /**
   * Generates the data for the generic tab navigation template
   * @param {string[]} parts An array of named template parts to render
   * @returns {Record<string, Partial<ApplicationTab>>}
   * @protected
   */
  _getTabs(parts) {
    // If you have sub-tabs this is necessary to change
    const tabGroup = "primary";
    // Default tab for first time it's rendered this session
    if (this.actor.type === "towncharter") {
      if (!this.tabGroups[tabGroup]) this.tabGroups[tabGroup] = "towncharter";
    } else if (!this.tabGroups[tabGroup]) this.tabGroups[tabGroup] = "skills";
    return parts.reduce((tabs, partId) => {
      const tab = {
        cssClass: "",
        group: tabGroup,
        // Matches tab property to
        id: "",
        // FontAwesome Icon, if you so choose
        icon: "",
        // Run through localization
        label: "TALESOFTHEOLDWEST.Actor.Tabs.",
      };
      switch (partId) {
        case "header":
        case "tcheader":
        case "tabs":
          return tabs;
        case "skills":
          tab.id = "skills";
          tab.label += "Skills";
          break;
        case "towncharter":
          tab.id = "towncharter";
          tab.label += "TownCharter";
          break;
        case "amenities":
          tab.id = "amenities";
          tab.label += "Amenities";
          break;
        case "gear":
          tab.id = "gear";
          tab.label += "Gear";
          break;
        case "compadres":
          tab.id = "compadres";
          tab.label += "Compadres";
          break;
        case "remuda":
          tab.id = "remuda";
          tab.label += "Remuda";
          break;
        case "description":
          tab.id = "description";
          tab.label += "Description";
          break;
        case "effects":
          tab.id = "effects";
          tab.label += "Effects";
          break;
      }
      if (this.tabGroups[tabGroup] === tab.id) tab.cssClass = "active";
      tabs[partId] = tab;
      return tabs;
    }, {});
  }

  /**
   * Organize and classify Items for Actor sheets.
   *
   * @param {object} context The context object to mutate
   */
  _prepareItems(context) {
    const gear = [];
    const allGear = [];
    const weapon = [];
    const talent = [];
    const animalquality = [];
    const critInj = [];
    const itemMods = [];
    const amenities = [];
    // Iterate through items, allocating to containers
    for (const i of this.document.items) {
      switch (i.type) {
        case "item":
          gear.push(i);
          findMods(i, itemMods);
          break;
        case "weapon":
          weapon.push(i);
          findMods(i, itemMods);
          break;
        case "talent":
          talent.push(i);
          findMods(i, itemMods);
          break;
        case "crit":
          critInj.push(i);
          findMods(i, itemMods);
          break;
        case "animalquality":
          animalquality.push(i);
          findMods(i, itemMods);
          break;
        case "amenities":
          amenities.push(i);
          break;

        default:
          break;
      }
      allGear.push(i);
    }
    if (context.actor.type === "pc" && context.system.remuda.remudaMounted !== "false") {
      for (const modItems of Object.values(context.system.remuda.details).filter(m => m.actor?.system?.general?.mounted === true)) {
        for (const i of modItems.actor.items) {
          findMods(i, itemMods);
        }
      }
    }

    context.allGear = allGear.toSorted((a, b) => (a.sort || 0) - (b.sort || 0));
    context.gear = gear.toSorted((a, b) => (a.sort || 0) - (b.sort || 0));
    // Total of the weights shown in the carried gear list (stored items are excluded)
    context.gearWeightTotal = Math.round(
      gear.filter((i) => !i.system.stored).reduce((sum, i) => sum + (i.system.weight || 0), 0) * 100
    ) / 100;
    context.weapon = weapon.toSorted((a, b) => (a.sort || 0) - (b.sort || 0));
    context.system.critInj = critInj.toSorted((a, b) => (a.sort || 0) - (b.sort || 0));
    context.talent = talent.toSorted((a, b) => (a.sort || 0) - (b.sort || 0));
    context.animalquality = animalquality.toSorted((a, b) => (a.sort || 0) - (b.sort || 0));
    context.amenities = amenities.toSorted((a, b) => (a.sort || 0) - (b.sort || 0));
    context.system.itemMods = Object.groupBy(itemMods, ({ name }) => name);
  }
  /**
   * Organize and classify Items for Character sheets.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
  async _prepareCompadres(sheetData) {
    sheetData.compadres = sheetData.actor.system.compadres.details.reduce((arr, o) => {
      o.actor = game.actors.get(o.id);
      // Creates a fake actor if it doesn't exist anymore in the database.
      if (!o.actor) {
        o.actor = {
          name: "{MISSING_CREW}",
          system: { system: { health: { value: 0, max: 0 } } },
          isCrewDeleted: true,
        };
      }
      arr.push(o);
      return arr;
    }, []);
    return sheetData;
  }
  async _prepareRemuda(sheetData) {
    sheetData.remuda = sheetData.actor.system.remuda.details.reduce((arr, o) => {
      o.actor = game.actors.get(o.id);
      // Creates a fake actor if it doesn't exist anymore in the database.
      if (!o.actor) {
        o.actor = {
          name: "{MISSING_CREW}",
          system: { system: { health: { value: 0, max: 0 } } },
          isCrewDeleted: true,
        };
      }
      arr.push(o);
      return arr;
    }, []);
    return sheetData;
  }

  /**
   * Prepare the data structure for status effects and whether they are active.
   * @protected
   */
  async _prepareStatusEffects() {
    /** @type {Record<string, StatusInfo>} */
    const statusInfo = {};
    const validStatuses = CONFIG.statusEffects.filter(
      (status) => status._id && TOTOWActiveEffect.validHud(status, this.actor)
    );

    // Resolve all UUID lookups in parallel, outside the loop.
    const pages = await Promise.all(
      validStatuses.map((status) => (status.rule ? fromUuid(status.rule) : Promise.resolve(null)))
    );

    // Resolve all tooltip enrichments in parallel.
    const tooltips = await Promise.all(
      validStatuses.map((status, i) => {
        const page = pages[i];
        if (!page) return Promise.resolve(null);
        return enrichHTML(page.text.content, { relativeTo: this.actor });
      })
    );

    for (let i = 0; i < validStatuses.length; i++) {
      const status = validStatuses[i];
      statusInfo[status.id] = {
        _id: status._id,
        name: status.name,
        img: status.img,
        disabled: false,
        active: "",
        resp: status.resp,
        tableNumber: status.tableNumber,
      };
      if (tooltips[i] !== null) {
        statusInfo[status.id].tooltip = tooltips[i];
      }
    }

    // If the actor has the status and it's not from the canonical statusEffect
    // Then we want to force more individual control rather than allow toggleStatusEffect
    for (const effect of this.actor.allApplicableEffects()) {
      for (const id of effect.statuses) {
        if (!(id in statusInfo)) continue;
        statusInfo[id].active = "active";
        if (!Object.values(statusInfo).some((s) => s._id === effect._id)) statusInfo[id].disabled = true;
      }
    }

    return statusInfo;
  }

  /* -------------------------------------------------- */

  /**
   * Prepare the data structure for Active Effects which are currently embedded in an Actor or Item.
   * @return {Record<string, ActiveEffectCategory>} Data for rendering.
   * @protected
   */
  async _prepareActiveEffectCategories() {
    /** @type {Record<string, ActiveEffectCategory>} */
    const categories = {
      temporary: {
        type: "temporary",
        label: game.i18n.localize("TALESOFTHEOLDWEST.ActiveEffect.Temporary"),
        effects: [],
      },
      passive: {
        type: "passive",
        label: game.i18n.localize("TALESOFTHEOLDWEST.ActiveEffect.Passive"),
        effects: [],
      },
      inactive: {
        type: "inactive",
        label: game.i18n.localize("TALESOFTHEOLDWEST.ActiveEffect.Inactive"),
        effects: [],
      },
    };

    // Iterate over active effects, classifying them into categories
    const applicableEffects = [...this.actor.allApplicableEffects()].sort((a, b) => a.sort - b.sort);
    for (const e of applicableEffects) {
      const effectContext = {
        id: e.id,
        uuid: e.uuid,
        name: e.name,
        img: e.img,
        parent: e.parent,
        sourceName: e.sourceName,
        duration: e.duration,
        disabled: e.disabled,
        expanded: false,
      };

      if (!e.active) categories.inactive.effects.push(effectContext);
      else if (e.isTemporary) categories.temporary.effects.push(effectContext);
      else categories.passive.effects.push(effectContext);
    }

    for (const c of Object.values(categories)) {
      c.effects.sort((a, b) => (a.sort || 0) - (b.sort || 0));
    }
    return categories;
  }

  /**
   * Actions performed after any render of the Application.
   * Post-render steps are not awaited by the render process.
   * @param {ApplicationRenderContext} context      Prepared context data
   * @param {RenderOptions} options                 Provided render options
   * @protected
   * @override
   */
  async _onRender(context, options) {
    await super._onRender(context, options);
    this.#disableOverrides();
    // You may want to add other special handling here
    // Foundry comes with a large number of utility classes, e.g. SearchFilter
    // That you may want to implement yourself.
    const currency = this.element.querySelectorAll(".currency");
    for (const s of currency) {
      s.addEventListener("change", (event) => {
        this._currencyField(event);
      });
    }

    const ammoLists = this.element.querySelectorAll("#actorWeaponList");
    for (const ammo of ammoLists) {
      ammo.addEventListener("change", async (event) => {
        if (event.target.classList.contains("inline-edit")) {
          await this._inlineedit(event);
        }
      });
    }
    logger.debug("Actor Sheet derived data:", context);
  }

  /**************
   *
   *   ACTIONS
   *
   **************/

  static async _onRemudaView(event) {
    event.preventDefault();
    const compId = event.target.closest(".remuda").dataset.compid;
    const actor = game.actors.get(compId);
    await actor.sheet.render({ force: true });
    return this.render();
  }

  static async _onRemudaRemove(event) {
    event.preventDefault();
    const actorData = this.actor;
    const compId = event.target.closest(".remuda").dataset.compid;
    const details = await this.actor.removeRemuda(compId);
    let remudaNumber = actorData.system.remuda.remudaQty || 0;
    remudaNumber--;
    await actorData.update({ "system.remuda.remudaQty": remudaNumber });
    return await actorData.update({ "system.remuda.details": details });
  }

  static async _onRemudaMount(event, target) {
    event.preventDefault(); // Don't open context menu
    event.stopPropagation(); // Don't trigger other events
    if (event.detail > 1) return; // Ignore repeated clicks

    const compId = event.target.closest(".remuda").dataset.compid;
    let horse = await this.actor.getRemuda(compId);
    if (!horse?.actor) return;

    if (event.button === 2) {
      // right click
      if (this.actor.system.remuda.remudaMounted !== "false") {
        ui.notifications.error(game.i18n.localize("TALESOFTHEOLDWEST.General.ErrorRemudaAlreadyMounted"));
        return;
      }
      await horse.actor.update({ "system.general.mounted": true });
      await this.actor.update({ "system.remuda.remudaMounted": compId });
    } else {
      // left click
      await horse.actor.update({ "system.general.mounted": false });
      await this.actor.update({ "system.remuda.remudaMounted": "false" });
    }
    this.render();
  }

  static async _onCompadresView(event) {
    event.preventDefault();
    const compId = event.target.closest(".compadre, .compardre").dataset.compid;
    const actor = game.actors.get(compId);
    return actor.sheet.render({ force: true });
  }

  static async _onCompadresRemove(event) {
    event.preventDefault();
    const actorData = this.actor;
    const compId = event.target.closest(".compadre, .compardre").dataset.compid;
    const details = await this.actor.removeCompadres(compId);
    let compadresNumber = actorData.system.compadres.compadresQty || 0;
    compadresNumber--;
    await actorData.update({ "system.compadres.compadresQty": compadresNumber });
    return await actorData.update({ "system.compadres.details": details });
  }

  /**
   * Handle changing a Document's image.
   *
   * @this totowActorSheet
   * @param {PointerEvent} event   The originating click event
   * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
   * @returns {Promise}
   * @protected
   */
  static async _onEditImage(event, target) {
    const attr = target.dataset.edit;
    const current = foundry.utils.getProperty(this.document, attr);
    const { img } = this.document.constructor.getDefaultArtwork?.(this.document.toObject()) ?? {};
    const fp = new foundry.applications.apps.FilePicker({
      current,
      type: "image",
      redirectToRoot: img ? [img] : [],
      callback: (path) => {
        this.document.update({ [attr]: path });
      },
      top: this.position.top + 40,
      left: this.position.left + 10,
    });
    return fp.browse();
  }

  /**
   * Renders an embedded document's sheet
   *
   * @this totowActorSheet
   * @param {PointerEvent} event   The originating click event
   * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
   * @protected
   */
  static async _viewDoc(event, target) {
    const doc = this._getEmbeddedDocument(target);
    doc.sheet.render({ force: true });
  }

  /**
   * Handles item deletion
   *
   * @this totowActorSheet
   * @param {PointerEvent} event   The originating click event
   * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
   * @protected
   */
  static async _deleteDoc(event, target) {
    const doc = this._getEmbeddedDocument(target);
    if (target.dataset.type === "criticalinj") {
      if ((await this.actor.hasCondition("criticalinj")) && this.actor.system.critInj.length <= 1) {
        await this.actor.removeCondition("criticalinj");
      }
    }
    await doc.delete();
  }

  /**
   * Handle creating a new Owned Item or ActiveEffect for the actor using initial data defined in the HTML dataset
   *
   * @this totowActorSheet
   * @param {PointerEvent} event   The originating click event
   * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
   * @private
   */
  static async _createDoc(event, target) {
    // Retrieve the configured document class for Item or ActiveEffect
    const docCls = getDocumentClass(target.dataset.documentClass);
    // Prepare the document creation data by initializing it a default name.
    const docData = {
      name: docCls.defaultName({
        // defaultName handles an undefined type gracefully
        type: target.dataset.type,
        parent: this.actor,
      }),
    };
    // Loop through the dataset and add it to our docData
    for (const [dataKey, value] of Object.entries(target.dataset)) {
      // These data attributes are reserved for the action handling
      if (["action", "documentClass"].includes(dataKey)) continue;
      // Nested properties require dot notation in the HTML, e.g. anything with `system`
      // An example exists in spells.hbs, with `data-system.spell-level`
      // which turns into the dataKey 'system.spellLevel'
      foundry.utils.setProperty(docData, dataKey, value);
    }

    // Finally, create the embedded document!
    await docCls.create(docData, { parent: this.actor });
  }

  /**
   * Determines effect parent to pass to helper
   *
   * @this totowActorSheet
   * @param {PointerEvent} event   The originating click event
   * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
   * @private
   */
  static async _toggleEffect(event, target) {
    const effect = this._getEmbeddedDocument(target);
    await effect.update({ disabled: !effect.disabled });
  }

  /**
   * Creates or deletes a configured status effect.
   *
   * @param {PointerEvent} event   The originating click event.
   * @param {HTMLElement} target   The capturing HTML element which defined a [data-action].
   * @private
   */
  static async _toggleStatus(event, target) {
    // const status = target.dataset.statusId;
    const status = target.dataset.key;
    await this.actor.toggleStatusEffect(status);
  }

  /**
   * Handle clickable rolls.
   *
   * @this totowActorSheet
   * @param {PointerEvent} event   The originating click event
   * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
   * @protected
   */
  static async _onRoll(event, target) {
    event.preventDefault(); // Don't open context menu
    event.stopPropagation(); // Don't trigger other events
    if (event.detail > 1) return; // Ignore repeated clicks
    const containerEl = target.closest(".remuda, .compadre, .compardre");
    const actor = containerEl?.dataset.compid ? (game.actors.get(containerEl.dataset.compid) ?? this.actor) : this.actor;
    const isModifiable = ["attribute", "ability"].includes(target.dataset.rollType);
    if (isModifiable && event.button !== 0) {
      await actor.modRoll(actor, event, target);
    } else {
      await actor.diceRoll(actor, event, target);
    }
  }

  static async _rollCrit(event, target) {
    event.preventDefault();
    event.stopPropagation();
    if (event.detail > 1) return;
    if (event.button !== 0) return; // only left-click
    await this.actor.rollCrit(this.actor, this.actor.type, target.dataset);
  }

  async _changeValue(event, resource) {
    event.preventDefault(); // Don't open context menu
    event.stopPropagation(); // Don't trigger other events
    if (event.detail > 1) return; // Ignore repeated clicks
    const delta = (event.button === 2) ? -1 : 1;
    const res = foundry.utils.getProperty(this.actor, resource);
    // 'max' is derived as (limit - value), so value + max is the upper limit.
    const value = Math.min(res.value + res.max, Math.max(0, res.value + delta));
    return await this.actor.update({ [`${resource}.value`]: value });
  }

  static async _changeFaith(event, target) {
    return this._changeValue(event, "system.general.faithpoints");
  }

  static async _changeSP(event, target) {
    // Use the raw DB key 'settlementponts' (typo in persisted data) for reads and writes.
    // The correctly-spelled alias 'settlementpoints' is available via the getter on towncharter.mjs.
    return this._changeValue(event, "system.general.settlementponts");
  }

  static async _changeDamage(event, target) {
    event.preventDefault(); // Don't open context menu
    event.stopPropagation(); // Don't trigger other events
    if (event.detail > 1) return; // Ignore repeated clicks
    const containerEl = target.closest(".remuda, .compadre, .compardre");
    const actor = containerEl?.dataset.compid ? (game.actors.get(containerEl.dataset.compid) ?? this.actor) : this.actor;
    const damage = actor.system.damage[target.dataset.label];
    const attribute = actor.system.attributes[target.dataset.attribute];
    const field = `system.damage.${target.dataset.label}.value`;
    const aField = `system.attributes.${target.dataset.attribute}.value`;

    const attrKey = target.dataset.attribute;
    if (event.button === 2) {
      // right click
      return this.removeDamage(actor, attribute, damage, field, aField, containerEl, attrKey);
    } else {
      // left click
      return this.addDamage(actor, attribute, damage, field, aField, containerEl, attrKey);
    }
  }

  async removeDamage(actor, attribute, damage, field, aField, containerEl, attrKey) {
    if (damage.value) {
      await actor.update({ [field]: damage.value - 1, [aField]: attribute.value + 1 });
      if (damage.max != actor.system.attributes[attrKey].max && !actor.system.conditions.broken) {
        await actor.removeCondition("broken");
      }
      if (containerEl) this.render();
    }
  }

  async addDamage(actor, attribute, damage, field, aField, containerEl, attrKey) {
    if (damage.max) {
      await actor.update({ [field]: damage.value + 1, [aField]: attribute.value - 1 });
      if (actor.system.attributes[attrKey].value === 0 && actor.system.conditions.broken) {
        await actor.addCondition("broken");
      }
      if (containerEl) this.render();
    }
  }

  static async _changeaspect(event, target) {
    return this._changeValue(event, `system.aspects.${target.dataset.aspect}`);
  }

  static async _storeItem(event, target) {
    event.preventDefault(); // Don't open context menu
    event.stopPropagation(); // Don't trigger other events
    if (event.detail > 1) return; // Ignore repeated clicks
    const li = target.closest(".item");
    const item = this.actor.items.get(li?.dataset?.itemId);

    if (event.button === 2) {
      // right click
      return await item.update({ "system.stored": true });
    } else {
      // left click
      return await item.update({ "system.stored": false });
    }
  }

  static async _reloadWeapon(event, target) {
    event.preventDefault();
    event.stopPropagation();
    if (event.detail > 1) return;
    const li = target.closest(".item");
    const actorId = li?.dataset?.actorId;
    const actor = actorId ? (game.actors.get(actorId) ?? this.actor) : this.actor;
    if (!actor) return;
    if (!actor.isOwner) {
      ui.notifications.warn(game.i18n.localize("DOCUMENT.NotOwner") || "You do not have permission to edit this character.");
      return;
    }
    const item = actor.items.get(li?.dataset?.itemId);
    if (!item) return;
    return await item.reload();
  }

  /** Helper Functions */

  /**
   * Fetches the embedded document representing the containing HTML element
   *
   * @param {HTMLElement} target    The element subject to search
   * @returns {Item | ActiveEffect} The embedded Item or ActiveEffect
   */
  _getEmbeddedDocument(target) {
    const docRow = target.closest("li[data-document-class]");
    if (
      docRow.dataset.documentClass === "Item" ||
      docRow.dataset.documentClass === "Talent" ||
      docRow.dataset.documentClass === "Weapon" ||
      docRow.dataset.documentClass === "Critical Injury" ||
      docRow.dataset.documentClass === "Amenities"
    ) {
      return this.actor.items.get(docRow.dataset.itemId);
    } else if (docRow.dataset.documentClass === "ActiveEffect") {
      const parent = docRow.dataset.parentId === this.actor.id ? this.actor : this.actor.items.get(docRow?.dataset.parentId);
      return parent.effects.get(docRow?.dataset.effectId);
    } else return console.warn("Could not find document class");
  }

  async _inlineedit(event) {
    event.preventDefault();
    const li = event.target.closest("[data-item-id]");
    const itemId = li.dataset.itemId;
    const actorId = li.dataset.actorId;
    const actor = actorId ? game.actors.get(actorId) : this.actor;
    const item = actor.items.get(itemId);
    const temp = event.target.dataset.mod;

    return await item.update({ [temp]: event.target.value }, {});
  }

  /**
   * Override the base _dragDrop getter to use [data-drag] selector instead of .draggable.
   * @type {foundry.applications.ux.DragDrop}
   * @protected
   */
  get _dragDrop() {
    this.#dragDrop ??= new foundry.applications.ux.DragDrop.implementation({
      dragSelector: "[data-drag]",
      permissions: {
        dragstart: this._canDragStart.bind(this),
        drop: this._canDragDrop.bind(this),
      },
      callbacks: {
        dragstart: this._onDragStart.bind(this),
        dragover: this._onDragOver.bind(this),
        drop: this._onDrop.bind(this),
      },
    });
    return this.#dragDrop;
  }

  /** @type {foundry.applications.ux.DragDrop|null} */
  #dragDrop = null;

  /** @override */
  _canDragStart(selector) {
    return this.isEditable;
  }

  /** @override */
  _canDragDrop(selector) {
    return this.isEditable;
  }

  /**
   * Callback actions which occur when a dragged element is dropped on a target.
   * @param {DragEvent} event       The originating DragEvent
   * @protected
   */
  async _onDrop(event) {
    const data = foundry.applications.ux.TextEditor.getDragEventData(event);
    const actor = this.actor;
    const allowed = Hooks.call("dropActorSheetData", actor, this, data);
    if (allowed === false) return;

    // Handle different data types
    switch (data.type) {
      case "ActiveEffect":
        return this._onDropActiveEffect(event, data);
      case "Actor":
        return this._onDropActor(event, data);
      case "Item":
        return this._onDropItem(event, data);
      case "Folder":
        return this._onDropFolder(event, data);
    }
  }

  /**
   * Handle the dropping of ActiveEffect data onto an Actor Sheet
   * @param {DragEvent} event                  The concluding DragEvent which contains drop data
   * @param {object} data                      The data transfer extracted from the event
   * @returns {Promise<ActiveEffect|boolean>}  The created ActiveEffect object or false if it couldn't be created.
   * @protected
   */
  async _onDropActiveEffect(event, data) {
    const aeCls = getDocumentClass("ActiveEffect");
    const effect = await aeCls.fromDropData(data);
    if (!this.actor.isOwner || !effect) return false;
    if (effect.target === this.actor) return this._onSortActiveEffect(event, effect);
    return aeCls.create(effect, { parent: this.actor });
  }

  /**
   * Handle a drop event for an existing embedded Active Effect to sort that Active Effect relative to its siblings
   *
   * @param {DragEvent} event
   * @param {ActiveEffect} effect
   */
  async _onSortActiveEffect(event, effect) {
    /** @type {HTMLElement} */
    const dropTarget = event.target.closest("[data-effect-id]");
    if (!dropTarget) return;
    const target = this._getEmbeddedDocument(dropTarget);

    // Don't sort on yourself
    if (effect.uuid === target.uuid) return;

    // Identify sibling items based on adjacent HTML elements
    const siblings = [];
    for (const el of dropTarget.parentElement.children) {
      const siblingId = el.dataset.effectId;
      const parentId = el.dataset.parentId;
      if (siblingId && parentId && (siblingId !== effect.id || parentId !== effect.parent.id)) siblings.push(this._getEmbeddedDocument(el));
    }

    // Perform the sort
    const sortUpdates = SortingHelpers.performIntegerSort(effect, {
      target,
      siblings,
    });

    // Split the updates up by parent document
    const directUpdates = [];

    const grandchildUpdateData = sortUpdates.reduce((items, u) => {
      const parentId = u.target.parent.id;
      const update = { _id: u.target.id, ...u.update };
      if (parentId === this.actor.id) {
        directUpdates.push(update);
        return items;
      }
      if (items[parentId]) items[parentId].push(update);
      else items[parentId] = [update];
      return items;
    }, {});

    // Effects-on-items updates
    await Promise.all(
      Object.entries(grandchildUpdateData).map(([itemId, updates]) =>
        this.actor.items.get(itemId).updateEmbeddedDocuments("ActiveEffect", updates)
      )
    );

    // Update on the main actor
    return this.actor.updateEmbeddedDocuments("ActiveEffect", directUpdates);
  }

  /**
   * Handle dropping of an Actor data onto another Actor sheet
   * @param {DragEvent} event            The concluding DragEvent which contains drop data
   * @param {object} data                The data transfer extracted from the event
   * @returns {Promise<object|boolean>}  A data object which describes the result of the drop, or false if the drop was
   *                                     not permitted.
   * @protected
   */
  async _onDropActor(event, data) {
    if (!this.actor.isOwner) return false;
    const actor = await fromUuid(data.uuid);

    if (data.type !== "Actor") return;
    if (actor.type === "npc") return await this._dropCompadres(actor.id);
    if (actor.type === "animal") {
      if (actor.system.general.subtype === "horse") return await this._dropRemuda(actor.id);
      return await this._dropCompadres(actor.id);
    }
  }

  /* -------------------------------------------- */

  /**
   * Handle dropping of an item reference or item data onto an Actor Sheet
   * @param {DragEvent} event            The concluding DragEvent which contains drop data
   * @param {object} data                The data transfer extracted from the event
   * @returns {Promise<Item[]|boolean>}  The created or updated Item instances, or false if the drop was not permitted.
   * @protected
   */
  async _onDropItem(event, data) {
    if (!this.actor.isOwner) return false;
    const item = await Item.implementation.fromDropData(data);

    // Handle item sorting within the same Actor
    if (this.actor.uuid === item.parent?.uuid) return this._onSortItem(event, item);

    // Create the owned item
    return this._onDropItemCreate(item, event);
  }

  /**
   * Handle dropping of a Folder on an Actor Sheet.
   * The core sheet currently supports dropping a Folder of Items to create all items as owned items.
   * @param {DragEvent} event     The concluding DragEvent which contains drop data
   * @param {object} data         The data transfer extracted from the event
   * @returns {Promise<Item[]>}
   * @protected
   */
  async _onDropFolder(event, data) {
    if (!this.actor.isOwner) return [];
    const folder = await Folder.implementation.fromDropData(data);
    if (folder.type !== "Item") return [];
    const droppedItemData = await Promise.all(
      folder.contents.map(async (item) => {
        if (!(document instanceof Item)) item = await fromUuid(item.uuid);
        return item;
      }),
    );
    return this._onDropItemCreate(droppedItemData, event);
  }

  /**
   * Handle the final creation of dropped Item data on the Actor.
   * This method is factored out to allow downstream classes the opportunity to override item creation behavior.
   * @param {object[]|object} itemData      The item data requested for creation
   * @param {DragEvent} event               The concluding DragEvent which provided the drop data
   * @returns {Promise<Item[]>}
   * @private
   */
  async _onDropItemCreate(itemData, event) {
    const type = itemData.type;
    const alwaysAllowedItems = CONFIG.TALESOFTHEOLDWEST.physicalItems;
    const allowedItems = {
      pc: ["item", "weapon", "talent", "crit", "npc", "animalquality"],
      npc: ["item", "weapon", "talent", "crit"],
      animal: ["item", "weapon", "animalquality"],
      towncharter: ["amenities"],
    };
    let allowed = true;
    if (!alwaysAllowedItems.includes(type)) {
      if (!allowedItems[this.actor.type].includes(type)) {
        allowed = false;
      }
    }

    if (!allowed) {
      const msg = game.i18n.format("TALESOFTHEOLDWEST.General.NotifWrongItemType", {
        type: type,
        actor: this.actor.type,
      });
      console.warn(`TOTOW RPG | ${msg}`);
      ui.notifications.warn(msg);
      return false;
    }

    itemData = Array.isArray(itemData) ? itemData : [itemData];
    return this.actor.createEmbeddedDocuments("Item", itemData);
  }

  /**
   * Handle a drop event for an existing embedded Item to sort that Item relative to its siblings
   * @param {Event} event
   * @param {Item} item
   * @private
   */
  _onSortItem(event, item) {
    // Get the drag source and drop target
    const items = this.actor.items;
    const dropTarget = event.target.closest("[data-item-id]");
    if (!dropTarget) return;
    const target = items.get(dropTarget.dataset.itemId);

    // Don't sort on yourself
    if (item.id === target.id) return;

    // Identify sibling items based on adjacent HTML elements
    const siblings = [];
    for (let el of dropTarget.parentElement.children) {
      const siblingId = el.dataset.itemId;
      if (siblingId && siblingId !== item.id) siblings.push(items.get(el.dataset.itemId));
    }

    // Perform the sort
    const sortUpdates = SortingHelpers.performIntegerSort(item, {
      target,
      siblings,
    });
    const updateData = sortUpdates.map((u) => {
      const update = u.update;
      update._id = u.target._id;
      return update;
    });

    // Perform the update
    return this.actor.updateEmbeddedDocuments("Item", updateData);
  }

  /********************
   *
   * Actor Override Handling
   *
   ********************/

  /**
   * Submit a document update based on the processed form data.
   * @param {SubmitEvent} event                   The originating form submission event
   * @param {HTMLFormElement} form                The form element that was submitted
   * @param {object} submitData                   Processed and validated form data to be used for a document update
   * @returns {Promise<void>}
   * @protected
   * @override
   */
  async _processSubmitData(event, form, submitData) {
    const overrides = foundry.utils.flattenObject(this.actor.overrides);
    for (let k of Object.keys(overrides)) delete submitData[k];
    await this.document.update(submitData);
  }

  /**
   * Disables inputs subject to active effects
   */
  #disableOverrides() {
    const flatOverrides = foundry.utils.flattenObject(this.actor.overrides);
    for (const override of Object.keys(flatOverrides)) {
      const input = this.element.querySelector(`[name="${override}"]`);
      if (input) {
        input.disabled = true;
      }
    }
  }

  _currencyField(event) {
    event.preventDefault();
    formatCurrencyInput({ target: event.currentTarget });
  }

  async _dropCompadres(actorId) {
    const crew = game.actors.get(actorId);
    const actorData = this.actor;
    if (!crew) return;
    if (crew.type === "pc") return ui.notifications.info("PC inceptions are not allowed!");
    if (crew.type !== "npc" && !(crew.type === "animal" && crew.system.general.subtype !== "horse")) return;
    if (actorData.type === "pc") {
      if (actorData.system.compadres.compadresQty >= 3) {
        return ui.notifications.warn(game.i18n.localize("TALESOFTHEOLDWEST.fullCrew"));
      }
      return await actorData.addCompadres(actorId);
    }
  }
  /**
   * Adds a horse to the remuda
   * @param {string} actorId
   */
  async _dropRemuda(actorId) {
    const crew = game.actors.get(actorId);
    const actorData = this.actor;
    if (!crew) return;
    if (crew.type === "pc") return ui.notifications.info("PC inceptions are not allowed!");
    if (crew.type !== "animal") return;
    if (actorData.type === "pc") {
      if (actorData.system.remuda.remudaQty >= 3) {
        return ui.notifications.warn(game.i18n.localize("TALESOFTHEOLDWEST.fullCrew"));
      }
      return await actorData.addRemuda(actorId);
    }
  }
}
