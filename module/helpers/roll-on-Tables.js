(async () => {
	let options = '';

	game.tables.contents.forEach((t) => {
		if (t.folder && t.folder.name === 'TOTOW System' && t.folder.name != null) {
			options = options.concat(`<option value="${t._id}">${t.name}</option>`);
		}
	});
	let template = `
                  <form>
                      <div class="form-group">
                      <label>${game.i18n.localize('ALIENRPG.SELTABLE')}</label>
                      <select id="tableSelect">${options}</select>
                      </div>
                      <div class="form-group">
                      <label>${game.i18n.localize('ALIENRPG.HOWMANY')}</label>
                      <input type="text" id="inputNbr" value=1>
                      </div>
                        <div class="form-group">
                            <label>${game.i18n.localize('ALIENRPG.MODIFIER')}</label>
                            <input type="text" id="inputMod" value="0">
                        </div>
                  </form>`;

	let buttons = {};
	if (game.tables.size > 0) {
		buttons = {
			draw: {
				icon: '<i class="fas fa-check"></i>',
				label: `${game.i18n.localize('ALIENRPG.DRAW')}`,
				callback: async (html) => {
					const tableId = html.find('#tableSelect')[0].value;
					const table = game.tables.get(tableId);
					const drawNumber = parseInt(html.find('#inputNbr')[0].value || 0);
					const formula = table.formula;
					const modifier = parseInt(html.find('#inputMod')[0].value || '0');

					for (let i = 0; i < drawNumber; i++) {
						const roll = new Roll(formula + ' + ' + modifier);
						roll.evaluate({ async: false });
						await table.draw({ roll: roll });
					}
				},
			},
			cancel: {
				icon: '<i class="fas fa-times"></i>',
				label: `${game.i18n.localize('ALIENRPG.DialCancel')}`,
			},
		};
	} else {
		template = `<div style="text-align: center">${game.i18n.localize('ALIENRPG.NOTABLES')}</div><br>`;
		buttons = {
			draw: {
				icon: '<i class="fas fa-check"></i>',
				label: 'OK',
			},
		};
	}

	new Dialog({
		title: `${game.i18n.localize('ALIENRPG.ROLLONCREATURETABLE')}`,
		content: template,
		buttons: buttons,
		default: 'draw',
	}).render(true);
})();

(async () => {
	let options = '';
	game.tables.contents.forEach((t) => {
		if (
			t.folder &&
			(t.folder.name === 'TOTOW System' ||
				t.folder.name === 'TOTOW Core Rules' ||
				t.folder.name === 'Your Town' ||
				t.folder.name === 'Your Tale Begins' ||
				t.folder.name === 'Living Outcome' ||
				t.folder.name === 'Your Upbringing') &&
			t.folder.name != null
		) {
			options = options.concat(`<option value="${t._id}">${t.folder.name} - ${t.name}</option>`);
		}
	});
	let template = ` <form> <div class="form-group"> <label>Select Table</label><select id="tableSelect">${options}</select></div><div class="form-group"><label style='max-width: 100px' >Rolls on table?</label><input class='statnum' type='number' style='max-width: 50px'id="inputNbr" value=1></div><div class="form-group"><label style='max-width: 100px' >Modifier?</label><input class='statnum' type='number' style='max-width: 50px' id="inputMod"value="0"></div></form>`;
	let buttons = {};
	if (game.tables.size > 0) {
		buttons = {
			draw: {
				icon: '<i class="fas fa-check"></i>',
				label: `Draw`,
				callback: async (html) => {
					const tableId = html.find('#tableSelect')[0].value;
					const table = game.tables.get(tableId);
					const drawNumber = parseInt(html.find('#inputNbr')[0].value || 0);
					const formula = table.formula;
					const modifier = parseInt(html.find('#inputMod')[0].value || '0');
					for (let i = 0; i < drawNumber; i++) {
						const roll = new Roll(formula + ' + ' + modifier);
						roll.evaluate({ async: false });
						await table.draw({ roll: roll });
					}
				},
			},
			cancel: { icon: '<i class="fas fa-times"></i>', label: `Cancel` },
		};
	} else {
		template = `<div style="text-align: center">There are no tables to draw from!</div><br>`;
		buttons = { draw: { icon: '<i class="fas fa-check"></i>', label: 'OK' } };
	}
	new Dialog({ title: `TOTOW - Roll on Tables`, content: template, buttons: buttons, default: 'draw' }, { width: 900 }).render(true);
})();
