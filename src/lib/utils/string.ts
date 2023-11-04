/**
 * Strips interleaving pairs of alphabets and digits from the input string.
 *
 * The function looks for sequences in a string that follow one of two patterns:
 * 1. Letter followed by a number, repeated at least twice (e.g., a1b2...).
 * 2. Number followed by a letter, repeated at least twice (e.g., 1a2b...).
 *
 * Matching strings are reduced in length over three steps:
 * - by a quarter as an initial penalty
 * - by a quarter if the numbers correspond to the letter's position (e.g., A1c3)
 * - by a quarter if both letters in the pairs are of the same case (e.g., A3C7)
 * - by a quarter if the letters are sequential (e.g. a2B4)
 */
export function stripInterleavingPairs(str: string) {
  const interleavingPairsRegex = /([a-z][0-9]){2,}|([0-9][a-z]){2,}/gi;
  const similarCaseRegex = /(^[a-z]+$)|(^[A-Z]+$)/;

  return str.replace(interleavingPairsRegex, (match) => {
    const chars = match.match(/[a-z]/gi) ?? [];
    const digits = match.match(/[0-9]/g) ?? [];

    const digitsMatchLetterPositions = chars.every((char, i) => {
      let charCode = char.toLowerCase().charCodeAt(0) - 96;
      return charCode === +digits[i];
    });

    const areCharsOfSameCase = similarCaseRegex.test(chars.join(''));

    const areCharsSequential =
      chars.every((char, i) => {
        let currCharCode = char.toLowerCase().charCodeAt(0);
        let prevCharCode = chars[i - 1]?.toLocaleLowerCase().charCodeAt(0);
        return !prevCharCode || currCharCode - prevCharCode === 1;
      }) ||
      chars.every((char, i) => {
        let currCharCode = char.toLowerCase().charCodeAt(0);
        let prevCharCode = chars[i - 1]?.toLocaleLowerCase().charCodeAt(0);
        return !prevCharCode || currCharCode - prevCharCode === -1;
      });

    // in the worst case (e.g., a1b2) a pair is reduced to 1 character
    // in the best case (e.g., A5b7) a pair is reduced to 3 characters
    const penalty = [digitsMatchLetterPositions, areCharsOfSameCase, areCharsSequential].reduce(
      (penalty, booleanValue) => (booleanValue ? penalty + 0.25 : penalty),
      0.25
    );

    const sanitizedLength = Math.max(1, match.length * (1 - penalty));
    return match.slice(0, sanitizedLength);
  });
}

/**
 * Strips substrings of character sequences from the input based on the given direction.

 * The function identifies and removes sequences in either of two directions:
 * 1. Forward sequential order (e.g., abc or 123) when direction is 1.
 * 2. Reverse sequential order (e.g., cba or 321) when direction is -1.
 * 
 * Note: The function is case-insensitive, and only considers sequences of length 3 or more.
 */
export function stripSequentialStrings(str: string, direction: 1 | -1) {
  const isPairSequential = (letter1: string, letter2: string, direction: 1 | -1) => {
    const charCode1 = letter1.toLocaleLowerCase().charCodeAt(0);
    const charCode2 = letter2.toLocaleLowerCase().charCodeAt(0);
    return charCode2 - charCode1 === direction;
  };

  let output = '';
  for (let i = 0; i < str.length; i++) {
    let current = str[i];
    let next = str[i + 1];

    if (!next || !isPairSequential(current, next, direction)) {
      output += current;
      continue;
    }

    // At least the current pair is sequential
    // start examining the following characters until the sequence ends
    const sequence = [current];
    do {
      sequence.push(next);
      current = next;
      next = str[++i + 1];
    } while (!!next && isPairSequential(current, next, direction));

    if (sequence.length >= 3) {
      output += sequence[0];
    } else {
      output += sequence.join('');
    }
  }

  return output;
}

/**
 * Repeatedly shrinks the string by looking for increasingly longer recurring patterns
 */
export function stripRepeatedStrings(str: string) {
  // Any pattern repeated across the string can at most be half of the string's length
  let l = 0;
  while (++l <= Math.floor(str.length / 2)) {
    const pattern = new RegExp(`(.{${l}})\\1+`, 'gs');
    str = str.replace(pattern, '$1');
  }
  return str;
}

/**
 * Removes all matches of a given pattern
 *
 * The string pattern can be in the form of a plain string or a regular expressiion (e.g., "/[a-z]/i").
 * If a plain string is provided, the matching to strip the pattern is
 */
export function stripPattern(str: string, pattern: RegExp) {
  if (!pattern) {
    return str;
  }
  return str.replace(pattern, ($1) => $1[0] ?? '');
}

/**
 * Internal helper function to convert a string to a valid Regular Expression
 */
export function toRegex(input: string, flagsParam = '') {
  const sanitizeFlags = (flags: string) => {
    return [...new Set(flags.split(''))].filter((flag) => /^[gimsuy]$/.test(flag)).join('');
  };

  // Check if the input is in regex form
  const parts = input.match(/^\/(.*)\/([gimsuy]*)$/);
  if (parts) {
    let [, body, flags] = parts;
    return new RegExp(body, sanitizeFlags(flags + flagsParam));
  }

  // if parts is null, escape the special characters and build a regex from the string
  const escapedString = input ? input.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&') : '^$';
  return new RegExp(escapedString, sanitizeFlags(flagsParam));
}

/**
TODO: 
 * Rename `toRegexp` to `toRegex`

 * `stripPattern` should accept a regular expression only

 * Move the `handling string patterns` unit test group to the `toRegex Function` group
 
 * Add a `flags: string` parameter to `toRegex` so that users can pass a regular string and the flags

 * Call the `toRegex` function from the profiler in order to pass its output to `stripPattern`
 */
