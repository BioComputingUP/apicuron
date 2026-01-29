import { ResourceCategory } from '../../enums';

export function isCategory(val: ResourceCategory) {
	return function (entry: { category: ResourceCategory }) {
		return entry.category === val;
	};
}

export function requiresGithubRepo() {
  return function(this: { category: ResourceCategory }) {
    return this.category === ResourceCategory.KnowledgeBase || this.category === ResourceCategory.Software;
  };
}