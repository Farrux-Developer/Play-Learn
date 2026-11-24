import { defineConfig } from "eslint/config";
import next from "eslint-config-next";

export default defineConfig([
  {
    ignores: [".next/**", "node_modules/**", "vendor/**"],
  },
  {
    files: ["app/**/*.ts", "app/**/*.tsx"],
    extends: [...next],
  },
  {
    files: ["app.js", "data.js", "js/**/*.js", "data/**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "script",
      globals: {
        window: "readonly",
        document: "readonly",
        localStorage: "readonly",
        navigator: "readonly",
        performance: "readonly",
        requestAnimationFrame: "readonly",
        cancelAnimationFrame: "readonly",
        IntersectionObserver: "readonly",
        ResizeObserver: "readonly",
        CustomEvent: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        console: "readonly",
        AudioContext: "readonly",
        webkitAudioContext: "readonly",
        WebGLRenderingContext: "readonly",
        HTMLElement: "readonly",
        Node: "readonly",
        PL: "writable",
        PL_DATA: "writable",
        gsap: "readonly",
        ScrollTrigger: "readonly",
        SplitText: "readonly",
        Flip: "readonly",
        Draggable: "readonly",
        MotionPathPlugin: "readonly",
        DrawSVGPlugin: "readonly",
        Motion: "readonly",
        lucide: "readonly",
      },
    },
    rules: {
      "no-unused-vars": ["error", { argsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" }],
      "no-undef": "error",
      "no-redeclare": "error",
    },
  },
]);
