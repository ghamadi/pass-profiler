/**
 * Strips interleaving pairs of alphabets and digits from the input string.
 *
 * The function looks for sequences in a string that follow one of two patterns:
 * 1. Letter followed by a number, repeated at least twice (e.g., a1b2c3...).
 * 2. Number followed by a letter, repeated at least twice (e.g., 1a2b3c...).
 *
 * Matching strings are reduced in length over three steps:
 * - by a quarter as an initial penalty
 * - by a quarter if the numbers correspond to the letter's position (e.g., A1b2)
 * - by a quarter if both letters in the pairs are of the same case (e.g., A3B7)
 *
 * @example
 * // returns 'a1b2'
 * removeInterleavingPairs('a1b2c3d4')
 *
 * // returns 'a1b5c3'
 * removeInterleavingPairs('a1b5c3d8')
 */
export function stripInterleavingPairs(str: string) {
  const interleavingPairsRegex = /([a-z][0-9]){2}|([0-9][a-z]){2}/gi;
  const similarCaseRegex = /(^[a-z]+$)|(^[A-Z]+$)/;

  return str.replace(interleavingPairsRegex, (match) => {
    const chars = match.match(/[a-z]/gi) ?? [];
    const digits = match.match(/[0-9]/g) ?? [];

    const digitsMatchLetterPositions = chars.every((char, i) => {
      let charCode = char.toLowerCase().charCodeAt(0) - 96;
      return charCode === +digits[i];
    });

    // in the worst case (e.g., a1b2) the pattern reduced to 1 character
    // in the best case (e.g., A5b7) the pattern is reduced to 3 characters
    let sanitizedLength = match.length * 0.75;
    if (digitsMatchLetterPositions) {
      sanitizedLength *= 0.75;
    }
    if (similarCaseRegex.test(chars.join(''))) {
      sanitizedLength *= 0.75;
    }

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
 *
 * @example
 * // returns 'wcba'
 * stripSequentialStrings('wxyzcba', 1)
 *
 * // returns 'wxyzc'
 * stripSequentialStrings('wxyzcba', -1)
 *
 */
export function stripSequentialStrings(str: string, direction: 1 | -1) {
  const isPairSequential = (letter1: string, letter2: string, direction: 1 | -1) => {
    letter1 = letter1.toLocaleLowerCase();
    letter2 = letter2.toLocaleLowerCase();
    return letter2.charCodeAt(0) - letter1.charCodeAt(0) === direction;
  };

  let output = '';
  for (let i = 0; i < str.length - 1; i++) {
    let current = str[i];
    let next = str[i + 1];

    if (!isPairSequential(current, next, direction)) {
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
      output += sequence.slice(0, sequence.length / 2).join('');
    } else {
      output += sequence.join('');
    }
  }

  return output;
}

/**
 * Strips repeated sequences of characters in a string.
 * When a repeated sequence is found, it's replaced by a single instance of that sequence.
 *
 * @example
 * // returns 'abca'
 * stripRepeatedStrings('aaabcaaa')
 *
 * @example
 * // returns "JavaScriptJavaScriptJavaScript"
 * stripReatedStrings("JavaScript");
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
