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

[ -e "$OUT_DIR" ] || mkdir -p $OUT_DIR

CMD_ARG_LIST=(
    # generate LLRP.js definitions file
    "--output $OUT_DIR/llrpjs.def.json xslt/llrpjs-gen-jsondef.xslt LTK/Definitions/Core/llrp-1x0-def.xml"
    # generate LLRP.js protocol schema
    "--output $OUT_DIR/llrpjs.jsonschema xslt/llrpjs-gen-jsonschema.xslt LTK/Definitions/Core/llrp-1x0-def.xml"
)

for ((i = 0; i < ${#CMD_ARG_LIST[@]}; i++)); do
    echo $CMD ${CMD_ARG_LIST[$i]}
    $CMD ${CMD_ARG_LIST[$i]}
done