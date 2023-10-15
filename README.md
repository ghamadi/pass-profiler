## Overview

A lightweight and efficient library designed to analyze and assess the strength of passwords. The strength-measuring algorithm relies on entropy computation while being aware of predictable patterns and commonly used keywords within the password.

## How it Works

The algorithm measures a password's strength in three main steps:

### 1. Character Pool Size Computation

The library first determines the presence of different character types in the password.

### 2. Password sanitization

The password is sanitized by removing predictable patterns. This step allows the computed entropy to be more reliable by achieving two purposes:

1. Reintroducing a degree of randomness.
2. Nullifying the effect that the predictable patterns have on the password's length.

The `PasswordProfiler` first removes rejected patterns and then runs 4 sanitizing steps by default:

1. Strip down substring that are consequtively repeated (e.g., `aaabbb` => `ab`)
2. Strip down characters that are ascendingly sequential
3. Strip down characters that are descendingly sequential
4. Strip down pairs of interleaving letters & numbers (e.g., `A1b1` => `A1`)

The output from each step is piped into the next. The profiler generates all possible permutations of these steps to produce a final list of unique sanitized passwords.

### 3. Entropy Calculation & Strength Mapping

Entropy is calculated based on the formula `E = log_2(N^L)` where:

- `E` is entropy
- `N` is the original pool size
- `L` is the length of the _sanitized_ password

Entropy values are mapped to strength labels based on a predefined list. Users can override this list if needed.

## Usage

### Basic Usage

```ts
import PasswordProfiler from 'pass-profiler';

const profiler = new PasswordProfiler();
const profile = profiler.parse('Aa1bb2cc3dd4ee5');

console.log(profile.sanitizedVersions); // [ 'Aace5', 'Aa1b2c3d4e5' ]
console.log(profile.entropy); // 47.63
console.log(profile.strength); // 'Weak'
```

> **Note**
>
> The password above is indeed predictable, evident by its lowercase version `'aa1bb2cc3dd4ee5'` appearing in leaked passwords databases.
>
> Despite this, most password verifiers, including [Kasperky's password checker](https://password.kaspersky.com) and the [UIC password checker](https://www.uic.edu/apps/strong-password/), would deem it very strong.

### Advanced Usage

The `PasswordProfiler` constructor offers configuration options to refine the sanitization step.

#### 1. `rejectedPatterns`

Certain words or patterns that are contextually relevant to a given application can reduce entropy. A common example for this would be the user's first name, family name, and username. The `PasswordProfiler` seeks and removes these patterns as part of the sanitization process.

Users can provide `rejectedPatterns` as a list of plain strings or regular expressions.

```ts
import PasswordProfiler from 'pass-profiler';

const profiler = new PasswordProfiler({
  rejectedPatterns: ['john'],
});

// "PA$$WORD" is one of the default rejected patterns
const profile = profiler.parse("john'sPa$$word");

console.log(profile.sanitzedVersions); // ["g'sP"]
console.log(profile.entropy); // 25.71
console.log(profile.strength); // 'Very Weak'
```

> **Note**
>
> Pattern matching is case _insensitive_, and regular expressions should be wrapped with `/` and should not include flags. (e.g., `/someword[0-9]+/`)

#### 2. `sanitizers`

Custom sanitizer callbacks can replace the default steps by passing an array to the `PasswordProfiler`. The order of sanitizers is irrelevant, as the profiler runs them in all potential sequences.

#### 4. `strict`

By default, the **average entropy** of all sanitized passwords is used as the effective entropy. When `strict` is set to `true`, the profiler uses the **minimum entropy** value instead.

## Motivation

According to the [NIST guidelines](https://pages.nist.gov/800-63-3/sp800-63b.html#appA) on the strength of memorized secrets (i.e., user-generated passwords), length and complexity pivotal. However, while enforcing a minimum-length policy improves security, composition rules meant to enforce complexity can be counter productive.

> _"...users respond in very predictable ways to the requirements imposed by composition rules..."_

To ensure a password's security, a verifier must penalize predictability without becoming a source of predictability itself.

### Why Composition Rules Don't Work

Password verifiers relying on composition rules suffer from three main flaws:

1. As the number of rules increases, The total number of possible passwords decreases
2. Humans respond in predictable patterns to fulfill the rules
3. Constraints can make the resulting password harder to remember

Because password cracking is almost never a simple brute-force effort, these limitations can increase the vulnerability of a password by diminishing its unpredictability. Composition rules also mistakenly suggest that a password is strong if and only if it lacks any pattern, which is not necessarily true.

For example, the password `Done_Wind_Brown1234_Pa$sword` is robust, due to its varied composition, unclear overall pattern, and 28-character length, _despite_ containing predictable components such as "1234" and "Pas$word".

A verifier shouldn't reject such passwords using binary rules like "no sequential numbers". Instead, accounting for the presence of predictable patterns allows the verifier to strike a balance between imposing needless limitations and enabling weak passwords, disguised as strong, such as `aaaBBBcccDDDeee@@@123`.

### Understanding Entropy

Recall the entropy calculation formula is `E = log_2(N^L)`.

Assuming all passwords are equally likely, there are `N^L` possible combinations. The base-2 logarithm tells us the bits required to represent a number in binary. Hence, `log_2(N^L)` tells us the number of bits needed to represent all possible passwords.

This number is a direct measure of the unpredictability of a single, randomly chosen password. Each added bit doubles the number of possible representations, thus doubling the unpredictability.

`X` bits of entropy, means `2^X` equally likely passwords. In other words, the higher the entropy, the more guesses a computer must make to crack the password. You have probably seen this relationship in the famous [comic by XKCD](https://xkcd.com/936/).

<p align="center">
  <img src="https://github.com/ghamadi/pass-profiler/assets/48609768/bd052faf-acff-4e49-913b-c6a7a37107d3">
</p>

### Why the Password Sanitization Step?

Entropy computation assumes all characters within the pool have an equal chance of selection. However, when users create a password, this assumption is often false.

Selecting a completely random password is challenging for us, and this affects the reliability of the entropy value. Consider the password: `1111111111111111111111`. Solely based on entropy, it would be deemed strong. Yet, it is highly predictable, and rule-based attacks would quickly crack passwords like this, which is why many systems impose composition rules.

By stripping predictable patterns from passwords before computing entropy, we reintroduce a degree of randomness and enhance the reliability of the entropy value. Identifying and eliminating patterns and common keywords not only increases the randomness of the sanitized password but also negates the misleading effect of length introduced by these patterns.

## Conclusion

Blind reliance on entropy does not work with user-provided passwords. Likewise, enforcing boolean composition rules, like "must contain at least one number", is flawed. Additionally, the approach of computing a score by [adding and taking out points](https://www.uic.edu/apps/strong-password/) based on composition rules can also be misled by patterns designed to circumvent these rules.

### Example:

The password `aaBBcc123` has `53.59 bits` of theoretical entropy, and passes as a strong password on the meter implemented by UIC.

If we strip this password down by first removing repetitions, we get `aBc123`. Then, when we further strip the password by removing sequences, we get `a1`; which cannot pass any meter.

Whether the final computed entropy is indeed the password's real entropy matters less than the fact that the verifier is far more likely to be pessimistic than optimistic when it produces an inaccurate measurement.
