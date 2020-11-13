/**
 * checks whether the object is empty or not
 * @param {object} obj  object to test
 * @returns             true if empty and false if not
 */
function isEmpty(obj) {
    return Object.keys(obj).length === 0 && obj.constructor === Object
}

/**
 * converts an array of objects with a common key to an object that contains
 *  keys derived from the values of the common key in each object
 * @example
 * groupBy([
 *      {name : "a", content: {}},
 *      {name : "b", content: {}}
 * ], "name")
 *
 * returns {
 *      a: {name : "a", content: {}},
 *      b: {name : "b", content: {}}
 * }
 * 
 * @param {array} array     array of objects with shared keys
 * @param {string} key      a shared key between objects in array
 * @returns                 an object with keys obtained from the value of each obj[key]
 */
function groupBy (array, key) {
    return array.reduce((obj, item) => {
        let cur = obj[item[key]];
        return {
            ...obj,
            [item[key]]: cur? (Array.isArray(cur)? cur.concat(item): [cur, item]) : item,
        };
    }, {});
};

/**
 * conflates objects within an array into one object
 * 
 * @example
 *  turns this:
 *  [
 *      { AISpec: { a: 1, b: 2 } },
 *      { AISpec: { c: 3, d: 4 } },
 *      { RFSurvey: { e: 1 } }
 *  ]
 *  into this:
 *  {
 *      AISpec: [
 *          { a: 1, b: 2 },
 *          { c: 3, d: 4 }
 *      ],
 *      RFSurvey: { e: 1 }
 *  }
 * 
 * @param {array} array     array of objects with equal first keys
 * @returns {object}        object with values of the same key occurences grouped in arrays
 * 
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

/**
 * checks whether the parameter in test is merely a wrapper to a field or not
 * 
 * @param {object} def      definition of parameter
 * @param {object} defRef   definition reference of parameter
 * @returns {boolean}       return true or false
 */

 function isParamWrapper (def) {
    if (def.body.length == 1) {
        if (def.name == def.body[0].name) return true;
    }
    return false;
}

/**
 * returns object containing only the passed key leaving all other keys filtered out
 * 
 * @param {object} obj main object
 * @param {string} key key to be filtered
 * @returns {object}    object with filtered key only
 */

function filter(obj, key) {
    return Object.keys(obj)
        .filter(k => [key].includes(k))
        .reduce((o, k)=>{o[k] = obj[k]; return o;}, {});
}

module.exports = {isEmpty, groupBy, groupByFirstKey, isParamWrapper, filter};