/**
 * Removes interleaving letter-digit pairs or digit-letter pairs from a string.
 * If a letter's position in the alphabet matches the paired digit, the pair is replaced by the letter.
 * Otherwise, the pair remains unchanged.
 *
 * @example
 * // returns 'abc'
 * removeInterleavingPairs('ab2c')
 *
 * // returns '123'
 * removeInterleavingPairs('1ab2c3')
 */
export function stripInterleavingPairs(str: string) {
  let regex = /([a-z][0-9])|([0-9][a-z])/gi;
  let sanitized = str.replace(regex, (match, $1, $2) => {
    if ($1) {
      let [char, digit] = match;
      if (char.toLocaleLowerCase().charCodeAt(0) - 96 === +digit) {
        return $1[0];
      }
    } else if ($2) {
      let [digit, char] = match;
      if (char.toLocaleLowerCase().charCodeAt(0) - 96 === +digit) {
        return $2[0];
      }
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
  let chars = str.split('');
  let sequences: Set<string> = new Set([]);
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
      let regex = new RegExp(sequence, 'gi');
      output = output.replace(regex, sequence[0]);
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
export function stripReatedStrings(str: string) {
  for (let i = Math.floor(str.length / 2); i > 0; i--) {
    const pattern = new RegExp(`(.{${i}})\\1+`, 'gi');
    str = str.replace(pattern, '$1');
  }
  return str;
}

export function stripPattern(str: string, pattern: string) {
  let regex = new RegExp(pattern, 'gi');
  return str.replace(regex, pattern[0]);
}
