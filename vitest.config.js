// CommonJS on purpose: package.json has no "type": "module" (Parcel project).
/** @type {import("vitest/config").UserConfig} */
module.exports = {
    test: {
        environment: "happy-dom",
        include: ["test/**/*.test.js"],
        exclude: [
            "**/node_modules/**",
            "**/.git/**",
            "dist/**",
            "tmp/**",
            ".parcel-cache/**"
        ],
        restoreMocks: true
    }
};
