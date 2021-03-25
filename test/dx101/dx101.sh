#!/bin/bash

# Definitions
ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
OUT_DIR="$ROOT/out"
JSON2LLRP="$ROOT/../../dist/bin/json2llrp.js"
LLRP2JSON="$ROOT/../../dist/bin/llrp2json.js"
CVS=$(command -v cvs)
NODE=$(command -v node)
DX101="$ROOT/LTK/Tests/dx101"

execute () {
    echo "$1"
    $1
    if [ $? -ne 0 ]; then
        print_error "\"$1\" failed"
        exit 1
    fi
}

deep_diff () {
    $NODE -p "let expect = require(\"chai\").expect; file1 = require(\"$1\"); file2 = require(\"$2\"); try {expect(file1).to.deep.equal(file2); process.exit(0)} catch{process.exit(1)}"
}

# Check if cvs is available
if [ -z "$CVS" ]; then
    print_error "cvs could not be found"
    exit 1
fi

echo "Download LTK DX101 test files"
execute "$CVS -z3 -d:pserver:anonymous@a.cvs.sourceforge.net:/cvsroot/llrp-toolkit co -P LTK/Tests/dx101"

# Make sure we have output directory
[ -e "$OUT_DIR" ] || mkdir -p $OUT_DIR

echo "Generate .json files from original (LTK) .bin"

for file in $(ls $DX101/dx101_[a-z].bin); do
    OUT_FILE="$OUT_DIR/$(basename -s .bin $file).json"
    [ -e "$OUT_FILE" ] || execute "$NODE $LLRP2JSON $file -o $OUT_FILE"
done

echo "Generate .bin files from generated .json"

for file in $(ls $OUT_DIR/dx101_*.json); do
    OUT_FILE="$OUT_DIR/$(basename -s .json $file).bin"
    [ -e "$OUT_FILE" ] || execute "$NODE $JSON2LLRP $file -o $OUT_FILE"
done

echo "Generate .json files from generated .bin"

for file in $(ls $OUT_DIR/dx101_*.bin); do
    OUT_FILE="$OUT_DIR/_$(basename -s .bin $file).json"
    [ -e "$OUT_FILE" ] || execute "$NODE $LLRP2JSON $file -o $OUT_FILE"
done

echo "Compare 2nd round .json with 1st round .json"

for file in $(ls $OUT_DIR/dx101_*.json); do
    echo -n "$(basename $file)"
    (deep_diff $file $OUT_DIR/_$(basename $file) && echo " ... success") || echo " ... failed"
done