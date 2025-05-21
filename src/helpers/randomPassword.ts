export const generateSecurePassword = (length: number = 8): string => {
  if (length < 8 || length > 50) {
    throw new Error('Password length must be between 8 and 50 characters.');
  }

  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const allChars = lowercase + uppercase + numbers;

  const getRandomChar = (charset: string) => charset.charAt(Math.floor(Math.random() * charset.length));

  // Make sure at least one lowercase, one uppercase, and one number are included
  const guaranteedChars = [getRandomChar(lowercase), getRandomChar(uppercase), getRandomChar(numbers)];

  // Generate the remaining characters
  const remainingLength = length - guaranteedChars.length;
  const remainingChars = Array.from({ length: remainingLength }, () => getRandomChar(allChars));

  // Shuffle the array to ensure randomness
  const passwordArray = [...guaranteedChars, ...remainingChars];
  for (let i = passwordArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [passwordArray[i], passwordArray[j]] = [passwordArray[j], passwordArray[i]];
  }

  return passwordArray.join('');
};
