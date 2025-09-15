import updateModule from './update.js';

export const systemName = 'Tales Of The Old West RPG';

export const moduleKey = 'talesoftheoldwest'; // Module name. Important that this one is the exact same as the name of the module
export const adventurePack = 'talesoftheoldwest.totow-system-assets';
export const adventurePackName = 'Tales Of The Old West - System Assets';
export const moduleTitle = 'Tales Of The Old West RPG Core System'; // Module Title, is not referenced beyond giving a title to HTML dialog, so can be anything
export const welcomeJournalEntry = 'How To Use This System'; // The name of a journal entry you want to display after import.
export const sceneToActivate = 'Tales Of The Old West Core Rules Cover'; // The name of the scene you want to display after import. Not needed if the Adventure was saved with the scene active.

export class TOTOWSystemImportFormWrapper extends FormApplication {
	render() {
		ReImport();
	}
}

// Setting Hooks to easily interact with the importing of the compendiums.
Hooks.once('init', () => {
	game.settings.register(moduleKey, 'imported', {
		name: 'Imported Compendiums',
		scope: 'world',
		config: false,
		type: Boolean,
		default: false,
	});
	game.settings.register(moduleKey, 'migrationVersion', {
		name: 'Module Version',
		scope: 'world',
		config: false,
		type: String,
		default: '0',
	});
	game.settings.registerMenu(moduleKey, 'import', {
		name: 'Import Adventure',
		label: 'Re-Import',
		hint: `Welcome to the ${adventurePackName}.  Click above to import any missing (deleted) content to your world.  If you want to do a full refresh (overwrite) open the Compendium and use the Adventure Importer. `,
		config: true,
		type: TOTOWSystemImportFormWrapper,
		restricted: true,
	});
});

Hooks.on('ready', () => {
	if (!game.settings.get(moduleKey, 'imported') && game.user.isGM && !game.folders.getName('TOTOW System')) {
		FirstTimeSetup();
		// ModuleImport();
		return;
		// } else if (!game.settings.get(moduleKey, 'imported') && game.user.isGM && game.folders.getName('TOTOW System')) {
		// 	migrateFolders();
		// 	game.settings.set(moduleKey, 'imported', true);
		// 	return;
	} else if (game.settings.get(moduleKey, 'imported') && game.user.isGM && game.settings.get(moduleKey, 'migrationVersion') < game.system.version) {
		updateModule();
	}
	logger.info('Imported ', game.settings.get(moduleKey, 'imported'), 'Version ', game.system.version, 'Migration ', game.settings.get(moduleKey, 'migrationVersion'));
});

export async function FirstTimeSetup() {
	const pack = game.packs.get(adventurePack);
	const adventureId = pack.index.find((a) => a.name === adventurePackName)?._id;
	const adventure = await pack.getDocument(adventureId);
	await pack.getDocuments();
	await pack.getName(adventurePackName).sheet._updateObject({}, new FormData());
	await game.settings.set(moduleKey, 'imported', true);
	await game.settings.set(moduleKey, 'migrationVersion', game.system.version);
	await createThumbs(adventure);
	ui.notifications.notify('Import Complete');
	game.journal.getName(welcomeJournalEntry).show();
}

export async function ModuleImport() {
	//
	// Imports all assets in the Adventure Collection.
	// Will overwrite existing assets.
	//

	const pack = game.packs.get(adventurePack);
	const adventureId = pack.index.find((a) => a.name === adventurePackName)?._id;
	logger.info(`For ${adventurePackName} the Id is: ${adventureId}`);
	const adventure = await pack.getDocument(adventureId);

	// await checkVersion();
	await adventure.sheet.render(true);

	Hooks.on('importAdventure', (created, updated) => {
		if (adventure.name === adventurePackName) {
			if (created || updated) {
				game.settings.set(moduleKey, 'imported', true);
				game.settings.set(moduleKey, 'migrationVersion', game.system.version);
				ui.notifications.notify('Import Complete');
				game.journal.getName(welcomeJournalEntry).show();
				return;
			} else {
				ui.notifications.warn('There was a problem with the Import');
			}
		}
	});

	async function deleteFolderIfExist(folderName) {
		let delFolder = game.folders.getName(folderName);
		if (delFolder) {
			console.log(`${folderName} Deleted`);
			await delFolder.delete({ deleteSubfolders: true, deleteContents: true });
		}
	}
	async function deleteJournalIfExist(journalName) {
		let delJournal = game.journal.getName(journalName);
		if (delJournal) {
			await delJournal.delete();
		}
	}
	async function deleteTableIfExist(tableName) {
		let delTable = game.tables.getName(tableName);
		if (delTable) {
			await delTable.delete();
		}
	}
}

export async function ReImport() {
	//
	// Non distructive import that only imports assets missing in the world.
	//

	const pack = game.packs.get(adventurePack);
	const adventureId = pack.index.find((a) => a.name === adventurePackName)?._id;
	logger.info(`For ${adventurePackName} the Id is: ${adventureId}`);
	const adventure = await pack.getDocument(adventureId);
	const adventureData = adventure.toObject();
	const toCreate = {};
	let created = 0;

	for (const [field, cls] of Object.entries(Adventure.contentFields)) {
		const newUpdate = [];
		const newAdd = [];
		const collection = game.collections.get(cls.documentName);
		const [c, u] = adventureData[field].partition((d) => collection.has(d._id));
		if (c.length) {
			toCreate[cls.documentName] = c;
			created += c.length;
		}
	}

	//
	// Now create any new assets
	//

	if (toCreate) {
		for (const [documentName, createData] of Object.entries(toCreate)) {
			const cls = getDocumentClass(documentName);
			const c = await cls.createDocuments(createData, { keepId: true, keepEmbeddedId: true, renderSheet: false });
			created++;
		}
	}
	ui.notifications.warn(`Re-Import Completed Created ${created} Assets`);

	logger.info(` Created ${created} Assets`);
}

async function createThumbs(adventure) {
	let updates = [];
	for (let scene of adventure.scenes) {
		let sceneId = scene._id;
		let sceneImported = game.scenes.get(sceneId);
		const { thumb } = await sceneImported.createThumbnail();
		updates.push({
			_id: scene.id,
			thumb,
		});
	}
	Scene.updateDocuments(updates);
}

async function checkVersion() {
	const current = game.system.version;
	// const required = requiredSystemVersion;
	if (current < requiredSystemVersion) {
		throw Dialog.prompt({
			title: 'Version Check',
			content: `<h2>Failed to Import</h2><p>Your ${systemName} system version (${current}) is below the minimum required version (${requiredSystemVersion}).</p><p>Please update your system before proceeding.</p>`,
			label: 'Okay!',
			callback: () => ui.notifications.warn('Aborted importing of compendium content. Update your system and try again.'),
		});
	}
}
