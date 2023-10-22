// file: tests/PasswordProfiler.test.ts

import { PasswordProfiler } from '~/index';

test('PasswordProfiler works correctly', () => {
  const profiler = new PasswordProfiler();
  const profile = profiler.parse('Test');
  expect(profile.poolSize).toBe(52);
  expect(profile.strength).toBe('Very Weak');
});
