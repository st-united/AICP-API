/**
 * Sanitizes a string by removing characters that don't match the specified pattern
 * @param {string} input - The input string to sanitize
 * @param {RegExp} [pattern=/[^a-zA-Z0-9\s]/g] - Regular expression pattern to match characters to remove
 * @returns {string} The sanitized string with only alphanumeric characters and spaces
 * @example
 * sanitizeString("Hello!@#$%^&*()World") // returns "HelloWorld"
 * sanitizeString("Hello World", /[^a-z]/g) // returns "elloworld"
 */
export const sanitizeString = (input: string, pattern: RegExp = /[^a-zA-Z0-9\s]/g): string => {
  return input.replace(pattern, '');
};

/**
 * Replaces all spaces in a string with hyphens
 * @param {string} str - The input string to process
 * @returns {string} The string with spaces replaced by hyphens
 * @example
 * replaceSpacesWithHyphens("Hello World") // returns "Hello-World"
 * replaceSpacesWithHyphens("  Multiple   Spaces  ") // returns "Multiple-Spaces"
 */
export const replaceSpacesWithHyphens = (str: string): string => {
  return str.trim().replace(/\s+/g, '-');
};

/**
 * Combines two strings with a separator after sanitizing them
 * @param {string} firstString - The first string to combine
 * @param {string} secondString - The second string to combine
 * @param {string} separator - The separator to use between the strings
 * @returns {string} The combined and sanitized string
 * @example
 * concatSanitizedStrings("Hello World", "123!", "_") // returns "Hello-World_123"
 * concatSanitizedStrings("User@Name", "Email.com", ".") // returns "UserName.Emailcom"
 */
export const concatSanitizedStrings = (firstString: string, secondString: string, separator: string): string => {
  const sanitizedFirst = replaceSpacesWithHyphens(sanitizeString(firstString));
  const sanitizedSecond = replaceSpacesWithHyphens(sanitizeString(secondString));
  const combined = sanitizedFirst.concat(separator, sanitizedSecond);

  return combined;
};

export const isNullOrEmpty = (str: string | null | undefined): boolean => {
  return str === null || str === undefined || str.trim() === '';
};

export const convertStringToEnglish = (text: string, isLowerKey: boolean = false): string => {
  if (!text) return '';
  const normalized = text
    .normalize('NFD')
    .replace(/[\u0300-\u036f\u1AB0-\u1AFF\u1DC0-\u1DFF]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');

  return isLowerKey ? normalized.toLowerCase() : normalized;
};
