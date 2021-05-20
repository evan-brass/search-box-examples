import { elements, clear_and_spin, hide_spinner } from './base.mjs';
const {
	form, results
} = elements();

function single(async_func) {
	let controller;

	return (...args) => {
		if (controller) {
			controller.abort();
		}
		controller = new AbortController();
		const signal = controller.signal;
		async_func(signal, ...args).finally(() => {
			// If our promise settles without being interrupted (the controller's signal is the same as the one we gave to the async_func) then delete the controller because it doesn't need to be cancelled next time around.
			if (signal == controller.signal) controller = false;
		});
	};
}

form.addEventListener('submit', single(async (signal, e) => {
	e.preventDefault();

	// Clear previous search results and show the spinner
	clear_and_spin();

	// Fetch search results
	const args = new URLSearchParams(new FormData(e.target));
	const response = await fetch(
		'https://www.googleapis.com/customsearch/v1?' + args.toString(), {
		signal
	});
	const json = await response.json();
	if (signal.aborted) return;
	const { items } = json;

	// Display results and hide spinner
	for (const { htmlTitle, link, snippet } of items ?? []) {
		results.insertAdjacentHTML('beforeend', `<li>
		<a href="${link}">${htmlTitle}</a>
		<p>${snippet}</p>
		</li>`);
	}
	hide_spinner();
}));