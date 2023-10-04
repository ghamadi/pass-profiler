## Overview

A lightweight and efficient library designed to analyze and assess the strength of passwords. The strength-measuring algorithm relies on entropy computation while being aware of predictable patterns and commonly used keywords within the password.

## How it Works

The algorithm measures a password's strength in three main steps:

### 1. Character Pool Size Computation

The library first determines the presence of different character types in the password.

### 2. Password Sanitzation

The password is sanitized by removing predictable patterns. This step serves two purposes:

- Making the evaluated password far more random.
- Nullifying the effect that the predictable patterns have on the password's length.

This sanitization allows the entropy computation to be more reliable, as it reintroduces a degree of randomness and penalizes the original password by reducing its length.

### 3. Entropy Calculation & Strength Mapping

Entropy is calculated based on the formula `E = log_2(N^L)` where:

- `E` is entropy
- `N` is the original pool size
- `L` is the length of the _sanitized_ password

The value of entropy is then mapped to a strength label using a predefined mapping list, which users can override.

## Usage

### Basic Usage

```ts
import { PasswordProfile } from 'pass-profiler';

const passProfile = new PasswordProfile('Aaa123Bbb456Ccc789');
console.log(passProfile.poolSize); // 62
console.log(passProfile.sanitized); // "A23B4C7"
console.log(passProfile.entropy); // 41.68
console.log(passProfile.getStrength()); // Weak
```

### Custom Strength Ranges

```ts
const options = {
  strengthRanges: [
    { label: 'Weak', range: [0, 40] },
    { label: 'Moderate', range: [41, 70] },
    { label: 'Strong', range: [71, 100] },
    // ... add more if needed
  ],
};

const myPassProfile = new PasswordProfile('MyPassword123', options);
```

## Motivation

According to the [NIST guidelines](https://pages.nist.gov/800-63-3/sp800-63b.html#appA) on the strength of memorized secrets (i.e., user-provided passwords), length and complexity are the key factors of a password's strength. However, while enforcing a minimum-length policy improves security, composition rules meant to enforce complexity can be counter productive.

> "...users respond in very predictable ways to the requirements imposed by composition rules..."

To ensure a password's security, a verifier needs to penalize sources of predictability without becoming a source of predictability itself.

### Why Composition Rules Don't Work

A password verifier that imposes composition rules suffers from three main weaknesses:

1. The total number of possible passwords decreases as the number of rules increases
2. Users, being human, often respond in predictable patterns to fulfill the rules
3. Constraints can make the resulting password harder to remember

Because password cracking is almost never a simple brute-force effort, these limitations can increase the vulnaribility of a password by decreasing its unpredictability. Composition rules also mistakenly suggest that a password is strong if and only if it lacks any pattern, which is not necessarily true.

For example, the password `Done_Wind_Brown1234_Pa$sword` is quite strong despite containing a variation of "password" and a predictable sequence "1234". Its varied composition, unclear overall pattern, and 28-character length make it robust.

A verifier shouldn't reject such passwords using boolean rules like "no sequential numbers". Instead, accounting for the presence of predictable patterns allows the verifier to strike a balance between imposing needless limitations and enabling weak passwords, disguised as string, such as `aaaBBBcccDDDeee@@@123`.

### Understanding Entropy

Recall the entropy calculation formula is `E = log_2(N^L)`.

Assuming all passwords are equally likely, there are `N^L` possible combinations. The base-2 logarithm tells us how many bits are required to represent a number in binary. So, `log_2(N^L)` tells us how many bits we'd need to represent all possible passwords.

The number of bits required to represent all possible passwords is a direct measure of the unpredictability of a single, randomly chosen password. Each added bit doubles the number of possible representations, thus doubling the unpredictability.

If we have `X` bits of entropy, then we have `2^X` equally likely possibilities for a password. In other words, the higher the entropy, the more guesses a computer must make to crack the password. You have probably seen this relationship in the famous [comic by XKCD](https://xkcd.com/936/).
<p align="center">
  <img src="https://github.com/ghamadi/pass-profiler/assets/48609768/bd052faf-acff-4e49-913b-c6a7a37107d3">
</p>

### Why the Password Sanitization Step?

The entropy computation formula assumes all characters within the pool have an equal chance of selection. However, when users create a password, this assumption is often false.

Selecting a completely random password is challenging for us, and this affects the reliability of the entropy value. Consider the password: `1111111111111111111111`. Solely based on entropy, it would be deemed strong. However, in reality, it's highly predictable. Rule-based attacks would quickly crack passwords like this, which is why many systems impose composition rules.

By stripping predictable patterns from passwords before computing entropy, we reintroduce a degree of randomness and enhance the reliability of the entropy value. Identifying and eliminating patterns and common keywords not only increases the randomness of the sanitized password but also negates the misleading effect of length introduced by these patterns.

## Conclusion

Blind reliance on entropy does not work with user-provided passwords. Likewise, enforcing boolean composition rules, like "must contain at least one number", is flawed. Additionally, the approach of computing a score by [adding and taking out points](https://www.uic.edu/apps/strong-password/) based on composition rules can also be misled by patterns designed to circumvent these rules.

Example:
The password `aaBBcc123` has `53.59 bits` of theoretical entropy, and passes as a strong password on the meter implemented by UIC.

If we strip this password down by first removing repetitions, we get `aBc123`. Then when we further strip the password by taking out sequences, we get `a1`; which cannot pass any meter.

The entropy of the stripped down version is `11.91`. Whether this number is indeed its entropy matters less than the fact that the verifier is far more likely to be pessimistic than optimistic when it produces an inaccurate measurement.
