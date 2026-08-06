export function truncateLineageName(fullName: string | null | undefined, maxNames: number = 8): string {
  if (!fullName) return '';
  
  // Split by ' بن ' or ' بنت ' (with spaces)
  const parts = fullName.split(/( بن | بنت )/);
  // Example: ["احمد", " بن ", "محمد", " بن ", "علي"]
  // parts count: names = (parts.length + 1) / 2
  
  const nameCount = Math.floor(parts.length / 2) + 1;
  
  if (nameCount > maxNames) {
    // We want to keep `maxNames` names.
    // 1 name -> 1 part
    // 2 names -> 3 parts
    // n names -> 2n - 1 parts
    const keepParts = parts.slice(0, maxNames * 2 - 1);
    
    // We also want to append the connector that comes AFTER the last kept name, plus "..."
    // E.g. " بن ..."
    const nextConnector = parts[maxNames * 2 - 1] || ' بن ';
    return keepParts.join('') + nextConnector + '...';
  }
  
  return fullName;
}
