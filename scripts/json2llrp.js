const debug = require('debug')('llrpjs:json2llrp');
const yargs = require('yargs');
const fs = require('fs');
const Encoder = require('../src/encoder');
const llrpdef = require('../generated/llrpjs.def.json');


const argv = yargs.command('$0 <input>', 'convert llrp json to bin', yargs=>{
        yargs.positional('input', {
            describe: 'path to llrp JSON file',
            type: 'string'
        }).demandOption(['input']);
    })
    .option('output', {
        alias: 'o',
        description: 'path to output binary file',
        type: 'string'
    }).help().alias('help', 'h')
    .argv;


(()=>{
    let json = fs.readFileSync(argv.input, 'utf-8');
    let encoder = new Encoder(llrpdef, {bufSize: 8096*1024});           // to pass all dx101 tests (dx101_c requries very large buffer size for each message)

    json = JSON.parse(json, bigIntParser);

    let result = [];
    if (Array.isArray(json)) {
        for (let i in json) {
            let msg = json[i];
            debug(JSON.stringify(msg, bigIntFormatter, 2));
            let buf = encoder.message(msg);
            debug(buf.toString('hex').match(/../g).join(' '));
            result.push(buf);
        }
    } else {
        debug(JSON.stringify(json, bigIntFormatter, 2));
        let buf = encoder.message(json);
        debug(buf.toString('hex').match(/../g).join(' '));        
        result.push(buf);
    }

    result = Buffer.concat(result);

    if (argv.output) {
        fs.writeFileSync(argv.output, result);
    } else {
        process.stdout.write(result);
    }
})();

function bigIntParser (key, value) {
    // Note: you lose BigInt resolution, but there's no good workaround AFAIK
    return typeof value === 'number'
            ? (value >= 2**32? BigInt(value): value)
            : value;
}

function bigIntFormatter (key, value) {
    return typeof value === 'bigint'
            ? value.toString()
            : value // return everything else unchanged
}