import {
  stripInterleavingPairs,
  stripSequentialStrings,
  stripRepeatedStrings,
  stripPattern,
  toRegex,
} from '~/lib/utils/string';

describe('stripInterleavingPairs Function', () => {
  describe('General functionality', () => {
    test('Returns a string with no modifications when there are no interleaving pairs', () => {
      expect(stripInterleavingPairs('')).toBe('');
      expect(stripInterleavingPairs('abc')).toBe('abc');
      expect(stripInterleavingPairs('123')).toBe('123');
    });

    test('Catches interleaving pairs starting with letters', () => {
      expect(stripInterleavingPairs('a1b2')).toBe('a');
    });

    test('Catches interleaving pairs starting with digits', () => {
      expect(stripInterleavingPairs('1a2b')).toBe('1');
    });

    test('Ignores special characters', () => {
      expect(stripInterleavingPairs('1#2#')).toBe('1#2#');
    });

    test('Ignores substrings with no interleaving pairs', () => {
      expect(stripInterleavingPairs('ab#a1b2')).toBe('ab#a');
      expect(stripInterleavingPairs('ab#1a2b')).toBe('ab#1');
    });

    test('Ignores interleaving patterns shorter than 2 pairs', () => {
      expect(stripInterleavingPairs('a1b')).toBe('a1b');
      expect(stripInterleavingPairs('1a2')).toBe('1a2');
    });

    test('Reduces length of any string containing interleaving pairs', () => {
      expect(stripInterleavingPairs('a1b2').length).toBeLessThan(4);
      expect(stripInterleavingPairs('abc1a2b').length).toBeLessThan(7);
    });

    test('Checking letter positions & sequence is case insensitive', () => {
      expect(stripInterleavingPairs('a1B2').length).toBe(1);
      expect(stripInterleavingPairs('1A2b').length).toBe(1);
    });

    test('Catches all interleaving pairs', () => {
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

describe('stripSequentialStrings Function', () => {
  describe('Matching ascending sequences', () => {
    test('Returns an unmodified string when there are no sequential characters', () => {
      expect(stripSequentialStrings('367', 1)).toBe('367');
      expect(stripSequentialStrings('gyh', 1)).toBe('gyh');
      expect(stripSequentialStrings('', 1)).toBe('');
    });

    test('Strips a sequential string of letters to one', () => {
      expect(stripSequentialStrings('abcd', 1)).toBe('a');
    });

    test('Strips a sequential string of numbers to one', () => {
      expect(stripSequentialStrings('1234', 1)).toBe('1');
    });

    test('Strips a sequential string of special characters to one (using ASCII code)', () => {
      expect(stripSequentialStrings('#$%', 1)).toBe('#');
    });

    test('Catches all sequential substrings', () => {
      expect(stripSequentialStrings('abcdxyza', 1)).toBe('axa');
    });

    test('Catches sequences in the middle of the string', () => {
      expect(stripSequentialStrings('ffabcdff', 1)).toBe('ffaff');
    });

    test('Requires at least three characters to modify sequence', () => {
      expect(stripSequentialStrings('ab12', 1)).toBe('ab12');
    });

    test('Sequence matching is case insnsitive', () => {
      expect(stripSequentialStrings('aBcDeF', 1)).toBe('a');
    });
  });

  describe('Matching descending sequences', () => {
    test('Returns an unmodified string when there are no sequential characters', () => {
      expect(stripSequentialStrings('367', -1)).toBe('367');
      expect(stripSequentialStrings('gyh', -1)).toBe('gyh');
      expect(stripSequentialStrings('', -1)).toBe('');
    });

    test('Strips a sequential string of letters to one', () => {
      expect(stripSequentialStrings('dcba', -1)).toBe('d');
    });

    test('Strips a sequential string of numbers to one', () => {
      expect(stripSequentialStrings('4321', -1)).toBe('4');
    });

    test('Strips a sequential string of special characters to one (using ASCII code)', () => {
      expect(stripSequentialStrings('%$#', -1)).toBe('%');
    });

    test('Catches all sequential substrings', () => {
      expect(stripSequentialStrings('azyxdcba', -1)).toBe('azd');
    });

    test('Catches sequences in the middle of the string', () => {
      expect(stripSequentialStrings('ffdcbaff', -1)).toBe('ffdff');
    });

    test('Requires at least three characters to modify sequence', () => {
      expect(stripSequentialStrings('ab12', -1)).toBe('ab12');
    });

    test('Sequence matching is case insnsitive', () => {
      expect(stripSequentialStrings('FeDcBa', -1)).toBe('F');
    });

    test('Handles sequences in the middle of the string', () => {
      expect(stripSequentialStrings('ffabcdff', 1)).toBe('ffaff');
    });
  });
});

describe('stripRepeatedStrings Function', () => {
  test('Returns an unmodified string when there are no repeated sequences', () => {
    expect(stripRepeatedStrings('abcdefg')).toBe('abcdefg');
    expect(stripRepeatedStrings('123456')).toBe('123456');
    expect(stripRepeatedStrings('')).toBe('');
  });

  test('Strips repeated characters, replacing them with a single instance', () => {
    expect(stripRepeatedStrings('aaaaaaaaa')).toBe('a');
    expect(stripRepeatedStrings('111111111')).toBe('1');
  });

  test('Pattern matching is case sensitive', () => {
    expect(stripRepeatedStrings('aAa')).toBe('aAa');
  });

  test('Handles any repeated pattern', () => {
    expect(stripRepeatedStrings('JavascriptJavascript')).toBe('Javascript');
  });

  test('Catches all instances of repeated patterns', () => {
    expect(stripRepeatedStrings('aaa1BBB2ccc3')).toBe('a1B2c3');
  });

  test('Repeatedly removes repeated patterns until no patterns remain', () => {
    // xxxyyyxxxyyy => xyxy => xy
    expect(stripRepeatedStrings('xxxyyyxxxyyy')).toBe('xy');
    // ababababa => aba
    expect(stripRepeatedStrings('ababababa')).toBe('aba');
  });

  test('Matches the leftmost pattern with multiple equal-length patterns', () => {});

  test('Retains unique sequences in the presence of repeated sequences', () => {
    expect(stripRepeatedStrings('abcdabcdabef')).toBe('abcdabef');
  });

  test('Handles strings with whitespace characters', () => {
    expect(stripRepeatedStrings('ab  cd  ')).toBe('ab cd ');
    expect(stripRepeatedStrings('ab\n\ncd')).toBe('ab\ncd');
  });

  test('Works with special characters and non-alphanumeric sequences', () => {
    expect(stripRepeatedStrings('**--==')).toBe('*-=');
    expect(stripRepeatedStrings('..,,;;')).toBe('.,;');
    expect(stripRepeatedStrings('#########')).toBe('#');
  });
});

describe('stripPattern Function', () => {
  describe('Handling regex patterns', () => {
    test('Returns string without modification when pattern is not found', () => {
      expect(stripPattern('hello universe', /hello world/i)).toBe('hello universe');
    });

    test('Returns input without modification when pattern is an empty string', () => {
      expect(stripPattern('', /^$/)).toBe('');
      expect(stripPattern('hello world', /^$/)).toBe('hello world');
    });

    test('Handles empty string input', () => {
      expect(stripPattern('', /hello/i)).toBe('');
    });

    test('Handles whitespace pattern', () => {
      expect(stripPattern('hello  world', /\s{2,}/)).toBe('hello world');
    });

    test('Reduces matched patterns to their first character', () => {
      expect(stripPattern('hello world', /HELLO/i)).toBe('h world');
    });

    test('Removes all instances of the provided string when the global flag is used', () => {
      expect(stripPattern('Hello world, hello universe', /hello/gi)).toBe('H world, h universe');
    });
  });
});

describe('toRegex Function', () => {
  test('Converts a plain string to a regular expression', () => {
    expect(toRegex('hello world').toString()).toBe(/hello world/.toString());
  });

  test('Attaches flags to a string input', () => {
    expect(toRegex('hello world', 'ig').toString()).toBe(/hello world/gi.toString());
  });

  test('Ignores invalid flags passed with a string input', () => {
    expect(toRegex('hello world', 'og').toString()).toBe(/hello world/g.toString());
  });

  test('Handles empty string input', () => {
    expect(toRegex('').toString()).toBe(/^$/.toString());
  });

  test('Escapes special characters in plain string input', () => {
    const specialChars = '.*+?^${}()|[]\\';
    expect(toRegex(specialChars).toString()).toBe(
      new RegExp('\\.\\*\\+\\?\\^\\$\\{\\}\\(\\)\\|\\[\\]\\\\').toString()
    );
  });

  test('Handles inputs with newline characters', () => {
    expect(toRegex('hello\nworld', 'g').toString()).toBe(/hello\nworld/g.toString());
  });

  test('Handles strings with forward slashes correctly', () => {
    expect(toRegex('/path/to/resource').toString()).toBe(/\/path\/to\/resource/.toString());
  });

  test('Handles valid regex input without flags', () => {
    expect(toRegex('/^hello$/').toString()).toBe(/^hello$/.toString());
  });

  test('Handles input with flags', () => {
    expect(toRegex('/hello/igm').toString()).toBe(/hello/gim.toString());
  });

  test('Eliminates duplicate flags', () => {
    expect(toRegex('/hello/ggimmi').toString()).toBe(/hello/gim.toString());
  });

  test('Handles regular expressions with special characters', () => {
    expect(toRegex('/^[a-z]\\S{2,}\\s*\\d?\\W\\w$/').toString()).toBe(
      /^[a-z]\S{2,}\s*\d?\W\w$/.toString()
    );
  });

  test('Throws when regex is invalid', () => {
    // this callback pattern is needed to make sure jest is ready to catch the error when testing
    expect(() => toRegex('/HELLO(/i')).toThrow();
  });
});
