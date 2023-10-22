const commonConfig = {
  clearMocks: true,
  coverageProvider: 'v8',
  preset: 'ts-jest',
  testMatch: ['**/?(*.)+(test).[jt]s'],
  transformIgnorePatterns: ['<rootDir>/node_modules/'],
};

// Environment-specific configuration
const environments = {
  development: {
    moduleNameMapper: {
      '^~(.*)$': '<rootDir>/src/$1',
    },
  },
  production: {
    moduleNameMapper: {
      '^~(.*)$': '<rootDir>/dist/$1.cjs',
    },
  },
};

// Choose the appropriate configuration based on the NODE_ENV value
const NODE_ENV = process.env.NODE_ENV;

if (NODE_ENV !== 'development' && NODE_ENV !== 'production') {
  throw new Error("You can only run tests in 'development' or 'production' environments.");
}

// Export the combined configuration
module.exports = {
  ...commonConfig,
  ...environments[NODE_ENV],
};
