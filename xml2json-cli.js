#!/usr/bin/env node

const fs = require('fs');
const parseString = require('xml2js').parseString;
const INDENT_REX = /^-(\d+)$/;

const argv = Array.prototype.slice.call(process.argv, 2);

let indent = 0;
let input = undefined;
let output = undefined;

while (argv.length > 0) {
  const arg = argv.shift();
  if (INDENT_REX.test(arg) && !indent) {
    indent = parseInt(arg.match(INDENT_REX)[1],10);
  } else if (!input) {
    input = fs.createReadStream(arg);
  } else if (!output) {
    output = fs.createWriteStream(arg);
  } else {
    console.error('too may arguments');
    process.exit(1);
  }
}

input || (input = process.stdin);
output || (output = process.stdout);

input.setEncoding && input.setEncoding('utf8');

let src = '';
input.on('data', (chunk) => src += chunk);
input.on('end', () => {
  parseString(src, (err, src) => {
    if (err) {
      console.error(err.message);
      process.exit(1);
    }
    const result = JSON.stringify(src, null, indent);
    output.write(result, 'utf8', (err) => {
      if (err) {
        console.log('ERROR');
        console.error(err);
        process.exit(1);
      }
    });
    if (output !== process.stdout) {
      output.end();
    }
  });
});
