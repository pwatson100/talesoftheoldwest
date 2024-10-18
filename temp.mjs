const { JSONField, StringField } = foundry.data.fields;
const { DialogV2 } = foundry.applications.api;

// creating the input/textarea for the dialog.
const nameInput = new StringField({
	label: 'Journal Name',
}).toFormGroup({}, { name: 'name', autofocus: true }).outerHTML;
const textInput = new JSONField({
	label: 'Content',
}).toFormGroup({ classes: ['stacked'] }, { name: 'content' }).outerHTML;

// DialogV2 that creates the data used to make the journal entry + contents
const data = await DialogV2.prompt({
	position: { width: 800 },
	content: '<fieldset>' + nameInput + '</fieldset>' + '<fieldset>' + textInput + '</fieldset>',
	ok: {
		callback: (event, button) => new FormDataExtended(button.form).object,
	},
	rejectClose: false,
});

if (!data) return;
if (!data.name) return ui.notifications.warn('No Journal Entry given, process aborted.');

// creating the journal entry + page.
const j = await JournalEntry.create({ name: data.name });
await JournalEntryPage.create(
	{
		name: data.name,
		text: {
			markdown: data.content,
			format: CONST.JOURNAL_ENTRY_PAGE_FORMATS.MARKDOWN,
		},
	},
	{ parent: j }
);
