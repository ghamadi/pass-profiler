import { PasswordStrengthRanges } from '~/lib/constants/strength-map';
import { SanitizersList } from '~/lib/password-profiler';
import { sha1 } from '~/lib/utils/crypto';

export type PasswordProfileOptions = {
  strengthRanges: PasswordStrengthRanges;
  sanitizersList: SanitizersList;
  rejectedPatterns: string[];
  strict: boolean;
};

/**
 * Represents a password, providing properties that can be used to analyze its characteristics and strength.
 */
export default class PasswordProfile {
  private readonly password: string;
  private readonly options: PasswordProfileOptions;

  private cachedSanitizedOutput?: string[];

  constructor(passwordString: string, options: PasswordProfileOptions) {
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
   * Returns an array with symbols representing the composition of the password
   *
   * - U => Uppercase
   * - L => Lowercase
   * - D => Digit
   * - S => Special character
   */
  get composition() {
    return (['U', 'L', 'D', 'S'] as const).filter((c) => {
      return (
        (c === 'U' && this.hasUpperCaseLetters) ||
        (c === 'L' && this.hasLowerCaseLetters) ||
        (c === 'D' && this.hasNumbers) ||
        (c === 'S' && this.hasSymbols)
      );
    });
  }

  get poolSize() {
    let n = 0;
    if (this.hasNumbers) n += 10;
    if (this.hasSymbols) n += 34;
    if (this.hasLowerCaseLetters) n += 26;
    if (this.hasUpperCaseLetters) n += 26;
    return n;
  }

  /**
   * Maps the list of sanitizers to a list of sanitized versions of the password.
   */
  get sanitizedVersions() {
    if (!this.cachedSanitizedOutput) {
      const { sanitizersList } = this.options;
      this.cachedSanitizedOutput = sanitizersList.map((sanitizers) =>
        sanitizers.reduce((output, sanitizer) => sanitizer(output), this.password)
      );
    }
    return [...new Set(this.cachedSanitizedOutput)];
  }

  /**
   * The effective entropy from the list of sanitized passwords.
   * Uses the minimum of all possible entropy values in strict mode, and the average otherwise.
   *
   * Entropy is a measure of unpredictability and is used to estimate the password's strength.
   * The input for the entropy formula is the original pool size and the sanitized password's length.
   */
  get entropy() {
    if (this.options.strict) {
      return parseFloat(
        Math.min(
          ...this.sanitizedVersions.map((sanitized) => Math.log2(this.poolSize ** sanitized.length))
        ).toFixed(2)
      );
    }

    const sum = this.sanitizedVersions.reduce(
      (sum, sanitized) => sum + Math.log2(this.poolSize ** sanitized.length),
      0
    );
    return parseFloat((sum / this.sanitizedVersions.length).toFixed(2));
  }

  /**
   * Maps the computed entropy to a strength label based on the provided strengthRanges.
   */
  get strength() {
    const { strengthRanges } = this.options;
    const { entropy } = this;

    for (let { label, range } of strengthRanges) {
      let [min, max] = range;
      if (entropy >= min && entropy <= max) {
        return label;
      }
    }

    return strengthRanges.slice(-1)[0].label;
  }

  async getHash() {
    return sha1(this.password);
  }
}
