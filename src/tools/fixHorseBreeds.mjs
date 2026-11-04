/**
 * fixHorseBreeds.mjs
 *
 * The horse actors in the Core Rules actor pack all have
 * `system.general.breed = "americanquarter"`. This sets the breed from the
 * actor's name (e.g. "Missouri Fox Trotter" -> "missourifoxtrotter").
 *
 * Only animals with `system.general.subtype === "horse"` and a current breed
 * of "americanquarter" are touched. Critters (wolves, bears, ...) never show a
 * breed on the sheet and are left alone.
 *
 * Usage:
 *   node src/tools/fixHorseBreeds.mjs [--dry-run]
 *
 * Safety: each file is round-tripped through JSON.stringify before writing to
 * verify it will reproduce byte-for-byte; files that fail are skipped and the
 * script exits non-zero.
 */

import { promises as fs } from 'fs';
import path from 'path';

const dryRun = process.argv.includes('--dry-run');

const SEARCH_DIRS = ['src/packs', 'packs_backup'];

// Keys of TALESOFTHEOLDWEST.animal_breed_list (module/helpers/config.mjs), minus "other".
const BREED_KEYS = [
	'americanquarter',
	'americansaddlebred',
	'appaloosa',
	'arabian',
	'cayuse',
	'criollo',
	'missourifoxtrotter',
	'morgan',
	'mustang',
	'paintpinto',
	'palomino',
	'tennesseewalker',
	'donkeymule',
];

/** "Paint /  Pinto" -> "paintpinto"; "Appaloosa  (rare)" -> "appaloosarare". */
const squash = (s) => String(s ?? '').toLowerCase().replace(/[^a-z]/g, '');

/** Breed key whose name the actor name starts with, or null. */
function breedFromName(name) {
	const n = squash(name);
	return BREED_KEYS.find((key) => n.startsWith(key)) ?? null;
}

async function collectJsonFiles(dir) {
	const results = [];
	let entries;
	try {
		entries = await fs.readdir(dir, { withFileTypes: true });
	} catch {
		return results; // directory does not exist – skip silently
	}
	for (const entry of entries) {
		const full = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			results.push(...(await collectJsonFiles(full)));
		} else if (entry.isFile() && entry.name.endsWith('.json')) {
			results.push(full);
		}
	}
	return results;
}

/** Patches one actor in place. Returns 'patched' | 'ok' | 'skipped' | 'unmatched'. */
function patchActor(actor, context, log) {
	if (actor?.type !== 'animal' || actor.system?.general?.subtype !== 'horse') return 'skipped';
	const current = actor.system.general.breed;
	const wanted = breedFromName(actor.name);
	if (!wanted) {
		log.push(`  ? ${context}: no breed matches "${actor.name}" (left as "${current}")`);
		return 'unmatched';
	}
	if (current === wanted) return 'ok';
	if (current !== 'americanquarter') {
		log.push(`  ? ${context}: breed is "${current}", name suggests "${wanted}" (left alone)`);
		return 'unmatched';
	}
	actor.system.general.breed = wanted;
	log.push(`  ${context}: ${current} -> ${wanted}`);
	return 'patched';
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const counts = { patched: 0, ok: 0, unmatched: 0 };
let filesScanned = 0;
let filesChanged = 0;
let filesSkipped = 0;
let hadErrors = false;

for (const baseDir of SEARCH_DIRS) {
	for (const file of await collectJsonFiles(baseDir)) {
		filesScanned++;
		const original = await fs.readFile(file, 'utf8');

		let doc;
		try {
			doc = JSON.parse(original);
		} catch (e) {
			console.error(`SKIP (parse error): ${file}: ${e.message}`);
			filesSkipped++;
			hadErrors = true;
			continue;
		}
		if (JSON.stringify(doc, null, 2) + '\n' !== original) {
			console.error(`SKIP (round-trip mismatch): ${file}`);
			filesSkipped++;
			hadErrors = true;
			continue;
		}

		// Standalone actor documents, plus actors inside an Adventure document.
		const log = [];
		let filePatched = 0;
		const targets = [[doc, doc.name ?? doc._id ?? '?'], ...(doc.actors ?? []).map((a) => [a, `actors/${a.name ?? a._id}`])];
		for (const [actor, context] of targets) {
			const result = patchActor(actor, context, log);
			if (result in counts) counts[result]++;
			if (result === 'patched') filePatched++;
		}

		if (log.length) console.log(`${file}\n${log.join('\n')}`);
		if (filePatched > 0) {
			filesChanged++;
			if (!dryRun) await fs.writeFile(file, JSON.stringify(doc, null, 2) + '\n', 'utf8');
		}
	}
}

console.log('');
console.log(`Files scanned   : ${filesScanned}`);
console.log(`Files changed   : ${filesChanged}${dryRun ? ' (dry-run; no writes)' : ''}`);
console.log(`Files skipped   : ${filesSkipped}`);
console.log(`Horses patched  : ${counts.patched}`);
console.log(`Already correct : ${counts.ok}`);
console.log(`Unmatched       : ${counts.unmatched}`);

if (hadErrors) process.exit(1);
