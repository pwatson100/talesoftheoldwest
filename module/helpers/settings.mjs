export default function () {
	// Register system settings

	game.settings.register('talesoftheoldwest', 'systemMigrationVersion', {
		name: 'System Migration Version',
		scope: 'world',
		config: false,
		type: String,
		default: 0,
	});

	game.settings.register('talesoftheoldwest', 'ttotowDevMessageVersionNumber', {
		name: 'Message from the devs',
		hint: 'Used to track last message id from the Tales Of the Old West RPG devs',
		scope: 'world',
		config: false,
		default: 0,
		type: Number,
	});

	game.settings.register('talesoftheoldwest', 'dollar', {
		name: 'TALESOFTHEOLDWEST.General.Dollar',
		hint: 'TALESOFTHEOLDWEST.General.DollarNote',
		scope: 'world',
		type: Boolean,
		default: true,
		config: true,
	});
}
