const file_ref = {
	'totow-system-guide': '9yG7DQEOK6ZGntZP',
};
const folderRef = 'systems/talesoftheoldwest\user-guide';
const fileList = await FilePicker.browse('data', folderRef);
console.log('fileList', fileList);
const htmlFiles = fileList.files.filter((f) => f.includes('.html'));
//console.log(htmlFiles);
for (let file of htmlFiles) {
	filebase = file.replace('.html', '').replace(folderRef, '');
	let target_id = file_ref[filebase];
	console.log('target_id', target_id);
	if (target_id) {
		for (let journal of game.journal) {
			//console.log("journal", journal);
			let journalpage = await journal.pages.get(target_id);
			if (journalpage) {
				//console.log("journalpage", journalpage);

				const fileData = await fetch(file);
				//console.log("fileData", fileData);
				let filecontent = await fileData.text();
				//console.log("filecontent", filecontent);
				journalpage.update({
					'text.content': filecontent,
				});
				console.log('mis à jour:', journalpage.name);
			}
		}
	}
}
