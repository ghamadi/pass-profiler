import { PasswordProfiler } from '~/index';

describe('E2E | Password Strength | Repeated Patterns', () => {
  const passwordProfiler = new PasswordProfiler();

  test.each('0123456789'.split(''))(
    'Repeating the same digit many times does not increase strength: %s',
    (char) => {
      [8, 16, 32, 64].forEach((repetitionTimes) => {
        const strength = getRepeatedPatternStrength(char, repetitionTimes);
        expect(strength).toBe('Very Weak');
      });
    }
  );

  test.each('ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''))(
    'Repeating the same uppercase character many times does not increase strength: %s',
    (char) => {
      [8, 16, 32, 64].forEach((repetitionTimes) => {
        const strength = getRepeatedPatternStrength(char, repetitionTimes);
        expect(strength).toBe('Very Weak');
      });
    }
  );

  test.each('abcdefghijklmnopqrstuvwxyz'.split(''))(
    'Repeating the same lowercase character many times does not increase strength: %s',
    (char) => {
      [8, 16, 32, 64].forEach((repetitionTimes) => {
        const strength = getRepeatedPatternStrength(char, repetitionTimes);
        expect(strength).toBe('Very Weak');
      });
    }
  );

  test.each('_+-=!@#$%^&*{}()"\'`;:,./\\'.split(''))(
    'Repeating the same special character many times does not increase strength: %s',
    (char) => {
      [8, 16, 32, 64].forEach((repetitionTimes) => {
        const strength = getRepeatedPatternStrength(char, repetitionTimes);
        expect(strength).toBe('Very Weak');
      });
    }
  );

  test.each(['abc', '123', 'a1#', 'ABC', '123ABC', 'abc123', 'ABC123abc', 'AbC', 'A123', 'A1b#'])(
    'Repeating a pattern does not increase its strength: %s',
    (pattern) => {
      [8, 16, 32, 64].forEach((repetitionTimes) => {
        const strength = getRepeatedPatternStrength(pattern, repetitionTimes);
        expect(strength).toBe('Very Weak');
      });
    }
  );

  test.each(['aXi@_59#$xV&;', 'S;ioc9osasW<Mnxpo'])(
    'Repeating a strong password does not affect its strength: %s',
    (pattern) => {
      [8, 16, 32, 64].forEach((repetitionTimes) => {
        const strength = getRepeatedPatternStrength(pattern, repetitionTimes);
        expect(strength).toBe('Very Strong');
      });
    }
  );

  /*****************************
   *     HELPER FUNCTIONS      *
   *****************************/
  function getRepeatedPatternStrength(pattern: string, times: number) {
    const password = Array(times).fill(pattern).join('');
    const passwordProfile = passwordProfiler.parse(password);
    return passwordProfile.strength;
  }
});
