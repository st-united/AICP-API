import * as bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

export function hashPassword(pw: string): Promise<string> {
  return bcrypt.hash(pw, SALT_ROUNDS);
}
