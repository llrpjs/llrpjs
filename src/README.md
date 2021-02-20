# Use cases:

## Example 1:   (applicable)
```TS
let msg = new Message({id: 123, type: "ADD_ROSPEC"});
msg.addROSpec({
    ROSpecID: 1,
    Priority: 1,
    ...
});
```

## Example 2:   (applicable)
```TS
let msg = new Message({id: 123, type: "ADD_ROSPEC", data: {
    ROSpec: {
        ROSpecID: 1,
        Priority: 1,
        ...
    }
}})
```

## Example 3:   (N/A)
```TS
let msg = new LLRPMessage({id: 123, type: "ADD_ROSPEC"});
let roSpec = new LLR_C_ROSpec({
    ROSpecID: 1,
    Priority: 1,
    ...
});
msg.addSubParameter(roSpec);
```

## Example 4:   (applicable)
```TS
let msg = new CADD_ROSPEC({
    ROSpec: {
        ROSpecID: 1,
        Priority: 1,
        ...
    }
});
```

## Example 5:   (N/A)

```TS
let msg = new LLRP_C_ADD_ROSPEC();
msg.getROSpec()
    .setROSpecID(1)
    .setPriority(1);
```

## Decode

```TS
let buffer = Buffer.from("LLRP Binary Message!");
let msg = new LLRPMessage(buffer);
let data = msg.toLLRPData();
```

## Encode

```TS
let msg = new LLRPMessage();
buffer = msg.setMessageType("ADD_ROSPEC")
    .setData({
        ROSpec: {
            ROSpecID: 1,
            ...
        }
    })
    .encode()
    .getBuffer();
```