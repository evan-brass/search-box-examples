import { elements, clear_and_spin, hide_spinner } from './base.mjs';
const {
	form, results
} = elements();

function get_args(old_args) {
	return new Promise(res => {
		function handler(e) {
			e.preventDefault();
			const new_args = new URLSearchParams(new FormData(e.target));
			if (!old_args || new_args.get('q') !== old_args.get('q')) {
				form.removeEventListener('submit', handler);
				res(new_args);
			}
		}
		form.addEventListener('submit', handler);
	});
}

// Search Box:
(async () => {
	while (true) {
		// STATE: wait_for_search; TRANSITIONS: query
		let args = await get_args();

		clear_and_spin();

		let search_results;
		let controller;
		while (true) {
			if (controller) controller.abort();
			controller = new AbortController();
			let response;
			const t_response = fetch(
				'https://www.googleapis.com/customsearch/v1?' + args.toString(),
				{ signal: controller.signal }
			).then(res => response = res);

			const t_query = get_args(args).then(new_args => args = new_args);

			// STATE: searching.1; TRANSITIONS: query, response
			await Promise.race([t_query, t_response]);

			if (!response) continue;
			let items;
			const t_json = response.json().then(json => items = json?.items ?? []);

			// STATE: searching.2; TRANSITIONS: query, json
			await Promise.race([t_query, t_json]);

			if (items) {
				search_results = items;
				break;
			}
		}

		for (const { htmlTitle, link, snippet } of search_results ?? []) {
			results.insertAdjacentHTML('beforeend', `<li>
				<a href="${link}">${htmlTitle}</a>
				<p>${snippet}</p>
			</li>`);
		}

		hide_spinner();
	}
})();