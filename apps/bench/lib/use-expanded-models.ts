import { useState } from 'react';

export const useExpandedModels = (initialExpandedModelIds?: string[]) => {
  const [expandedModelIds, setExpandedModelIds] = useState<string[]>(
    initialExpandedModelIds ?? [],
  );

  const toggleExpand = (modelId: string) => {
    setExpandedModelIds((prev) =>
      prev.includes(modelId)
        ? prev.filter((id) => id !== modelId)
        : [...prev, modelId],
    );
  };

  return { expandedModelIds, toggleExpand };
};
