import typescript from "rollup-plugin-typescript";

export default {
    input: "js/src/main.ts",
    output: {
        file: "js/main.bundle.js"
    },
    plugins: [typescript()],
};
