export const getID = function () {
	// Math.random should be unique because of its seeding algorithm.
	// Convert it to base 36 (numbers + letters), and grab the first 9 characters
	// after the decimal.
	return '_' + Math.random().toString(36).substr(2, 9);
};

export async function prepModOutput(rollType, rollData, dataset) {
	let floop = 1;
	let iloop = 1;
	if (rollType === 'Items') {
		for (const fkey in rollData.featureModifiers) {
			for (const ikey in rollData.featureModifiers[fkey].itemModifiers) {
				switch (rollData.featureModifiers[fkey].itemModifiers[ikey].state) {
					case 'Conditional':
						dataset.conditional += `<div class="form-group" >
					<input type="checkbox" 
					id="floop${floop}-${rollData.featureModifiers[fkey].itemModifiers[ikey].name}" 
					name="floop${floop}-${rollData.featureModifiers[fkey].itemModifiers[ikey].name}" 
					value="${rollData.featureModifiers[fkey].itemModifiers[ikey].value}" 
					/><p style="color: black">${rollData.featureModifiers[fkey].description}</p></div>`;
						floop++;

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
					dataset.conditional += `<div class="form-group">
					<input type="checkbox" 
					id="iloop${iloop}-${rollData.featureModifiers[fkey].itemModifiers[ikey].name}" 
					name="iloop${iloop}-${rollData.featureModifiers[fkey].itemModifiers[ikey].name}" 
					value="${rollData.featureModifiers[fkey].itemModifiers[ikey].value}" 
					/><p style="color: black">${rollData.featureModifiers[fkey].description}</p></div>`;
					iloop++;
					break;

				case 'Chat':
					dataset.talent += `<strong style="color:black">${rollData.itemModifiers[ikey].name}</strong> - ${rollData.itemModifiers[ikey].description}<br /><br />`;
					break;
			}
		}
	} else {
		// let spanner = [];
		for (const akey in rollData.itemMods) {
			if (akey === dataset.key) {
				let spanner = rollData.itemMods[akey].reduce((acc, akey) => {
					if (akey.state != 'Active') {
						if (akey.basicisActive) {
							switch (akey.state) {
								case 'Conditional':
									{
										dataset.conditional += `<div class="form-group" >
					<input type="checkbox" 
					id="floop${floop}-${akey.name}" 
					name="floop${floop}-${akey.name}" 
					value="${akey.value}" 
					/><p style="color: black">${akey.description} ${akey.basicAction} </p></div>`;
										floop++;
									}
									break;

								case 'Chat':
									{
										dataset.talent += `<strong style="color:black">${akey.name}</strong> - ${akey.description}<br /><br />`;
									}
									break;
							}
						} else if (akey.advisActive) {
							switch (akey.state) {
								case 'Conditional':
									{
										dataset.conditional += `<div class="form-group" >
					<input type="checkbox" 
					id="floop${floop}-${akey.name}" 
					name="floop${floop}-${akey.name}" 
					value="${akey.value}" 
					/><p style="color: black">${akey.description} ${akey.advAction}</p></div>`;
										floop++;
									}
									break;

								case 'Chat':
									{
										dataset.talent += `<strong style="color:black">${akey.name}</strong> - ${akey.description}<br /><br />`;
									}
									break;
							}
						}
					} else return acc;
				}, []);
			}
		}
	}
	return dataset;
}

export function parents(el, selector) {
	const myParents = [];
	while ((el = el.parentNode) && el !== document) {
		if (!selector || el.matches(selector)) myParents.push(el);
	}
	return myParents;
}

// This is the important part!
export function collapseSection(element) {
	// get the height of the element's inner content, regardless of its actual size
	let sectionHeight = element.scrollHeight;

	// temporarily disable all css transitions
	let elementTransition = element.style.transition;
	element.style.transition = '';

	// on the next frame (as soon as the previous style change has taken effect),
	// explicitly set the element's height to its current pixel height, so we
	// aren't transitioning out of 'auto'
	requestAnimationFrame(function () {
		element.style.height = sectionHeight + 'px';
		element.style.transition = elementTransition;

		// on the next frame (as soon as the previous style change has taken effect),
		// have the element transition to height: 0
		requestAnimationFrame(function () {
			element.style.height = 0 + 'px';
		});
	});

	// mark the section as "currently collapsed"
	element.setAttribute('data-collapsed', 'true');
}

export function expandSection(element) {
	// get the height of the element's inner content, regardless of its actual size
	let sectionHeight = element.scrollHeight;

	// have the element transition to the height of its inner content
	element.style.height = sectionHeight + 'px';

	// when the next css transition finishes (which should be the one we just triggered)
	element.addEventListener('transitionend', function transitionend(e) {
		// remove this event listener so it only gets triggered once
		element.removeEventListener('transitionend', transitionend);

		// remove "height" from the element's inline styles, so it can return to its initial value
		element.style.height = null;
	});

	// mark the section as "currently not collapsed"
	element.setAttribute('data-collapsed', 'false');
}
