
const ISO8601_REGEX_MILLI = /(?<=\.)\d{3}(?=Z)/;

function formatIso8601Microseconds(microseconds) {
    const date = (new Date(Number(microseconds / 1000n))).toISOString();
    const residue = (microseconds % 1000000n).toString().padStart(6, 0);
    return date.replace(ISO8601_REGEX_MILLI, residue);
}

module.exports = {
    u1v: (value, format)=>{return module.exports.u8v(value, format);},
    utf8v: (value, format)=>{
        return value.toString('utf8');
    },
    u8v: (value, format)=>{
        if (format == "Hex") {
            return value.length? value.map(x=>x.toString(16).padStart(2, 0)).join('').toUpperCase() : "";
        } else
            return value;
    },
    u16v: (value, format)=>{
        if (format == "Hex") {
            return value.length? value.map(x=>x.toString(16).padStart(4, 0)).join('').toUpperCase() : "";
        } else
            return value;
    },
    u64: (value, format, fullPrecision=false)=>{
        if (format == "Datetime")
            return fullPrecision? formatIso8601Microseconds(value): new Date(Number(value)/1000);
        else
            return value;
    },
    u96: (value, format)=>{return module.exports.u8v(value, format)},
    bytesToEnd: (value, format)=>{return module.exports.u8v(value, format)},
    nop: (value, format)=>value
};
