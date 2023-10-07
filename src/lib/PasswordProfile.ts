import { ProfileOptions, PasswordStrengthReport } from './password-profile';

/**
 * Represents a password, providing properties that can be used to analyze its characteristics and strength.
 */

export class PasswordProfile {
  private readonly password: string;
  private readonly options: ProfileOptions;

  private cachedSanitizedOutput?: string[];

  constructor(passwordString: string, options: ProfileOptions) {
    this.password = passwordString;
    this.options = options;
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
    if (!this.cachedSanitizedOutput) {
      const { sanitizersList } = this.options;

      this.cachedSanitizedOutput = sanitizersList.map((sanitizers) => {
        return sanitizers.reduce((output, sanitizer) => sanitizer(output), this.password);
      });
      // let output: string = this.password;
      // this.cachedSanitizedOutput = output;
      // return output;
    }
    return this.cachedSanitizedOutput;
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
    let ranges = this.options.strengthRanges;
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
