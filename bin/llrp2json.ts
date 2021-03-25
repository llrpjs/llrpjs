#!/usr/bin/env node

import JSONbig from 'json-bigint';
import yargs from 'yargs';
import fs from 'fs'
import { LLRPScanner } from '../src/LLRPScanner';
import { LLRPMessage } from '../src/LLRPMessage';
import { TypeRegistry } from '../src/type-registry';
import { LLRPDef } from '../src/def';

const argv = yargs.command('$0 <input>', 'convert llrp bin to json', yargs => {
    yargs.positional('input', {
        describe: 'path to llrp bin file',
        type: 'string'
    }).demandOption(['input']);
})
    .option('output', {
        alias: 'o',
        description: 'path to output file',
        type: 'string'
    })
    .option('iso8601fp', {
        alias: 'i',
        description: 'enables datetime microsecond full precision (default: true)',
        type: 'boolean',
        default: true
    }).help().alias('help', 'h')
    .argv;

TypeRegistry.getInstance().enrollCoreDefinitions(LLRPDef).build();

(() => {
    let buf = fs.readFileSync(argv.input as any);   // https://github.com/yargs/yargs/issues/1649
    let scanner = new LLRPScanner();
    scanner.addBuffer(buf);

    let result = [];
    while (buf = scanner.getNext()) {
        let msg = new LLRPMessage(buf);
        result.push(msg.decode().toLLRPData());
    }

    let jsonData = JSONbig.stringify(result, null, 2);

    if (argv.output) {
        fs.writeFileSync(argv.output, jsonData, {
            encoding: 'utf-8'
        });
    } else {
        console.log(jsonData);
    }
})();
