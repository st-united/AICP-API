export const generateSecurePassword = (length: number = 8): string => {
  if (length < 8 || length > 50) {
    throw new Error('Password length must be between 8 and 50 characters.');
  }

  // Create character sets using ASCII codes
  const createCharSet = (start: number, end: number): string =>
    Array.from({ length: end - start + 1 }, (_, i) => String.fromCharCode(start + i)).join('');

  const lowercase = createCharSet(97, 122); // a-z
  const uppercase = createCharSet(65, 90); // A-Z
  const numbers = createCharSet(48, 57); // 0-9
  const allChars = lowercase + uppercase + numbers;

  const getRandomChar = (charset: string): string => {
    const randomBuffer = new Uint32Array(1);
    crypto.getRandomValues(randomBuffer);
    return charset.charAt(randomBuffer[0] % charset.length);
  };

  const guaranteedChars = [getRandomChar(lowercase), getRandomChar(uppercase), getRandomChar(numbers)];

  const remainingLength = length - guaranteedChars.length;
  const remainingChars = Array.from({ length: remainingLength }, () => getRandomChar(allChars));

  const passwordArray = [...guaranteedChars, ...remainingChars];
  for (let i = passwordArray.length - 1; i > 0; i--) {
    const randomBuffer = new Uint32Array(1);
    crypto.getRandomValues(randomBuffer);
    const j = randomBuffer[0] % (i + 1);
    [passwordArray[i], passwordArray[j]] = [passwordArray[j], passwordArray[i]];
  }

  return passwordArray.join('');
};
