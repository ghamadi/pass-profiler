type CryptoAPI = {
  digest: (algo: AlgorithmIdentifier, data: Uint8Array) => Promise<Uint8Array> | Uint8Array;
};

let cryptoAPI: CryptoAPI;

if (typeof window !== 'undefined' && window.crypto) {
  // Browser environment
  cryptoAPI = {
    async digest(algo: AlgorithmIdentifier, data: Uint8Array): Promise<Uint8Array> {
      const hashBuffer = await window.crypto.subtle.digest(algo, data);
      return new Uint8Array(hashBuffer);
    },
  };
} else if (typeof process !== 'undefined' && process.version) {
  // Node.js environment
  const crypto = require('crypto');
  cryptoAPI = {
    digest(algo: AlgorithmIdentifier, data: Uint8Array): Uint8Array {
      return crypto.createHash(algo).update(Buffer.from(data)).digest();
    },
  };
} else {
  throw new Error('Unsupported environment');
}

export async function sha1(input: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashArray = await Promise.resolve(cryptoAPI.digest('SHA-1', data));

  return Array.from(hashArray)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
