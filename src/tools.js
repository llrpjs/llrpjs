function isEmpty(obj) {
    return Object.keys(obj).length === 0 && obj.constructor === Object
}

function groupBy (array, key) {
    return array.reduce((obj, item) => {
        return {
            ...obj,
            [item[key]]: item,
        };
    }, {});
};

/*
 turns this:
    [
        { AISpec: { a: 1, b: 2 } },
        { AISpec: { c: 3, d: 4 } },
        { RFSurvey: { e: 1 } }
    ]
 into this:
    {
        AISpec: [
            { a: 1, b: 2 },
            { c: 3, d: 4 }
        ],
        RFSurvey: { e: 1 }
    }
*/
function groupByFirstKey (array) {
    // collect first-keys
    let fKeys = [...new Set(array.map(x=>Object.keys(x)[0]))];
    // some map/reduce magic
    return fKeys.map(key=>{
                let result = array.reduce((rv, x)=>{
                    x[key]?(rv[key] = rv[key] || []).push(x[key]):rv;
                    return rv;
                }, {});
                // if one-item array per key, return its item
                return result[key].length > 1?result:{[key]:result[key][0]};
            }).reduce((obj, item)=>{
                return {
                    ...obj,
                    ...item
                }
            }, {});
}

module.exports = {isEmpty, groupBy, groupByFirstKey};