// Utilitário para verificar se um objeto tem um conjunto de propriedades aninhadas
export const hasNestedProperty = (obj: any, path: string): boolean => {
  if (!obj) return false;
  
  const parts = path.split('.');
  let current = obj;
  
  for (let i = 0; i < parts.length; i++) {
    if (current === null || current === undefined || !(parts[i] in current)) {
      return false;
    }
    current = current[parts[i]];
  }
  
  return true;
};

export default {
  hasNestedProperty
};

