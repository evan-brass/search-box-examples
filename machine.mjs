let context;
const state_pause = Symbol();

function run(ctx) {
	const old_context = context;
	context = ctx;
	ctx.gen += 1;
	ctx.transitions = {};
	ctx.state = undefined;
	try {
		const ret = ctx.func.call(ctx.data);
		console.warn(ret);
	} catch (e) {
		if (old_context !== undefined || e !== state_pause) throw e;
	}
	console.log(ctx.gen, ctx.state, Object.keys(ctx.transitions)); // DEBUG
	context = old_context;
}

export function get_context() {
	return context;
}

export function machine(func, data = {}) {
	const ctx = { func, data, gen: 0 };
	if (context) context.state = ctx;
	run(ctx);
	return ctx;
}

export function state(name, enter, exit) {
	if (name !== context.state) {
		/**
		 * Execution Order:
		 * 1. Transition
		 * 2. Machine function
		 * # After running the machine function  we'll know what the next state will be.
		 * 3. Previous state's exit function
		 * 4. New state's enter function
		 */
		if (context.on_exit) context.on_exit();
		context.state = name;
		if (enter) enter();
		context.on_exit = exit;
	}
	throw state_pause;
}

export function transition(name, handler) {
	const ctx = context;
	const gen = ctx.gen;
	context.transitions[name] = (...args) => {
		handler(...args);
		run(ctx);
	};
	return (...args) => {
		if (ctx.gen == gen) {
			ctx.transitions[name](...args);
		}
	};
}