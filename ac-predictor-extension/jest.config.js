/*
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/en/configuration.html
 */

module.exports = {
    roots: ["<rootDir>/test"],
    testMatch: ["**/?(*.)+(spec|test).+(ts|tsx|js)"],
    transform: {
        "^.+\\.(ts|tsx)$": "ts-jest"
    },
    clearMocks: true,
    coverageDirectory: "coverage",
    coveragePathIgnorePatterns: ["/node_modules/"],
    coverageProvider: "babel"
};
