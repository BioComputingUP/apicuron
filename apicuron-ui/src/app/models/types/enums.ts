
export const ResourceCategory = {
    Database: "Database",
    KnowledgeBase: "Knowledge Base",
    Software: "Software",
    Training: "Training",
} as const;

export type ResourceCategory = typeof ResourceCategory[keyof typeof ResourceCategory];

export const ResourceCategories = Object.values(ResourceCategory);