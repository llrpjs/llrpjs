#!/usr/bin/env node

import JSONbig from 'json-bigint';
import yargs from 'yargs';
import fs from 'fs'
import { LLRPMessage } from '../src/LLRPMessage';
import { TypeRegistry } from '../src/type-registry';
import { LLRPMessageI } from '../src/types';

const argv = yargs.command('$0 <input>', 'convert llrp json to bin', yargs => {
    yargs.positional('input', {
        describe: 'path to llrp JSON file',
        type: 'string'
    }).demandOption(['input']);
})
    .option('output', {
        alias: 'o',
        description: 'path to output binary file',
        type: 'string'
    })
    .option('iso8601fp', {
        alias: 'i',
        description: 'enables datetime microsecond full precision (default: true)',
        type: 'boolean',
        default: true
    })
    .help().alias('help', 'h')
    .argv;

TypeRegistry.getInstance().build();

(() => {
    let json = fs.readFileSync(argv.input as any, 'utf-8');
    let obj: LLRPMessageI<{}> | LLRPMessageI<{}>[] = JSONbig.parse(json);

    let result: Buffer[] = [];
    if (Array.isArray(obj)) {
        for (let i in obj) {
            let m = obj[i];
            let msg = new LLRPMessage(m);
            let buf = msg.encode().getBuffer();
            result.push(buf);
        }
    } else {
        let msg = new LLRPMessage(obj);
        let buf = msg.encode().getBuffer();
        result.push(buf);
    }

    if (argv.output) {
        fs.writeFileSync(argv.output, Buffer.concat(result));
    } else {
        process.stdout.write(Buffer.concat(result));
    }
})();
