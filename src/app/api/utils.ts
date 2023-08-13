export async function await_or_else<T, E = any>(
	promise: Promise<T>,
	or_else: (reason?: E) => T
): Promise<T> {
	let x;
	await promise.then(t => (x = t)).catch(reason => (x = or_else(reason)));

	return x!;
}
