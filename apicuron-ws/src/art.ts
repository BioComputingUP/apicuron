/**
 * This file serves no purpose beside artistic expression
 */

class Maybe<T> {
	constructor(public value: T | null | undefined) {}

	bind<U>(f: (value: T) => Maybe<U>): Maybe<U> {
		if (this.value == null) {
			return new Maybe<U>(null);
		}
		return f(this.value);
	}
}

interface Test {
	name: string;
}
const a = new Maybe<Test>({
	name: 'John Doe',
});
const b = new Maybe<Test>(null);
const c = [a, b].map((maybeUser) =>
	maybeUser.bind((user) => new Maybe(user.name)),
);
console.log(c); // [Maybe { value: 'John Doe' }, Maybe { value: null }]
