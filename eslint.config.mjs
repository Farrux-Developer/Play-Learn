import { defineConfig } from "eslint/config";
import next from "eslint-config-next";
import boundaries from "eslint-plugin-boundaries";

export default defineConfig([
  {
    ignores: [".next/**", "node_modules/**", "docs/**", ".playwright-cli/**"],
  },
  {
    extends: [...next],
  },
  {
    plugins: {
      boundaries,
    },
    settings: {
      "boundaries/include": [
        "app/**/*",
        "components/**/*",
        "lib/**/*",
      ],
      "boundaries/elements": [
        { type: "app", pattern: "app/**/*" },
        { type: "components", pattern: "components/**/*" },
        { type: "game-content", pattern: "lib/game/content/**/*" },
        { type: "game-mastery", pattern: "lib/game/mastery/**/*" },
        { type: "game-worker", pattern: "lib/game/worker/**/*" },
        { type: "game-core", pattern: "lib/game/core/**/*" },
        { type: "storage", pattern: "lib/storage/**/*" },
        { type: "shared", pattern: "lib/{engine,motion,data,i18n,seo,a11y}/**/*" },
      ],
    },
    rules: {
      "boundaries/dependencies": [
        "error",
        {
          default: "disallow",
          policies: [
            {
              from: { element: { type: "game-core" } },
              allow: [{ to: { element: { type: "game-core" } } }],
            },
            {
              from: { element: { type: "game-worker" } },
              allow: [{ to: { element: { type: ["game-core", "game-worker"] } } }],
            },
            {
              from: { element: { type: "game-content" } },
              allow: [{ to: { element: { type: ["game-core", "game-content", "shared"] } } }],
            },
            {
              from: { element: { type: "game-mastery" } },
              allow: [
                {
                  to: {
                    element: {
                      type: ["game-core", "game-content", "game-mastery", "shared"],
                    },
                  },
                },
              ],
            },
            {
              from: { element: { type: "storage" } },
              allow: [
                {
                  to: {
                    element: {
                      type: [
                        "game-core",
                        "game-content",
                        "game-mastery",
                        "storage",
                        "shared",
                      ],
                    },
                  },
                },
              ],
            },
            {
              from: { element: { type: "shared" } },
              allow: [
                {
                  to: {
                    element: {
                      type: ["shared", "game-core", "game-content", "game-mastery"],
                    },
                  },
                },
              ],
            },
            {
              from: { element: { type: "components" } },
              allow: [
                {
                  to: {
                    element: {
                      type: [
                        "components",
                        "game-core",
                        "game-worker",
                        "game-content",
                        "game-mastery",
                        "storage",
                        "shared",
                      ],
                    },
                  },
                },
              ],
            },
            {
              from: { element: { type: "app" } },
              allow: [
                {
                  to: {
                    element: {
                      type: [
                        "app",
                        "components",
                        "game-core",
                        "game-worker",
                        "game-content",
                        "game-mastery",
                        "storage",
                        "shared",
                      ],
                    },
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  },
  {
    files: ["lib/game/core/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: ["react", "react-*", "next", "next/*", "idb", "zod"],
        },
      ],
      "no-restricted-globals": [
        "error",
        {
          name: "window",
          message: "lib/game/core must stay pure without browser globals.",
        },
        {
          name: "document",
          message: "lib/game/core must stay pure without DOM globals.",
        },
        {
          name: "localStorage",
          message: "lib/game/core must stay pure without storage globals.",
        },
      ],
    },
  },
]);
