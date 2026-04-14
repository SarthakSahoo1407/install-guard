const POPULAR_PACKAGES = [
  "express", "react", "vue", "angular", "lodash", "axios", "moment",
  "webpack", "babel", "typescript", "eslint", "prettier", "jest",
  "mocha", "chai", "next", "nuxt", "gatsby", "svelte", "jquery",
  "underscore", "async", "chalk", "commander", "inquirer", "ora",
  "nodemon", "dotenv", "cors", "mongoose", "sequelize", "prisma",
  "socket.io", "passport", "bcrypt", "jsonwebtoken", "uuid",
  "mysql", "pg", "redis", "mongodb", "fastify", "koa", "hapi",
  "request", "node-fetch", "got", "cheerio", "puppeteer",
  "sharp", "multer", "helmet", "morgan", "winston", "debug",
  "bluebird", "rxjs", "ramda", "date-fns", "dayjs", "zod",
  "yup", "ajv", "joi", "class-validator", "formik",
  "tailwindcss", "bootstrap", "sass", "less", "styled-components",
  "vite", "esbuild", "rollup", "parcel", "turbo",
];

function levenshtein(a, b) {
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }

  return dp[m][n];
}

export function checkTyposquat(name) {
  const lower = name.toLowerCase();

  if (POPULAR_PACKAGES.includes(lower)) return null;

  for (const popular of POPULAR_PACKAGES) {
    const dist = levenshtein(lower, popular);
    if (dist > 0 && dist <= 2 && Math.abs(lower.length - popular.length) <= 2) {
      return popular;
    }
  }

  return null;
}
