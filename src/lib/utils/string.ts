/**
 * Removes interleaving letter-digit pairs or digit-letter pairs from a string.
 * Interleaving pairs are only considered when there are at least two consecutive pairs.
 *
 * If a pair contain numbers that match the position of the letter (e.g., `a1b2`)
 * then the two pairs is stripped down to the first letter only. Otherswise, the two pairs
 * are stripped down to the first pair.
 *
 * @example
 * // returns 'ac3'
 * removeInterleavingPairs('a1b2c3')
 *
 * // returns '1ec3'
 * removeInterleavingPairs('1eb6c3')
 */
export function stripInterleavingPairs(str: string) {
  const regex = /([a-z][0-9])([a-z][0-9])|([0-9][a-z])([0-9][a-z])/gi;
  const sanitized = str.replace(regex, (match, $1, $2, $3, $4) => {
    if ($1 && $2) {
      const [char1, digit1, char2, digit2] = match;
      const [charCode1, charCode2] = [
        char1.toLowerCase().charCodeAt(0),
        char2.toLowerCase().charCodeAt(0),
      ];

      if (charCode1 - 96 === +digit1 || charCode2 - 96 === +digit2) {
        return char1;
      }

      return `${char1}${digit1}`;
    }

    if ($3 && $4) {
      const [digit1, char1, digit2, char2] = match;
      const [charCode1, charCode2] = [
        char1.toLowerCase().charCodeAt(0),
        char2.toLowerCase().charCodeAt(0),
      ];

      if (charCode1 - 96 === +digit1 || charCode2 - 96 === +digit2) {
        return digit1;
      }
      return `${digit1}${char1}`;
    }

    return match;
  });
  return sanitized;
}

/**
 * Strips substrings of character sequences from the input string based on the given direction.

 * Direction:
 * - `1` - Checks for ascending sequences (e.g. 'abc')
 * - `-1` - Checks for descending sequences (e.g. 'cba')
 * 
 * A sequence is only considered if its length is 3 or more.
 *
 * @example
 * // returns ['abc']
 * getSequentialStrings('wxyzabc', 1)
 *
 * // returns ['cba']
 * getSequentialStrings('wxyzcba', -1)
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
    const pattern = new RegExp(`(.{${i}})\\1+`, 'gi');
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
