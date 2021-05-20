import { elements, clear_and_spin, hide_spinner } from './base.mjs';
const {
	form, results
} = elements();

form.addEventListener('submit', async (e) => {
	e.preventDefault();

	// Clear previous search results and show the spinner
	clear_and_spin();

	// Fetch search results
	const args = new URLSearchParams(new FormData(e.target));
	const response = await fetch('https://www.googleapis.com/customsearch/v1?' + args.toString());
	const json = await response.json();
	const { items } = json;

	// Display results and hide spinner
	for (const { htmlTitle, link, snippet } of items ?? []) {
		results.insertAdjacentHTML('beforeend', `<li>
		<a href="${link}">${htmlTitle}</a>
		<p>${snippet}</p>
		</li>`);
	}
	hide_spinner();
});