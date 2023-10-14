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
 * The default `minLength` is `2`.
 *
 * @example
 * // returns 'a1b2'
 * removeInterleavingPairs('a1b2c3d4')
 *
 * // returns 'a1b5c3'
 * removeInterleavingPairs('a1b5c3d8')
 */
export function stripInterleavingPairs(str: string) {
  const computeLength = (
    match: string,
    char1: string,
    digit1: string,
    char2: string,
    digit2: string
  ) => {
    const [charCode1, charCode2] = [
      char1.toLowerCase().charCodeAt(0),
      char2.toLowerCase().charCodeAt(0),
    ];

    let end = match.length * 0.75;
    if (charCode1 - 96 === +digit1 && charCode2 - 96 === +digit2) {
      end *= 0.75;
    }
    if (isUpperCase(char1 + char2) || isLowerCase(char1 + char2)) {
      end *= 0.75;
    }
    return end;
  };

  return str.replace(/([a-z][0-9]){2}|([0-9][a-z]){2}/gi, (match, $1, $2) => {
    let char1: string, digit1: string, char2: string, digit2: string;
    let sanitizedLength = match.length;
    // console.log({ match, $1, $2 });
    if ($1) {
      [char1, digit1, char2, digit2] = match;
      sanitizedLength = computeLength(match, char1, digit1, char2, digit2);
    } else if ($2) {
      [digit1, char1, digit2, char2] = match;
      sanitizedLength = computeLength(match, char1, digit1, char2, digit2);
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

  // Extract the list sequences to be removed
  const chars = str.split('');
  const sequences: Set<string> = new Set([]);
  for (let i = 0; i < chars.length - 1; ) {
    let current = chars[i];
    let next = chars[i + 1];

    if (!isPairSequential(current, next, direction)) {
      i++;
      continue;
    }

    // At least the current pair is sequential
    // start examining the following characters until the sequence ends
    const sequence = [current];
    do {
      sequence.push(next);
      current = next;
      next = chars[++i + 1];
    } while (!!next && isPairSequential(current, next, direction));

    if (sequence.length >= 3) {
      sequences.add(sequence.join(''));
    }
  }

  // Prepare the output by replacing all sequences with their first element only
  let output = str;
  // sort from longest to shortest to handle edge cases such as `_123_123456`
  [...sequences]
    .sort((s1, s2) => s2.length - s1.length)
    .forEach((sequence) => {
      output = output.replace(regexp(sequence, 'gi'), sequence[0]);
    });

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

export function isUpperCase(str: string) {
  return !!str.match(/^[A-Z]+$/);
}

export function isLowerCase(str: string) {
  return !!str.match(/^[a-z]+$/);
}
