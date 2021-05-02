import url from "url";
import {
    PeriodEnum,
    isValidPeriod,
    PriceStatusEnum
} from "./enums";


export function cloneObj (obj) {
    try {
        return JSON.parse(JSON.stringify(obj));
    } catch (error) {
        return null;
    }
}

export function priceHistoryWelBelowPercent (historic, currentPrice, percentage) {
    const priceHistoryWelBelow = historic.filter(history => {
        let avg = getPercent(currentPrice, history.value);
        avg = avg < 0 ? avg * -1 : avg;
        return avg <= percentage;
    });

    return priceHistoryWelBelow;
}

export function formatPeriod (period) {
    if (isValidPeriod(period)) {
        const days = PeriodEnum[period];
        if (days == PeriodEnum.ALL) return "Em todo período";
        if (days == PeriodEnum["1days"]) return "As últimas 24 horas";
        if (days == PeriodEnum["365days"]) return "O último ano";
        if (days == PeriodEnum["182days"]) return "Os últimos 6 meses";
        if (days == PeriodEnum["90days"]) return "Os últimos 3 meses";
        return `Os últimos ${days.toString()} dias`;
    }
}

export function validateIfPeriodHasMinimumQuantityForCalculation (historic, minimun = 3) {
    return historic.length >= minimun;
}

export function ignoreCurrentDate (historic) {
    return historic.filter(({
        datetime
    }) => !sameDay(new Date(datetime), new Date()));
}

export function addCurrentDateInHistory (currentPrice, historic) {

    const history = {
        value: currentPrice,
        datetime: new Date().toISOString()
    };

    historic.push(history);

    return historic;
}

export function getPriceHistoryForAPeriod (historic, periodEnum) {
    if (isValidPeriod(periodEnum)) {
        const timeRange = getTimeRange(periodEnum);

        if (timeRange == PeriodEnum.ALL) return historic.filter(({
            value
        }) => value > 0);

        const historicList = historic.filter(({
            datetime,
            value
        }) => new Date(datetime).getTime() >= timeRange && value > 0);
        return historicList;
    }
    return historic;
}


export function groupHistoryByDate (historic, locale = "pt-br") {
    return historic.reduce((groups, item) => {
        const date = new Date(item.datetime).toLocaleDateString(locale);
        if (!groups[date]) groups[date] = [];
        groups[date].push(item);
        return groups;
    }, {});
}
export function addLastDateInHistory (lastHistoricy, historic) {

    historic.push(lastHistoricy);

    return historic;
}

export function ignoreDate (historic, date) {
    return historic.filter(({
        datetime
    }) => !sameDay(new Date(datetime), new Date(date)));
}



export function createHistoryWithMinorPriceAccordingToTheGroupOfDays (groups) {
    return Object.entries(groups).map(([, historic]) => {
        const {
            minPrice
        } = getMinMax(historic, historic[0].value);
        return {
            value: minPrice,
            datetime: historic[0].datetime
        };
    });
}


function calculateTheAvarageOfTheDay (daysHistory) {
    const amountPeriod = getPricesOfPeriod(daysHistory)
        .reduce((amount, price) => {
            return amount += price;
        }, 0);

    const avgPeriod = amountPeriod / daysHistory.length;

    return avgPeriod;
}


export function getTimeRange (periodEnum) {
    const days = parseInt(PeriodEnum[periodEnum]);
    if (days == PeriodEnum.ALL) return 0;
    return new Date().getTime() - 60 * 60 * 24 * days * 1000;
}



function getPricesOfPeriod (historic) {
    return historic.map(({
        value
    }) => value);
}


export function getMinMax (historic, price = 0) {
    let minPrice = price,
        maxPrice = price,
        minDate = new Date(),
        maxDate = new Date();

    for (let key in historic) {
        if (historic[key].value > maxPrice) {
            maxPrice = historic[key].value;
            maxDate = historic[key].datetime;
        }

        if (historic[key].value < minPrice) {
            minPrice = historic[key].value;
            minDate = historic[key].datetime;
        }
    }

    return {
        minPrice,
        maxPrice,
        minDate,
        maxDate
    };
}

export function getPercent (priceActual, priceOld) {
    return (((priceActual / priceOld) - 1) * 100);
}

// function percentage (minorValue, majorValue) {
//     return (((majorValue - minorValue) / majorValue) * 100);
// }

// function getPercentNegative (avgPrice, price) {
//     return percentage(avgPrice, price) * -1;
// }

export function formatParcent (percentage) {
    if (percentage < 0)
        return (percentage * -1).toPrecision(2);
    return percentage.toPrecision(2);
}

export function getAverage (historic) {
    let total = 0;
    let amount = 0;
    for (let key in historic) {
        total += historic[key].value;
        amount++;
    }
    return total / amount;
}

export function sameDay (firstDate, secondDate) {
    return firstDate.getFullYear() === secondDate.getFullYear() &&
        firstDate.getMonth() === secondDate.getMonth() &&
        firstDate.getDate() === secondDate.getDate();
}

export function selectPriceStatus (percentage, isToGroup = true) {
    if (!isToGroup)
        return PriceStatusEnum.NOOPINION.toLowerCase();
    if (percentage <= -11)
        return PriceStatusEnum.LOWESTPRICE.toLowerCase();
    if (percentage <= -5)
        return PriceStatusEnum.BELOWAVERAGE.toLowerCase();
    if (percentage <= 0)
        return PriceStatusEnum.REASONABLEPRICE.toLowerCase();
    if (percentage <= 5)
        return PriceStatusEnum.EXPENSIVE.toLowerCase();
    if (percentage <= 15)
        return PriceStatusEnum.VERYEXPENSIVE.toLowerCase();
    return PriceStatusEnum.MOREEXPENSIVE.toLowerCase();

}

export function getPropByPath (obj, path, invoke_function, root) {
    if (!path) return obj;
    if (typeof obj === "undefined") return;
    var i = path.indexOf(".");
    var v;
    if (i == -1) {
        v = obj[path];
        if (invoke_function !== false && typeof v === "function")
            return v.call(root || obj);
        return v;
    } else {
        var prop = path.substr(0, i);
        path = path.substr(i + 1);
        v = obj[prop];
        if (invoke_function !== false && typeof v === "function")
            v = v.call(root);
        return getPropByPath(v, path, invoke_function, root || obj);
    }
}


export function getVariableExternals (variable, id) {
    var element = document.createElement("script");
    element.innerHTML = `(function () {
            var element = document.createElement("script");
            element.id = "__vpe-${id}-pix";

            function getVariableExternal() {
                if (typeof ${variable} != "undefined") {
                    element.innerHTML =  JSON.stringify(${variable});
                    if (!document.querySelector('#__vpe-${id}-pix'))
                        document.body.appendChild(element);
                } else {
                    setTimeout(getVariableExternal, 100);
                }
            }
            getVariableExternal();
        }());`;


    document.body.appendChild(element);
}

/*

Utils.getVariablesByFilters({
    currency: "runParams.data.webEnv.currency",
    country: "runParams.data.webEnv.country",
    product: "product"
});
function defineFunctionGetter() {
    var element = document.createElement("script");
    element.innerHTML = `
        (function () {
            var element = document.createElement("script");
            element.id = "__vpe-variables-pix";
            element.innerHTML = '{}'
            document.body.appendChild(element);
            if (!window.vpGetVariables) window.vpGetVariables = {};
            Object.defineProperties(window.vpGetVariables, {
              'vp': {
                  set(val) {
                      try {
                        element.innerHTML = JSON.stringify(Object.assign({}, JSON.parse(element.innerHTML), val))
                      } catch(e) {}
                  },
                  get() {
                      return JSON.parse(element.innerHTML)
                  }
              }
          })
        }());`;

    document.body.appendChild(element);
}
export function getVariableCb(variable, key) {
    var element = document.createElement("script");
    element.innerHTML = `
        (function () {
            function getVariableExternal${key}() {
                try {
                    if (typeof ${variable} != "undefined") {
                        window.vpGetVariables.vp = {
                            '${key}': ${variable}
                        };
                    } else {
                        setTimeout(getVariableExternal${key}, 100);
                    }
                } catch(e) {}  
            }
            getVariableExternal${key}();
        }());`;

    document.body.appendChild(element);
}
defineFunctionGetter();
export function getVariablesByFilters(filters) {
    Object.entries(filters).map(async ([key, filter]) => {
        getVariableCb(filter, key);
    });
}*/


export function validateUrl (value) {
    return /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(
        value
    );
}

export function generateQueryWithTracking ({ deeplink, source, raw, store }) {
    source = encode64(source);
    if (raw)
        raw = encodeURI(toRaw(raw));
    else raw = "home";

    store = toRaw(store);

    const separator = deeplink.includes("?") ? "&" : "?";

    return `${deeplink}${separator}utm_source=${source}${raw ? `&utm_medium=${raw}` : ""}&utm_campaign=${store}&tracking=true`;
}

export function toRaw (name) {
    var chars = ["aaaaceeiooouu", "àáâãçéêíóôõúü"].map((char) => {
        return char += char.toUpperCase();
    });

    if (typeof name === "string") {
        return name.toLowerCase().replace(/./g, (char) => {
            if (chars[1] == "-")
                return null;
            else if (chars[1].includes(char))
                return chars[0][chars[1].search(char)];
            else
                return char;
        }).split(" ").join("-").replace(/([-]+)/img, "-");
    } else {
        return name.split(" ").join("-").replace(/([-]+)/img, "-");
    }
}
var keyStr = "ABCDEFGHIJKLMNOP" +
    "QRSTUVWXYZabcdef" +
    "ghijklmnopqrstuv" +
    "wxyz0123456789" +
    "p";

export function encode64 (input) {
    input = escape(input);
    var output = "";
    var chr1, chr2, chr3 = "";
    var enc1, enc2, enc3, enc4 = "";
    var i = 0;

    do {
        chr1 = input.charCodeAt(i++);
        chr2 = input.charCodeAt(i++);
        chr3 = input.charCodeAt(i++);

        enc1 = chr1 >> 2;
        enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
        enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
        enc4 = chr3 & 63;

        if (isNaN(chr2)) {
            enc3 = enc4 = 64;
        } else if (isNaN(chr3)) {
            enc4 = 64;
        }

        output = output +
            keyStr.charAt(enc1) +
            keyStr.charAt(enc2) +
            keyStr.charAt(enc3) +
            keyStr.charAt(enc4);
        chr1 = chr2 = chr3 = "";
        enc1 = enc2 = enc3 = enc4 = "";
    } while (i < input.length);

    return output;
}

export function decode64 (input) {
    var output = "";
    var chr1, chr2, chr3 = "";
    var enc1, enc2, enc3, enc4 = "";
    var i = 0;

    // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
    var base64test = /[^A-Za-z0-9\\+\\/\\=]/g;
    if (base64test.exec(input)) {
        return "";
    }
    input = input.replace(/[^A-Za-z0-9\\+\\/\\=]/g, "");

    do {
        enc1 = keyStr.indexOf(input.charAt(i++));
        enc2 = keyStr.indexOf(input.charAt(i++));
        enc3 = keyStr.indexOf(input.charAt(i++));
        enc4 = keyStr.indexOf(input.charAt(i++));
        
        chr1 = (enc1 << 2) | (enc2 >> 4);
        chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
        chr3 = ((enc3 & 3) << 6) | enc4;

        output = output + String.fromCharCode(chr1);

        if (enc3 != 64 && enc3 != 0) {
            output = output + String.fromCharCode(chr2);
        }
        if (enc4 != 64 && enc4 != 0) {
            output = output + String.fromCharCode(chr3);
        }

        chr1 = chr2 = chr3 = "";
        enc1 = enc2 = enc3 = enc4 = "";

    } while (i < input.length);
    return unescape(output);
}


export const emailIsValid = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const passwordIsValid = (password) => {
    return password.length >= 8;
};

export const isEquals = (valueA, valueB) => {
    if (valueA === valueB) return true;
};


export function checkIsNotShow (configs = [], local = "", global = []) {
    if (!Array.isArray(configs)) configs = [];
    if (global.length)
        configs = configs.concat(global);
    const actualUrl = window.location.href;

    const notIsShow = configs.filter(c => c[local]).some(c => RegExp(c.url).test(actualUrl));

    return notIsShow;
}

export function getValueByRegex (string, regexString) {
    var regex = new RegExp(regexString, "i");
    if (regex.test(string)) {
        var matchs = string.match(regex);
        return matchs[1];
    } else {
        return null;
    }
}

export function generateLinkClub ({ link, isClub, haveWWW = false, subdomain = "clube", subdomainRemove = [] }) {

    link = link.replace("https//", "https://");
    let parseLink = url.parse(link);

    let host = parseLink.host;

    let isMobile = isLinkMobile(link);
    if (isMobile == false) {
        host = removeSubdomainToLink(parseLink.host, subdomainRemove);
    }

    host = host.replace("www.", "");

    if (isClub && isMobile == false) {
        host = addSubdomainToHost(host, subdomain);
    }
    host = formatWWWToHost(host, haveWWW);
    let query = parseLink.query ? `?${parseLink.query}` : "";
    let pathname = parseLink.pathname || "";
    return `${parseLink.protocol}//${host}${pathname}${query}`;
}

export function checkLinkIsClubBySubdomain (link, subdomain = "clube") {
    subdomain = subdomain.replace(".", "");
    return link.indexOf(`${subdomain}.`) > 0;
}

function isLinkMobile (link) {
    return /https:\/\/(www.)?m\./i.test(link);
}


function formatWWWToHost (host, add = true) {
    host = host.replace("www.", "");
    return add ? `www.${host}` : host;
}

function removeSubdomainToLink (link, subdomains) {
    for (let sub of subdomains) {
        link = link.replace(sub, "");
    }
    return link;
}

function addSubdomainToHost (host = "", subdomain = "") {
    subdomain = subdomain.replace(".", "");
    return host.indexOf(`${subdomain}.`) < 0 ? `${subdomain}.${host}` : host;
}

export function tokenJWTKey() {
    return "tokenJWT" + process.env.WHITELABEL_TOKEN; 
}