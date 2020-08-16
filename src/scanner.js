const debug = require('debug')('llrpjs:scanner');
const MgBuf = require('./managed-buffer');

function Scanner() {
    if (!(this instanceof Scanner)) return new Scanner(...arguments);

    this.list = [];
}

Scanner.prototype.add = function (buf) {
    return this.list.push(buf);
};

Scanner.prototype.nextMsg = function() {
    let totalBuf = Buffer.concat(this.list);

    if (totalBuf.length < 10) {
        debug(`no sufficient data to process`);
        return;
    }

    let mBuf = new MgBuf(totalBuf);

    let typeNum = mBuf.get_u16();
    let version = (typeNum >>> 10) & 0x03;

    typeNum &= 0x3ff;

    if (version != 1) {
        // bad error, user needs to know
        throw new Error(`bad header - unsupported version ${version}`);
    }
    // good start!
    let length = mBuf.get_u32();
    if (length < 10) {
        // bad error, user needs to know
        throw new Error(`bad header - message length too small ${length}`);
    }

    if (length > totalBuf.length) {
        debug(`buffer length too small, wait for the next round`);
        return;
    }

    this.list = [];

    let resBuf = totalBuf.slice(length);
    if (resBuf.length)
        this.list.push(resBuf);
    return totalBuf.slice(0, length);
}

Scanner.prototype.hasNext = function () {
    return Buffer.concat(this.list).length >= 10;
}

Scanner.prototype.cleanup = function () {
    this.list = [];
}

module.exports = Scanner;