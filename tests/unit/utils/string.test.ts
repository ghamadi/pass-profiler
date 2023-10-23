import { stripInterleavingPairs } from '~/lib/utils/string';

describe('stripInterleavingPairs Function', () => {
  describe('General functionality', () => {
    test('Returns a string with no modifications when there are no interleaving pairs', () => {
      expect(stripInterleavingPairs('')).toBe('');
      expect(stripInterleavingPairs('abc')).toBe('abc');
      expect(stripInterleavingPairs('ab1c')).toBe('ab1c');
      expect(stripInterleavingPairs('ab1c')).toBe('ab1c');
      expect(stripInterleavingPairs('ab1cd2')).toBe('ab1cd2');
      expect(stripInterleavingPairs('1ab23c')).toBe('1ab23c');
    });

    test('Reduces the length of the string containing interleaving pairs', () => {
      expect(stripInterleavingPairs('a1b2').length).toBeLessThan(4);
      expect(stripInterleavingPairs('1a2b').length).toBeLessThan(4);
      expect(stripInterleavingPairs('a1c2').length).toBeLessThan(4);
      expect(stripInterleavingPairs('1a2c').length).toBeLessThan(4);
      expect(stripInterleavingPairs('a1A2').length).toBeLessThan(4);
      expect(stripInterleavingPairs('1a2A').length).toBeLessThan(4);
      expect(stripInterleavingPairs('a1B2').length).toBeLessThan(4);
      expect(stripInterleavingPairs('1a2B').length).toBeLessThan(4);
    });
  });

  describe('Length reduction strategy', () => {
    test('Processes input in pairs', () => {
      expect(stripInterleavingPairs('a1b2c').slice(-1)).toBe('c');
      expect(stripInterleavingPairs('a1b2c3').slice(-2)).toBe('c3');
      expect(stripInterleavingPairs('a1b2c3d').slice(-3)).toBe('c3d');
    });

    test('Reduces the length by 25% in the best case scenario', () => {
      expect(stripInterleavingPairs('a1C6')).toBe('a1C');
      expect(stripInterleavingPairs('1a6C')).toBe('1a6');
    });

    test('Reduces the length by 50% when letters are of the same case', () => {
      expect(stripInterleavingPairs('a3c6')).toBe('a3');
      expect(stripInterleavingPairs('3a6c')).toBe('3a');
    });

    test('Reduces the length by 50% when numbers match the position of the letters', () => {
      expect(stripInterleavingPairs('a1C3')).toBe('a1');
      expect(stripInterleavingPairs('1a3C')).toBe('1a');
    });

    test('Reduces the length by 50% when characters are sequential', () => {
      expect(stripInterleavingPairs('a3B3')).toBe('a3');
      expect(stripInterleavingPairs('3a3B')).toBe('3a');
    });

    test('Reduces the length by 75% when multiple criteria are met', () => {
      // Same case + Sequential letters
      expect(stripInterleavingPairs('a2b3c5d6')).toBe('ac');
      expect(stripInterleavingPairs('2a3b5c6d')).toBe('25');

      // Same case + Numbers match letter position
      expect(stripInterleavingPairs('a1c3e5g7')).toBe('ae');
      expect(stripInterleavingPairs('1a3c5e7g')).toBe('15');

      // Sequential letters + Numbers match letter position
      expect(stripInterleavingPairs('A1b2')).toBe('A');
      expect(stripInterleavingPairs('1A2B')).toBe('1');
    });

    test('Reduces length to a mininum of 1 character', () => {
      expect(stripInterleavingPairs('a1b2')).toBe('a');
      expect(stripInterleavingPairs('1a2b')).toBe('1');
    });
  });
});
