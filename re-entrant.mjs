import { machine, state, transition } from './machine.mjs';
import { elements, clear_and_spin, hide_spinner } from './base.mjs';
const {
	form, results
} = elements();

machine(function () {
	form.addEventListener('submit',
		transition('query', e => {
			e.preventDefault();
			const new_args = new URLSearchParams(new FormData(e.target));
			if (!this.args || new_args.get('q') !== this.args.get('q')) {
				this.args = new_args;
				if (this.controller) {
					this.controller.abort();
				}
			}
		}),
		{ once: true }
	);
	// Get the search query
	if (!this.args) {
		state('waiting_for_search');
	}

	if (!this.controller || this.controller.signal.aborted) {
		// Send the request
		this.controller = new AbortController();
		fetch(
			'https://www.googleapis.com/customsearch/v1?' + this.args.toString()
		).then(
			transition('response', response => this.response = response)
		);
	} else if (this.response) {
		// Turn the request into json and display the results
		this.response.json().then(
			transition('json', ({ items }) => {
				for (const { htmlTitle, link, snippet } of items ?? []) {
					results.insertAdjacentHTML('beforeend', `<li>
						<a href="${link}">${htmlTitle}</a>
						<p>${snippet}</p>
					</li>`);
				}
				this.args = undefined;
				this.controller = undefined;
				this.response = undefined;
			})
		);
	}
	state('searching', clear_and_spin, hide_spinner);
});