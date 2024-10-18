export default function () {
	// Register system settings

	// game.settings.register('talesoftheoldwest', 'dollar', {
	// 	name: 'TALESOFTHEOLDWEST.Dollar',
	// 	hint: 'TALESOFTHEOLDWEST.DollarNote',
	// 	scope: 'world',
	// 	type: Boolean,
	// 	default: true,
	// 	config: true,
	// });

	game.settings.register('talesoftheoldwest', 'totowHideInitChat', {
		name: 'TALESOFTHEOLDWEST.hideInitChat',
		hint: 'TALESOFTHEOLDWEST.hideInitChatHint',
		scope: 'world',
		config: true,
		default: false,
		type: Boolean,
	});

	game.settings.register('talesoftheoldwest', 'switchJournalColour', {
		name: 'TALESOFTHEOLDWEST.hideJournalBGImage',
		hint: 'TALESOFTHEOLDWEST.hideJournalBGImageNote',
		scope: 'client',
		type: Boolean,
		default: false,
		config: true,
		onChange: () => {
			location.reload();
		},
	});

	game.settings.register('talesoftheoldwest', 'switchchatbackground', {
		name: 'TALESOFTHEOLDWEST.hideChatBGImage',
		hint: 'TALESOFTHEOLDWEST.hideChatBGImageNote',
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
		name: 'TALESOFTHEOLDWEST.Fontpick',
		label: 'TALESOFTHEOLDWEST.Colpick',
		hint: 'TALESOFTHEOLDWEST.ColpickHint',
		icon: 'fas fa-dice-d20',
		restricted: false,
		type: String,
		config: false,
		scope: 'client',
		default: '#b1e0e7',
	});
}
