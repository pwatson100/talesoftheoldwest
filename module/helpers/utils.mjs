export const getID = function () {
	// Math.random should be unique because of its seeding algorithm.
	// Convert it to base 36 (numbers + letters), and grab the first 9 characters
	// after the decimal.
	return '_' + Math.random().toString(36).substr(2, 9);
};

export async function prepModOutput(rollData, dataset) {
	for (const fkey in rollData.featureModifiers) {
		for (const ikey in rollData.featureModifiers[fkey].itemModifiers) {
			switch (rollData.featureModifiers[fkey].itemModifiers[ikey].state) {
				case 'Conditional':
					dataset.conditional +=
						'<strong style="color:black">' +
						rollData.featureModifiers[fkey].name +
						'</strong> - ' +
						rollData.featureModifiers[fkey].itemModifiers[ikey].name +
						' - ' +
						rollData.featureModifiers[fkey].itemModifiers[ikey].value +
						' - ' +
						rollData.featureModifiers[fkey].description +
						'<br /><br />';

					break;

				case 'Chat':
					dataset.talent +=
						'<strong style="color:black">' +
						rollData.featureModifiers[fkey].name +
						'</strong> - ' +
						rollData.featureModifiers[fkey].description +
						'<br /><br />';
					break;
			}
		}
	}

	for (const ikey in rollData.itemModifiers) {
		switch (rollData.itemModifiers[ikey].state) {
			case 'Conditional':
				dataset.conditional +=
					'<strong style="color:black">' +
					rollData.itemModifiers[ikey].name +
					'</strong> - ' +
					rollData.itemModifiers[ikey].value +
					' - ' +
					rollData.itemModifiers[ikey].description +
					'<br /><br />';

				break;

			case 'Chat':
				dataset.talent +=
					'<strong style="color:black">' + rollData.itemModifiers[ikey].name + '</strong> - ' + rollData.itemModifiers[ikey].description + '<br /><br />';
				break;
		}
	}
	return dataset;
}
