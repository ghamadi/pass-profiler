## Overview

A lightweight and efficient library designed to analyze and assess the strength of passwords. The strength-measuring algorithm relies on entropy computation while being aware of predictable patterns and commonly used keywords within the password.

## How it Works

The algorithm measures a password's strength in three main steps:

### 1. Character Pool Size Computation

The library first determines the presence of different character types in the password.

### 2. Password sanitization

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
import PasswordProfiler from 'password-profiler';

const profiler = new PasswordProfiler();
const profile = profiler.parse('Aaa1bbb2ccc3ddd4eee5');

console.log(profile.sanitzedVersions); // ['Ace5']
console.log(profile.entropy); // 20.68
console.log(profile.strength); // 'Very Weak'
```

> **Note:**
>
> The password above has a clearly predictable pattern, and is likely not hard to crack, but would pass as a very strong password with many password checkers.
>
> These include [Kasperky's password checker](https://password.kaspersky.com) and the [UIC password checker](https://www.uic.edu/apps/strong-password/).

### Advanced Usage

The `PasswordProfiler` constructor accepts configuration options to customize the sanitization step.

#### 1. `rejectedPatterns`

In many cases, certain words or patterns that are contextually relevant to a given application can reduce entropy. A common example for this would be the user's first name, family name, username, etc...

The `PasswordProfiler` will look for these patterns in the password and remove them (down to the first character) as part of the sanitization process.

`rejectedPatterns` can be in passed as plain strings or regular expressions. All rejected patterns will be used in a case-insensitive match.

> **Note:**
>
> All matching of values is case _insensitive_, you should not worry about the case of your pattern, nor should you expect the profiler to respect the casing. This ensures a more pessimistic computation of entropy.
>
> Regular expressions should be wrapped with `/` and cannot have flags. (e.g., `/someword[0-9]+/`)

```ts
import PasswordProfiler from 'password-profiler';

const profiler = new PasswordProfiler({
  rejectedPatterns: ['ghaleb'],
});
const profile = profiler.parse("ghaleb'sPa$$word");

console.log(profile.sanitzedVersions); // ["g'sP"]
console.log(profile.entropy); // 25.71
console.log(profile.strength); // 'Very Weak'
```

#### 2. `sanitizers`

The `PasswordProfiler` generates 5 sanitizing steps:

1. Strip down rejected patterns (predefined common patterns + `customPatterns`)
2. Strip down substring that are consequtively repeated (e.g., `aaabbb` => `ab`)
3. Strip down characters that are ascendingly sequential
4. Strip down characters that are descendingly sequential
5. Strip down pairs of interleaving letters & numbers (e.g., `a1b2` => `a1`)

By default, these steps will run in this order, with the output of each step piped as the input of the next. By passing an array of sanitizer callbacks to the `PasswordProfiler` you can replace these steps with your custom sanitization steps.

#### 3. `exhaustive`

When `true` the `PasswordProfile` will generate all possible permutations of the `sanitizers` and run all of them to generate a list of unique sanitized passwords representing all possible outputs based on the given `sanitizers`.

The computed entropy would be the _minimum_ entropy computed from all the generated versions by default.

Due to the deliberate order of the default sanitizers, the values will rarely differ when the `exhaustive` mode is enabled.

#### 4. `strict`

This is `true` by default.

When `false`:

1. Repeated strings matching becomes case sensitive (`JavaJAVA` => `JavaJAVA`)
2. The entropy computed in `exhaustive` mode is the _average_ of all entropies

> **Note:**
>
> This configuration is not yet supported. At this stage, the profiler only operates in strict mode.

## Motivation

According to the [NIST guidelines](https://pages.nist.gov/800-63-3/sp800-63b.html#appA) on the strength of memorized secrets (i.e., user-provided passwords), length and complexity are the key factors of a password's strength. However, while enforcing a minimum-length policy improves security, composition rules meant to enforce complexity can be counter productive.

> "...users respond in very predictable ways to the requirements imposed by composition rules..."

To ensure a password's security, a verifier needs to penalize sources of predictability without becoming a source of predictability itself.

### Why Composition Rules Don't Work

A password verifier that imposes composition rules suffers from three main weaknesses:

1. The total number of possible passwords decreases as the number of rules increases
2. Users, being human, often respond in predictable patterns to fulfill the rules
3. Constraints can make the resulting password harder to remember

Because password cracking is almost never a simple brute-force effort, these limitations can increase the vulnerability of a password by decreasing its unpredictability. Composition rules also mistakenly suggest that a password is strong if and only if it lacks any pattern, which is not necessarily true.

For example, the password `Done_Wind_Brown1234_Pa$sword` is quite strong despite containing a variation of "password" and a predictable sequence "1234". Its varied composition, unclear overall pattern, and 28-character length make it robust.

A verifier shouldn't reject such passwords using binary rules like "no sequential numbers". Instead, accounting for the presence of predictable patterns allows the verifier to strike a balance between imposing needless limitations and enabling weak passwords, disguised as string, such as `aaaBBBcccDDDeee@@@123`.

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
