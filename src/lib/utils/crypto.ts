type CryptoAPI = {
  digest: (algo: AlgorithmIdentifier, data: Uint8Array) => Promise<Uint8Array> | Uint8Array;
};

const ALGO_MAP: Record<string, { browser: string; node: string }> = {
  sha1: {
    browser: 'SHA-1',
    node: 'sha1',
  },
};

let cryptoAPI: CryptoAPI;

if (typeof window !== 'undefined' && window.crypto) {
  // Browser environment
  cryptoAPI = {
    async digest(algo: AlgorithmIdentifier, data: Uint8Array): Promise<Uint8Array> {
      const hashBuffer = await window.crypto.subtle.digest(ALGO_MAP[algo as string].browser, data);
      return new Uint8Array(hashBuffer);
    },
  };
} else if (typeof process !== 'undefined' && process.version) {
  // Node.js environment
  const crypto = require('crypto');
  cryptoAPI = {
    digest(algo: AlgorithmIdentifier, data: Uint8Array): Uint8Array {
      return crypto
        .createHash(ALGO_MAP[algo as string].node)
        .update(Buffer.from(data))
        .digest();
    },
  };
} else {
  throw new Error('Unsupported environment');
}

export async function sha1(input: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashArray = await Promise.resolve(cryptoAPI.digest('sha1', data));

  return Array.from(hashArray)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
