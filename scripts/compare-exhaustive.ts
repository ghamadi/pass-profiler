import { PasswordProfiler } from '~/index';

const profiler1 = new PasswordProfiler({ exhaustive: false });
const profiler2 = new PasswordProfiler({ exhaustive: true });

const passwords = [
  'aX9!rM2#',
  'Kl8&$zG5!',
  'rT0*%bL4^',
  'Olympics2020',
  'JavaScriptJavaScrip[t',
  'JavaScriptJavaScript',
  'a1',
  'aaBBcc123',
  'A1B4C7',
  'Aaa123Bbb456Ccc789',
  'aaBBcc123J4V45CR!PTJavaScript',
  'horse blue run cake',
  'J4V45CR!P+J4V45CR!P+J4V45CR!P+U',
  'J4V45CR!P+J4V45CR!P+J4V45CR!P+J4V45CR!PUT',
  'jCtv92!vmR',
  'IRQ+?kJtHq',
  '12345-humpty-dumpty-satonthe-firewall',
  '?Y]G9gWJ48zYkFBc@{nKw!’q',
  'jCtv92!vmRIRQ+?kJtHq',
  'Aaa1bbb2ccc3ddd4eee5',
  'aaa1bbb2ccc3ddd4eee5',
  'a1b2C3d44eee5',
];

const entropies = passwords.map((pass) => ({
  Password: pass,
  Standard: profiler1.parse(pass).entropy,
  Exhaustive: profiler2.parse(pass).entropy,
}));

const strengths = passwords.map((pass) => ({
  Password: pass,
  Standard: profiler1.parse(pass).strength,
  Exhaustive: profiler2.parse(pass).strength,
}));

const sanitzed = passwords.map((pass) => ({
  Password: pass,
  Standard: profiler1.parse(pass).sanitizedVersions,
  Exhaustive: profiler2.parse(pass).sanitizedVersions,
}));

console.log('\nSanitzed Versions');
console.table(sanitzed);

console.log('\nEntropies');
console.table(entropies);

console.log('\nStrengths');
console.table(strengths);
