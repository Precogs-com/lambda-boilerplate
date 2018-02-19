#!/usr/bin/env node

const program = require('commander');
const lb = require('../src/index').prompt;

let lPath;
let lName;

program
  .version('1.0.0')
  .description('Generate a Lambda boilerplate from template')
  .arguments('[lambda_path] [lambda_name]')
  .action((lambdaPath, lambdaName) => {
    lPath = lambdaPath;
    lName = lambdaName;
  })
  .parse(process.argv);

lb(lPath, process.env.LAMBDA_TEMPLATES_PATH, lName)
  .then(() => {
    console.log('Lambda generated');
    process.exit(0);
  })
  .catch((err) => {
    console.log(err.message);
    process.exit(1);
  });
