
const ISO8601_REGEX_MICRO = /(?<=\.)\d{6}(?=Z)/;

function parseIso8601Microseconds(timestamp) {
    // seconds
    let time = Math.floor(Date.parse(timestamp) / 1000);

    const microseconds = parseInt(timestamp.match(ISO8601_REGEX_MICRO), 10);
    if (isNaN(microseconds))
        throw new Error(`cannot parse microseconds ${timestamp}`);

    return BigInt(time * 1000000 + microseconds);
}

module.exports = {
    u1v: (value, format)=>{return module.exports.u8v(value, format);},
    utf8v: (value, format)=>{
        return value.toString('utf8');
    },
    u8v: (value, format)=>{
        if (format == "Hex") {
            return value.length?
                value.split('').reduce((acc, x, i)=>(i%2==0) && (i != 0)?`${acc},${x}`:`${acc}${x}`, '').split(',')
                    .map(x=>parseInt(x.padEnd(2, 0), 16)) : [];
        } else
            return value;
    },
    u16v: (value, format)=>{
        if (format == "Hex") {
            return value.length?
                value.split('').reduce((acc, x, i)=>(i%4==0) && (i != 0)?`${acc},${x}`:`${acc}${x}`, '').split(',')
                    .map(x=>parseInt(x.padEnd(4, 0), 16)) : [];
        } else
            return value;
    },
    u64: (value, format, fullPrecision)=>{
        if (format == "Datetime")
            // return microseconds
            return fullPrecision? parseIso8601Microseconds(value): BigInt(new Date(value)) * 1000n;
        else
            return value;
    },
    u96: (value, format)=>{return module.exports.u8v(value, format)},
    bytesToEnd: (value, format)=>{return module.exports.u8v(value, format)},
    nop: (value, format)=>value
};
