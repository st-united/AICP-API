export const sanitizeString = (input: string, pattern: RegExp = /[^a-zA-Z0-9\s]/g): string => {
  return input.replace(pattern, '');
};

export const validateDeviceId = (deviceId: string | undefined): string => {
  if (!deviceId) return 'no-device';
  return deviceId;
};

export const concatSanitizedStrings = (firstString: string, secondString: string, separator: string): string => {
  // Remove special characters from both strings
  const sanitizedFirst = sanitizeString(firstString);
  const sanitizedSecond = sanitizeString(secondString);
  // Combine the sanitized strings
  const combined = sanitizedFirst.concat(separator, sanitizedSecond);

  return combined;
};
