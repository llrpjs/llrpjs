<img alt="llrpjs" src="https://avatars.githubusercontent.com/u/73364026?s=400&u=69aef360e5aca0cc50f7a2fb8a948d9fc411f6fd&v=4" height="300" width="300"/>

>Low Level Reader Protocol (LLRP) library for [node](https://nodejs.org/en/).

<hr/>
<div>
  <img alt="Version" src="https://img.shields.io/badge/version-1.0.0-blue.svg?cacheSeconds=2592000" />
  <a href="https://opensource.org/licenses/MIT" target="_blank">
    <img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-yellow.svg" />
  </a>
</div>

## Synopsis & Motivation
LLRP (Low Level Reader Protocol) is a binary protocol published by EPCglobal Inc. to define the standard communication interface between RFID readers (servers) and clients.
For more infomration, check out the [LLRP standard definition](https://www.gs1.org/sites/default/files/docs/epc/llrp_1_1-standard-20101013.pdf).

The [LLRP ToolKit (LTK)](http://llrp.org/index.html) project was created back in 2008 by a group of companies and universities to help the development of LLRP-based applications. The toolkit provided support for many languages including C, C++, Java, Perl, etc. A year later, however, Node.js came around and opened the door to countless possibilities and proved to be one of the easiest and fastest ways to IoT development.

LLRP makes the perfect use case for JavaScript, given that it's a message-oriented protocol with many messages that are best handled asynchronously. See reader reports handling in the example below.

## Example
llrpjs helps create programs for both servers (readers) and clients. The following example shows how to connect to a reader and collect EPC data of RFID tags.
```JS
const { LLRPClient, LLRPCore } = require("llrpjs");
const ADD_ROSPEC = require("./ADD_ROSPEC.json");

// create a client
const reader = new LLRPClient({ host: "192.168.7.2" });

// print RFID tags
reader.on("RO_ACCESS_REPORT", msg => {
    let tagReportDataList = msg.getTagReportData();
    if (!Array.isArray(tagReportDataList)) {
        tagReportDataList = [tagReportDataList]
    }
    for (let tagReportData of tagReportDataList) {
        let epc = tagReportData.getEPCParameter();
        console.log(`EPC: ${epc.getEPC()}`);
    }
});
reader.on("READER_EVENT_NOTIFICATION", msg => {
    // handle reader event notification messages here
});

reader.on("error", err => {
    // handle errors
});
reader.on("connect", () => {
    console.log("connected");
})
reader.on("disconnect", () => {
    console.log("disconnected");
});

/** Main */
(async () => {
    try {
        // connect to reader
        await reader.connect();
        // wait for connection confirmation
        await checkConnectionStatus();

        // delete all existing ROSpecs (if any)
        await reader.transact(new LLRPCore.DELETE_ROSPEC({
            data: { ROSpecID: 0 /** all */ }
        }));

        // factory reset
        await reader.transact(new LLRPCore.SET_READER_CONFIG({
            data: { ResetToFactoryDefault: true }
        }));

        // add ROSpec defined in "./ADD_ROSPEC.json"
        await reader.transact(new LLRPCore.ADD_ROSPEC(ADD_ROSPEC));

        // enable ROSpec
        const { ROSpecID } = ADD_ROSPEC.data.ROSpec;
        await reader.transact(new LLRPCore.ENABLE_ROSPEC({
            data: { ROSpecID }
        }));

        // start ROSpec
        await reader.transact(new LLRPCore.START_ROSPEC({
            data: { ROSpecID }
        }));

        console.log("Press ctrl+c to exit");
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
})();

/**
 * wait for a READER_EVENT_NOTIFICATION message
 */
const checkConnectionStatus = async () => {
    let msg = await reader.recv(7000);
    if (!(msg instanceof LLRPCore.READER_EVENT_NOTIFICATION)) {
        throw new Error(`connection status check failed - unexpected message ${msg.getName()}`);
    }
    const status = msg.getReaderEventNotificationData().getConnectionAttemptEvent()?.getStatus();
    if (status != "Success") {
        throw new Error(`connection status check failed ${status}`);
    }
    return;
}

process.on("SIGINT", async () => {
    // request termination
    const rsp = await reader.transact(new LLRPCore.CLOSE_CONNECTION);
    if (rsp instanceof LLRPCore.CLOSE_CONNECTION_RESPONSE) {
        const status = rsp.getLLRPStatus();
        console.log(`${status.getErrorDescription()} - ${status.getStatusCode()}`)
    }
    // make sure it's disconnected
    if (reader.socketWritable) await reader.disconnect();
});

```

## Static typing
llrpjs is written in TypeScript and provides static typing support:

<img src="https://drive.google.com/uc?export=view&id=1ouIo2omAC8-jpG2xwNAFr2D0y3OYk1rj">

## JSON and JSON Schema support

llrpjs commits to the same goals set by the LTK project. However, llrpjs attempts at accomplishing some of these goals differently:
### JSON over XML
The LTK project used XML to represent human-readable LLRP documents. However, given that JSON has out-of-the-box support in Node.js as well as many APIs and document-oriented databases (e.g. MongoDB), it makes sense to use it over XML in llrpjs. llrpjs uses a one-to-one mapping of the same XML format used in LTK:

>llrpjs JSON ([full example](https://github.com/llrpjs/llrpjs/blob/master/test/examples/ADD_ROSPEC.json))
```JSON
{
  "$schema": "https://llrpjs.github.io/schema/core/encoding/json/1.0/llrp-1x0.schema.json",
  "id": 103, "type": "ADD_ROSPEC",
  "data": {
    "ROSpec": {
      "ROSpecID": 1,
      "Priority": 0,
      "CurrentState": "Disabled",
      // ...
    }
  }
}
```

>LTK XML ([full example](https://github.com/llrpjs/llrpjs/blob/master/test/examples/ADD_ROSPEC.xml))
```XML
<ADD_ROSPEC MessageID='103'
  xmlns:llrp='http://www.llrp.org/ltk/schema/core/encoding/xml/1.0'
  xmlns='http://www.llrp.org/ltk/schema/core/encoding/xml/1.0'>
  <ROSpec>
    <ROSpecID>1</ROSpecID>
    <Priority>0</Priority>
    <CurrentState>Disabled</CurrentState>
    <!-- ... -->
  </ROSpec>
</ADD_ROSPEC>
```

### JSON Schema over XSD
The LLRP JSON schema is generated from the source LTK definition and supports all types and formats. VSCode supports JSON schema out of the box:

<img src="https://drive.google.com/uc?export=view&id=1Q2o0b4JxW8IwGqWtHpFKUJ862gF3tclZ">

## CLI Tools
On installation, the package makes two CLI programs available: `llrp2json` and `json2llrp`. These commands can be used to convert binary llrp messages to JSON and the other way around. Use `--help` flag to get information on how to use.

## Development
llrpjs uses the same definition `llrp-1x0-def.xml` set by the LTK project to generate runtime type definitions and schema. This library is written in TypeScript and allows dynamic static typing using a given LLRP definition. That said, llrpjs in itself is definition-agnostic, meaning that the code itself only conforms to the meta schema that was set by the LTK project (llrpdef.xsd) and any definition that complies with the meta schema can be used to generate types for llrpjs.

Check out [llrpjs-tools](https://github.com/llrpjs/llrpjs-tools) for more information.

## Author

**Haytham Halimeh**

* Github: [@haytham43](https://github.com/haytham43)
* LinkedIn: [@haytham-halimeh](https://linkedin.com/in/haytham-halimeh)

## Contributing

Contributions, issues and feature requests are welcome! <br/>
Feel free to check [issues page](https://github.com/llrpjs/llrpjs/issues).

### TODO
* Tool to convert from llrpjs JSON to LTK XML and vice versa
* Vendor definitions support
* Documentation

## Disclaimer
This project is independent.
