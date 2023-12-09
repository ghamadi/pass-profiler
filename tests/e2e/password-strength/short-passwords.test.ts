import { PasswordProfiler } from '~/index';

describe('E2E | Password Strength | Short Passwords', () => {
  const passwordProfiler = new PasswordProfiler();

  test('Empty password is very weak', () => {
    expect(passwordProfiler.parse('').strength).toBe('Very Weak');
  });

  test.each(
    [
      generateRandomString(1),
      generateRandomString(2),
      generateRandomString(3),
      generateRandomString(4),
    ].map((password) => ({ password, length: password.length }))
  )('Random passwords with length $length are very weak: $password', ({ password }) => {
    expect(passwordProfiler.parse(password).strength).toBe('Very Weak');
  });

  test.each(
    [generateRandomString(5), generateRandomString(6), generateRandomString(7)].map((password) => ({
      password,
      length: password.length,
    }))
  )('Random password with length $length are weak at best: $password', ({ password }) => {
    expect(passwordProfiler.parse(password).strength).toMatch(/Weak|Very Weak/);
  });
});

/**********************************
 *        HELPER FUNCTIONS        *
 **********************************/

function generateRandomString(length: number): string {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+=-';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
