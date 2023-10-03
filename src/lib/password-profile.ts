import COMMON_PATTERNS from '~/lib/constants/common-patterns';
import { DEFAULT_STRENGTH_RANGES, PasswordStrengthRanges } from '~/lib/constants/strength-map';
import {
  stripInterleavingPairs,
  stripReatedStrings,
  stripSequentialStrings,
  stripPattern,
} from '~/lib/utils/string';

export type PasswordProfileOptions = {
  strengthRanges?: PasswordStrengthRanges;
  rejectedPatterns?: string[];
};

export type PasswordStrengthReport = {
  score: number;
  label: string;
  isPwned?: boolean;
  timesPwned?: number;
};

/**
 * Represents a password, providing properties that can be used to analyze its characteristics and strength.
 */
export class PasswordProfile {
  private password: string;
  private rejectedPatterns: string[];
  private strengthRanges: PasswordStrengthRanges;
  private cachedSanitizedOutput: string | undefined;

  constructor(passwordString: string, options: PasswordProfileOptions = {}) {
    this.password = passwordString;
    this.strengthRanges = options.strengthRanges ?? DEFAULT_STRENGTH_RANGES;

    // remove duplicates and sort from longest to shortest
    this.rejectedPatterns = [
      ...new Set([...COMMON_PATTERNS, ...(options.rejectedPatterns ?? [])]),
    ].sort((p1, p2) => p2.length - p1.length);
  }

  get hasNumbers() {
    return !!this.password.match(/[0-9]/);
  }

  get hasLowerCaseLetters() {
    return !!this.password.match(/[a-z]/);
  }

  get hasUpperCaseLetters() {
    return !!this.password.match(/[A-Z]/);
  }

  get hasSymbols() {
    return !!this.password.match(/[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~\s]/);
  }

  /**
   * The size of the character pool used in the password.
   */
  get poolSize() {
    let n = 0;
    if (this.hasNumbers) n += 10;
    if (this.hasSymbols) n += 34;
    if (this.hasLowerCaseLetters) n += 26;
    if (this.hasUpperCaseLetters) n += 26;
    return n;
  }

  /**
   * The sanitized version of the password from which predictable patterns are removed.
   *
   * @example
   * // returns `A23B4C7`
   * new Password('Aaa123Bbb456Ccc789').sanitized;
   */
  get sanitized() {
    if (this.cachedSanitizedOutput) {
      return this.cachedSanitizedOutput;
    }

    let output: string = this.password;

    // remove duplicates and sort from longest to shortest
    let patternsToStrip = [...new Set([...COMMON_PATTERNS, ...this.rejectedPatterns])].sort(
      (p1, p2) => p2.length - p1.length
    );

    // Strip out the key patterns first
    patternsToStrip.forEach((pattern) => {
      output = stripPattern(output, pattern);
    });

    output = stripReatedStrings(output);
    output = stripInterleavingPairs(output);
    output = stripSequentialStrings(output, 1);
    output = stripSequentialStrings(output, -1);

    return output;
  }

  /**
   * The effective entropy of the password.
   *
   * Entropy is a measure of unpredictability and is used to estimate the password's strength.
   * The entropy is computed based on the pool size of the original password but uses the length of the sanitized password.
   *
   * @example
   * // returns `35.73` instead of `107.18`
   * new Password('Aaa123Bbb456Ccc789').entropy;
   */
  get entropy() {
    return Math.log2(this.poolSize ** this.sanitized.length);
  }

  /**
   * Maps the computed entropy to a strength label based on the provided strengthRanges option.
   * If `stregthRanges` is not provided, the `DEFAULT_STRENGTH_RANGES` constant is used.
   *
   * If `pwnedPasswords` is provided, and `password` is found within, then it is considered to be
   * in the lowest strength bracket regardless of its entropy.
   */
  getStrength(pwnedPasswords?: string[]): PasswordStrengthReport {
    let entropy = this.entropy;
    let ranges = this.strengthRanges;
    let timesPwned =
      pwnedPasswords?.filter((pwnedPass) => pwnedPass === this.password).length ?? undefined;

    if (pwnedPasswords && timesPwned) {
      return {
        score: 0,
        isPwned: true,
        label: ranges[0].label,
        timesPwned,
      };
    }

    let isPwned = pwnedPasswords ? false : undefined;

    for (let { label, range } of ranges) {
      let [min, max] = range;
      if (entropy >= min && entropy <= max) {
        return { score: this.entropy, label, isPwned, timesPwned };
      }
    }

    return {
      isPwned,
      timesPwned,
      score: this.entropy,
      label: ranges.slice(-1)[0].label,
    };
  }
}
