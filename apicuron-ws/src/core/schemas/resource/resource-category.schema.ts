import { ResourceCategory } from '../../enums';

export function isCategory(val: ResourceCategory) {
	return function (entry: { category: ResourceCategory }) {
		return entry.category === val;
	};
}
