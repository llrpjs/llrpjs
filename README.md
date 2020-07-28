## Low Level Reader Protocol (LLRP)
The LLRP is a binary protocol published by EPCglobal Inc. to define the standard comm interface between RFID readers and clients.

For more information, check the [standard's definition](https://www.gs1.org/sites/default/files/docs/epc/llrp_1_1-standard-20101013.pdf).

Before the release of Node.js, the [LLRP.org](http://llrp.org) group created the LLRP Toolkit. A facinating project that utilized meta-programming and code generation techniques to produce library code in C/C++, Java, Perl, and .NET.

## Why LLRP and Node.js?
One of the most popular use-cases for Node.js is chat applications where "events" efficiently drive the routines. The intrinsic non-blocking programming paradigm of JavaScript makes it very suitable to handle message-oriented protocols where the application is designed around I/O events, and since LLRP is a message-oriented protocol makes it a very suitable use-case for Node.js more than any other language in the LTK project in my opinion.

