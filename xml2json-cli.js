#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { parseStringPromise } = require('xml2js');

const INDENT_REX = /^-(\d+)$/;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB limit

/**
 * Check if the provided path is safe (no directory traversal or absolute path)
 * @param {string} p - The file path to check.
 * @returns {boolean} - True if safe, false otherwise.
 */
function isSafePath(p) {
  return !p.includes('..') && !path.isAbsolute(p);
}

/**
 * Check file size against a limit.
 * @param {string} p - The file path.
 * @param {number} limit - The file size limit in bytes.
 * @throws Will throw an error if file size exceeds the limit.
 */
function checkFileSize(p, limit = MAX_FILE_SIZE) {
  try {
    const stats = fs.statSync(p);
    if (stats.size > limit) {
      throw new Error(`File size of "${p}" exceeds limit of ${limit} bytes`);
    }
  } catch (err) {
    // If the file does not exist, skip the size check
  }
}

// Display help if '-h' or '--help' is provided
if (process.argv.includes('-h') || process.argv.includes('--help')) {
  console.log(`Usage: xml2json-cli.js [-<indent>] [inputFile] [outputFile]
  -<indent>    Optional indent level for JSON output.
  inputFile   Optional input XML file. Defaults to stdin.
  outputFile  Optional output JSON file. Defaults to stdout.`);
  process.exit(0);
}

const argv = process.argv.slice(2);
let indent = 0;
let inputPath = null;
let outputPath = null;

while (argv.length > 0) {
  const arg = argv.shift();
  if (INDENT_REX.test(arg) && indent === 0) {
    indent = parseInt(arg.match(INDENT_REX)[1], 10);
  } else if (!inputPath) {
    if (!isSafePath(arg)) {
      console.error('Unsafe input file path.');
      process.exit(1);
    }
    inputPath = arg;
    checkFileSize(inputPath);
  } else if (!outputPath) {
    if (!isSafePath(arg)) {
      console.error('Unsafe output file path.');
      process.exit(1);
    }
    outputPath = arg;
  } else {
    console.error('Too many arguments.');
    process.exit(1);
  }
}

let input;
let output;

if (inputPath) {
  input = fs.createReadStream(inputPath, { encoding: 'utf8' });
} else {
  input = process.stdin;
  if (input.setEncoding) input.setEncoding('utf8');
}

if (outputPath) {
  output = fs.createWriteStream(outputPath, { encoding: 'utf8' });
} else {
  output = process.stdout;
}

let src = '';
input.on('data', (chunk) => { 
  src += chunk;
});

input.on('end', async () => {
  try {
    const parsed = await parseStringPromise(src);
    const result = JSON.stringify(parsed, null, indent);
    output.write(result, 'utf8', (err) => {
      if (err) {
        console.error('Error writing output:', err);
        process.exit(1);
      }
    });
    if (output !== process.stdout) {
      output.end();
    }
  } catch (err) {
    console.error('XML parsing error:', err.message);
    process.exit(1);
  }
});
