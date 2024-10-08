export default function () {
	// Register system settings

	// game.settings.register('talesoftheoldwest', 'dollar', {
	// 	name: 'TOTOW.Dollar',
	// 	hint: 'TOTOW.DollarNote',
	// 	scope: 'world',
	// 	type: Boolean,
	// 	default: true,
	// 	config: true,
	// });

	game.settings.register('talesoftheoldwest', 'totowHideInitChat', {
		name: 'TOTOW.hideInitChat',
		hint: 'TOTOW.hideInitChatHint',
		scope: 'world',
		config: true,
		default: false,
		type: Boolean,
	});

	game.settings.register('talesoftheoldwest', 'switchJournalColour', {
		name: 'TOTOW.hideJournalBGImage',
		hint: 'TOTOW.hideJournalBGImageNote',
		scope: 'client',
		type: Boolean,
		default: false,
		config: true,
		onChange: () => {
			location.reload();
		},
	});

	game.settings.register('talesoftheoldwest', 'switchchatbackground', {
		name: 'TOTOW.hideChatBGImage',
		hint: 'TOTOW.hideChatBGImageNote',
		scope: 'client',
		type: Boolean,
		default: false,
		config: true,
		onChange: () => {
			location.reload();
		},
	});

	game.settings.register('talesoftheoldwest', 'systemMigrationVersion', {
		name: 'System Migration Version',
		scope: 'world',
		config: false,
		type: String,
		default: 0,
	});

	game.settings.register('talesoftheoldwest', 'ttotowDevMessageVersionNumber', {
		name: 'Message from the devs',
		hint: 'Used to track last message id from the Alien RPG devs',
		scope: 'world',
		config: false,
		default: 0,
		type: Number,
	});

	game.settings.register('talesoftheoldwest', 'JournalFontColour', {
		name: 'TOTOW.Fontpick',
		label: 'TOTOW.Colpick',
		hint: 'TOTOW.ColpickHint',
		icon: 'fas fa-dice-d20',
		restricted: false,
		type: String,
		config: false,
		scope: 'client',
		default: '#b1e0e7',
	});
}
