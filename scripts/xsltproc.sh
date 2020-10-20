#!/bin/bash

CMD=$(command -v xsltproc)

print_error () {
    echo "ERROR: $1" 1>&2
}

if [ -z "$CMD" ]; then
    print_error "xsltproc could not be found"
    exit -1
fi

OUT_DIR="generated"
XML_DEF_PATH="LTK/Definitions/Core/llrp-1x0-def.xml"

[ -e "$OUT_DIR" ] || mkdir -p $OUT_DIR

CMD_ARG_LIST=(
    # generate LLRP.js definitions file
    "--output $OUT_DIR/def.json xslt/llrpjs-gen-jsondef.xslt $XML_DEF_PATH"
    # generate LLRP protocol definitions schema
    "--output $OUT_DIR/def.schema.json xslt/llrpjs-gen-jsonschema.xslt $XML_DEF_PATH"
)

for ((i = 0; i < ${#CMD_ARG_LIST[@]}; i++)); do
    echo $CMD ${CMD_ARG_LIST[$i]}
    $CMD ${CMD_ARG_LIST[$i]}
done