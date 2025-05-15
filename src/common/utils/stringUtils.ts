export const removeSpecialCharacters = (input: string): string => {
  return input.replace(/[^a-zA-Z0-9\s]/g, ''); // Remove characters that are not letters, digits, or whitespace
};

export const concatTwoStringWithoutSpecialCharacters = (
  firstString: string,
  secondString: string,
  separator: string
): string => {
  // Remove special characters from both strings
  const sanitizedFirst = removeSpecialCharacters(firstString);
  const sanitizedSecond = removeSpecialCharacters(secondString);
  // Combine the sanitized strings
  const combined = sanitizedFirst.concat(separator, sanitizedSecond);

  return combined;
};
