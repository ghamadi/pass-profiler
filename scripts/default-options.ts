import { PasswordProfiler } from '~/index';
import { stripInterleavingPairs, stripSequentialStrings } from '~/lib/utils/string';

const passwords = [
  'AAbbCCddEEffGGHH',
  'a1b2c3d4e5f6g7h8i9j',
  'a1b2c3d4e5f6',
  'A1b2C3D4e8F6',
  'A1b5c3d4e5f6',
  'A1b0C9D4e8F6',
  'a1b2c3d4e5f6g7',
  'a1b2c3d4e5f6g7h8',
  'aa1bb2cc3dd4',
  'Aa1bb2cc3dd4',
  'aa1bb2cc3dd4ee5',
  'Aa1bb2cc3dd4ee5',
  'Aa5bb8cc3dd4ee7ff6',
  'aa1bb2ccG3dd4ee5ff6',
  'Aa1bb2cc3dd4ee5ff6#',
  'S;ioc9osasW<Mnxpo',
  'a1b2c3d4e5f6g7h8i9',
];

const profiler1 = new PasswordProfiler();

const profiles = passwords
  .sort((s1, s2) => s1.length - s2.length)
  .map((pass) => {
    const profile = profiler1.parse(pass);
    let Composition = profile.composition.join(',');
    return {
      Password: pass,
      Composition,
      Sanitized: profile.sanitizedVersions,
      Length: pass.length,
      Entropy: profile.entropy,
      Strength: profile.strength,
    };
  });

console.log(stripInterleavingPairs('a1b2c3d4'));
console.log(stripInterleavingPairs('a1b5c3d8'));

const pairs = ['abc', 'abc', 'cba', 'cba', 'wxyzabc', 'wxyzcba', 'dabce'].map((str) => ({
  str,
  asc: stripSequentialStrings(str, 1),
  desc: stripSequentialStrings(str, -1),
}));

// passwords.forEach((pass) => console.log(stripInterleavingPairs(pass)));

console.table(pairs);
console.log('\nDefault Options');
console.table(profiles);
console.table(profiles.sort((p1, p2) => p1.Entropy - p2.Entropy));
