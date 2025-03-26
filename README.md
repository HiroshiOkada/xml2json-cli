# xml2json-cli
convert XML to JSON (using xml2js) cli

## Installing
```
npm install -g @toycode/xml2json-cli
```

## Usage

```sh
xml2json [-n] [input file] [output file]
```

n is indent level

if output file is omitted, output to stdout.

if both input file and output file are omitted, read input and output to stdout.


### example

```
echo '<msg><g>Hello</g><t>World</g></msg>' | xml2json -4
```

## LICENSE

MIT

