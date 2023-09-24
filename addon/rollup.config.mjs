import typescript from "rollup-plugin-typescript";
import html from "rollup-plugin-html";
import scss from 'rollup-plugin-scss';
import json from '@rollup/plugin-json';
import packageJson from "./package.json" assert { type: "json" };

const namespace = "http://ac-predictor.azurewebsites.net/";

const userScriptBanner = `
// ==UserScript==
// @name         ${packageJson.name}
// @namespace    ${namespace}
// @version      ${packageJson.version}
// @description  ${packageJson.description}
// @author       ${packageJson.author}
// @license      ${packageJson.license}
// @match        https://atcoder.jp/*
// @exclude      /^https://atcoder\\.jp/[^#?]*/json/
// @grant        none
// ==/UserScript==`.trim();

export default [
  {
    input: "src/main.ts",
    output: {
      banner: userScriptBanner,
      file: "dist/userscript/dist.js"
    },
    plugins: [
      html({
        include: "**/*.html"
      }),
      scss({
        output: false
      }),
      json(),
      typescript()
    ]
  }
];
