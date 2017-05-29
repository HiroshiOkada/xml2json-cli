#!/bin/bash

echo -n 'conver XML to JSON no indent: '
  ./xml2json-cli.js <./test/test.xml | diff -u - ./test/test.json || exit 1
  echo "OK"

echo -n 'convert XML to JSON with indent: '
  ./xml2json-cli.js -4 <./test/test.xml | diff -u - ./test/test-4.json || exit 1
  echo "OK"

echo -n 'read XML file out JOSN to stdout: '
  ./xml2json-cli.js ./test/test.xml | diff -u - ./test/test.json || exit 1
  echo "OK"

echo -n 'read XML file out JSON to file: '
  ./xml2json-cli.js ./test/test.xml tmp.$$.json
  diff -u tmp.$$.json ./test/test.json || exit 1
  echo "OK"
  rm -f tmp.$$.json

echo -n "large xml file to json: "

  echo '<root>' > tmp.$$.xml
  for i in $(seq 0 29999); do
      echo "<c>$i</c>" >> tmp.$$.xml
  done
  echo '</root>' >> tmp.$$.xml

  echo -n '{"root":{"c":["0"' > tmp-exp.$$.json
  for i in $(seq 1 29999); do
      echo -n ",\"$i\"" >> tmp-exp.$$.json
  done
  echo -n "]}}" >> tmp-exp.$$.json

  ./xml2json-cli.js tmp.$$.xml tmp-act.$$.json
  diff -u tmp-exp.$$.json tmp-act.$$.json  || exit 1
  echo "OK"
  rm -f tmp-exp.$$.json tmp-act.$$.json tmp.$$.xml


echo "ALL OK"

