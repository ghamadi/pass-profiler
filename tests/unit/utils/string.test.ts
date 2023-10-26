import { stripInterleavingPairs } from '~/lib/utils/string';

describe('stripInterleavingPairs Function', () => {
  describe('General functionality', () => {
    test('Returns a string with no modifications when there are no interleaving pairs', () => {
      expect(stripInterleavingPairs('')).toBe('');
      expect(stripInterleavingPairs('abc')).toBe('abc');
      expect(stripInterleavingPairs('ab1c')).toBe('ab1c');
      expect(stripInterleavingPairs('ab1cd2')).toBe('ab1cd2');
      expect(stripInterleavingPairs('1ab23c')).toBe('1ab23c');
    });

    test('Processes input that is at least 2 pairs', () => {
      expect(stripInterleavingPairs('a1b')).toBe('a1b');
      expect(stripInterleavingPairs('1a2')).toBe('1a2');
    });

    test('Reduces length of any string containing interleaving pairs', () => {
      expect(stripInterleavingPairs('a1b2').length).toBeLessThan(4);
      expect(stripInterleavingPairs('1a2b').length).toBeLessThan(4);
    });

    test('Checking letter positions & sequence is case insensitive', () => {
      expect(stripInterleavingPairs('a1B2').length).toBe(1);
      expect(stripInterleavingPairs('1A2b').length).toBe(1);
    });

    test('Captures all interleaving pairs', () => {
      expect(stripInterleavingPairs('a1b2#c3d4e5')).toBe('a#c');
      expect(stripInterleavingPairs('1a2b#3c4d5e')).toBe('1#3');
    });
  });

  describe('Length reduction strategy', () => {
    test('Reduces length by 25% in the best case scenario', () => {
      expect(stripInterleavingPairs('a1C6').length).toBe(3);
      expect(stripInterleavingPairs('1a6C').length).toBe(3);
    });

    test('Reduces length by 50% when letters are of the same case', () => {
      expect(stripInterleavingPairs('a3c6').length).toBe(2);
      expect(stripInterleavingPairs('3a6c').length).toBe(2);
    });

    test('Reduces length by 50% when numbers match the position of the letters', () => {
      expect(stripInterleavingPairs('a1C3').length).toBe(2);
      expect(stripInterleavingPairs('1a3C').length).toBe(2);
    });

    test('Reduces length by 50% when characters are sequential', () => {
      expect(stripInterleavingPairs('a3B3').length).toBe(2);
      expect(stripInterleavingPairs('3a3B').length).toBe(2);
    });

    test('Reduces length by 75% when same case & sequential characters are found', () => {
      expect(stripInterleavingPairs('a2b3c5d6').length).toBe(2);
      expect(stripInterleavingPairs('2a3b5c6d').length).toBe(2);
    });

    test('Reduces length by 75% when same case & matching number-letter positions are found', () => {
      expect(stripInterleavingPairs('a1c3e5g7').length).toBe(2);
      expect(stripInterleavingPairs('1a3c5e7g').length).toBe(2);
    });

    test('Reduces length by 75% when sequential letters & matching number-letter positions are found', () => {
      expect(stripInterleavingPairs('A1b2').length).toBe(1);
      expect(stripInterleavingPairs('1A2B').length).toBe(1);
    });

    test('Reduces length to a mininum of 1 character', () => {
      expect(stripInterleavingPairs('a1b2').length).toBe(1);
      expect(stripInterleavingPairs('1a2b').length).toBe(1);
    });

    test('Uses the floor value of the computed sanitized length', () => {
      expect(stripInterleavingPairs('a1b2c3').length).toBe(1);
      expect(stripInterleavingPairs('1a2b3c').length).toBe(1);
    });
  });
});
