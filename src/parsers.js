
module.exports = {
    u1v: (value, format)=>{
        if (format == "Hex")
            return value.length?
                value.split('').map(x=>parseInt(x, 16).toString(2).padStart(4, 0)).join('').split('').map(x=>parseInt(x,2))
                : [];
        else
            return value;
    },
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
    u64: (value, format)=>{
        if (format == "Datetime")
            // return microseconds
            return BigInt(new Date(value)) * 1000n;
        else
            return value;
    },
    u96: (value, format)=>{return module.exports.u8v(value, format)},
    bytesToEnd: (value, format)=>{return module.exports.u8v(value, format)},
    no_parser: (value, format)=>value
};
