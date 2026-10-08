
// Values must match the backend's ResourceCategory enum
export const ResourceCategory = {
    Database: "Database",
    KnowledgeBase: "KnowledgeBase",
    Software: "Software",
    Training: "Training",
} as const;

export type ResourceCategory = typeof ResourceCategory[keyof typeof ResourceCategory];

export const ResourceCategories = Object.values(ResourceCategory);

// Human readable names of the resource categories
export const ResourceCategoryLabels: Record<ResourceCategory, string> = {
    Database: "Database",
    KnowledgeBase: "Knowledge Base",
    Software: "Software",
    Training: "Training",
};
