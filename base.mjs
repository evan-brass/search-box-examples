const search_box = document.getElementById('search-box');
const form_template = document.querySelector('template');
const results = document.getElementById('results');
const spinner = document.getElementById('spinner');

export function elements() {
	// Clear the search_box
	search_box.innerHTML = "";

	// Put in the new search box
	const frag = document.importNode(form_template.content, true);
	const form = frag.querySelector('form');
	search_box.appendChild(frag);

	return { form, results };
}

export function clear_and_spin() {
	while (results.firstChild) {
		results.firstChild.remove();
	}
	spinner.style.display = "block";
}

export function hide_spinner() {
	spinner.style.display = "none";
}