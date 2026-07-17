/**
 * Replaces template variables in the format {{object.property}} with values from a data object.
 * 
 * @param template The template string containing variables like {{company.name}}
 * @param dataJson The data object containing the values
 * @returns The template string with variables replaced by their actual values
 */
export function replaceDynamicFields(template: string, dataJson: Record<string, any>): string {
  if (typeof template !== 'string' || !template) return template;
  
  // Regex to match {{ variable.name }}, allowing optional whitespace inside the braces
  const regex = /{{\s*([\w.]+)\s*}}/g;

  return template.replace(regex, (match, path) => {
    // path is the extracted variable path (e.g. "company.name")
    const keys = path.split('.');
    let current: any = dataJson;

    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        // If the path is not found in dataJson, keep the original placeholder (or return empty string depending on preference)
        return match; 
      }
    }

    // Handle null or undefined specifically
    if (current === null || current === undefined) {
      return '';
    }
    
    // Return string representation of the value
    return String(current);
  });
}
