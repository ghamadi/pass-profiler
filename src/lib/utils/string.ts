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
 * Strips repeated sequences of characters in a string.
 * When a repeated sequence is found, it's replaced by a single instance of that sequence.
 */
export function stripRepeatedStrings(str: string) {
  // Any repeated pattern can at most be half of the string's length
  // start by checking half the characters to see if they are repeated, and shrink the tested pattern
  for (let i = Math.floor(str.length / 2); i > 0; i--) {
    const pattern = new RegExp(`(.{${i}})\\1+`, 'g');
    str = str.replace(pattern, '$1');
  }
  return str;
}

export function stripPattern(str: string, pattern: string) {
  return str.replace(regexp(pattern, 'gi'), pattern[0]);
}

/**
 * Escapes special characters in a string and returns a regular expression.
 *
 * If the passed string is wrapped in slashes (e.g. `/[a-z]/`) then it is not escaped
 */
export function regexp(str: string, flags?: string) {
  if (str.startsWith('/') && str.endsWith('/')) {
    str = str.slice(1, -1);
  } else {
    str = str.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
  }
  return new RegExp(str, flags);
}
