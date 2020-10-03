const debug = require('debug')('llrpjs:llrp2json');
const yargs = require('yargs');
const fs = require('fs');
const Scanner = require('../src/scanner');
const Decoder = require('../src/decoder');
const llrpdef = require('../generated/llrpjs.def.json');


const argv = yargs.command('$0 <input>', 'convert llrp bin to json', yargs=>{
        yargs.positional('input', {
            describe: 'path to llrp bin file',
            type: 'string'
        }).demandOption(['input']);
    })
    .option('output', {
        alias: 'o',
        description: 'path to output file',
        type: 'string'
    }).help().alias('help', 'h')
    .argv;


(()=>{
    let buf = fs.readFileSync(argv.input);
    let scanner = new Scanner();
    let decoder = new Decoder(llrpdef);

    scanner.add(buf);

    let result = [];
    while(scanner.hasNext()) {
        let msgBuf;
        if(msgBuf = scanner.nextMsg()) {
            debug(msgBuf.toString('hex').match(/../g).join(' '));
            decoder.addBuffer(msgBuf);
            let msg = decoder.message(msgBuf);
            debug(JSON.stringify(msg, bigIntParser, 2));
            result.push(msg);
            decoder.flushBuffer();
        }
    }
    
    let jsonData = JSON.stringify(result, bigIntParser, 2);

    if (argv.output) {
        fs.writeFileSync(argv.output, jsonData, {
            encoding: 'utf-8'
        });
    } else {
        console.log(jsonData);
    }
})();

function bigIntParser (key, value) {
    return typeof value === 'bigint'
            ? value.toString()
            : value // return everything else unchanged
}