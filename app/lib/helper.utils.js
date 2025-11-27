// import Constants from '../config/constants';

export const objectToArray = (obj) => {
    const arr = [];
    Object.keys(obj).forEach((key) => {
        arr.push(key);
        arr.push(obj[key]);
    });
    return arr;
};

export const objectToStringObj = (obj) => {
    const newObj = {};
    Object.keys(obj).map((key) => {
        newObj[key] = obj[key] + '';
    });
    return newObj;
};

export const getSumValue = (...numbers) => {
    return numbers
        ? numbers.reduce((sum, value) => {
            if (value) {
                return sum + parseFloat(value);
            }
            return sum;
        }, 0)
        : 0;
};

export const getLowestValue = (...numbers) => {
    let lowest = null;
    for (const num of numbers) {
        if (lowest === null) {
            lowest = num;
        } else {
            if (lowest > num) {
                lowest = num;
            }
        }
    }

    return lowest;
};

export const decimalFix = (number) => {
    return number.toFixed(2);
};

export const getPagination = (items, page = 1, perPage = 10) => items.slice(perPage * (page - 1), perPage * page);

/**
 * Create an object composed of the picked object properties
 * @param {Object} object
 * @param {string[]} keys
 * @returns {Object}
 */
export const pick = (object, keys) => {
    return keys.reduce((obj, key) => {
        if (object && Object.prototype.hasOwnProperty.call(object, key)) {
            obj[key] = object[key];
        }
        return obj;
    }, {});
};

// export const isProduction = () => {
//     return Constants.env === 'production';
// };

export const isLocalTest = () => {
    return process.env.TEST_ENV === 'LOCAL';
};


export const generateRandomNumber = (length) => {
    if (length <= 0) return 0;

    const min = Math.pow(10, length - 1); // Smallest number with the given length
    const max = Math.pow(10, length) - 1; // Largest number with the given length

    // Return a random number within this range
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const generateVerificationCode = (length = 6) => {
    if (isProduction()) {
        let text = '';
        const possible = '0123456789';

        for (let i = 0; i < length; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }
    return 777777;
}

export const pickKeys = (obj, keys) => {
    const result = {};

    keys.forEach(key => {
        const keyParts = key.split('.');

        let currentObj = obj;
        let currentResult = result;

        keyParts.forEach((part, index) => {
            if (currentObj && part in currentObj) {
                if (index === keyParts.length - 1) {
                    currentResult[part] = currentObj[part];
                } else {
                    currentResult[part] = currentResult[part] || {};
                    currentResult = currentResult[part];
                    currentObj = currentObj[part];
                }
            }
        });
    });

    return result;
}
