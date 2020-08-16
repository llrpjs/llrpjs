
module.exports = {
    u1v: (value, format)=>{
        if (format == "Hex")
            return value.reduce((acc, x)=>acc.length == 8?`${acc},${x}`:`${acc}${x}`, '')
                        .split(',').map(x=>parseInt(x.padEnd(4, 0)).toString(16)).join('').toUpperCase();
        else
            return value;
    },
    utf8v: (value, format)=>{
        return value.toString('utf8');
    },
    u8v: (value, format)=>{
        if (format == "Hex")
            return value.map(x=>x.toString(16).padStart(2, 0)).join('').toUpperCase();
        else
            return value;
    },
    u16v: (value, format)=>{
        if (format == "Hex")
            return value.map(x=>x.toString(16).padStart(4, 0)).join('').toUpperCase();
        else
            return value;
    },
    u64: (value, format)=>{
        if (format == "Datetime")
            // we're gonna sacrifice microsecond precision :-\
            return new Date(Number(value)/1000);
        else
            return value;
    },
    u96: (value, format)=>{return module.exports.u8v(value, format)},
    bytesToEnd: (value, format)=>{return module.exports.u8v(value, format)},
    no_formatter: (value, format)=>value
};
