import axios from "axios";
import Console from "../../consolevp";
import { tokenJWTKey } from "./utils";
var storage = chrome.storage.local || storage.StorageArea;
var allInStore = {};


storage.get(null, (items) => {
    if(typeof items == "string") items = JSON.parse(items);
    if(items)
        allInStore = items;
});
storage.get(tokenJWTKey(), (item) => {
    allInStore[tokenJWTKey()] = item[tokenJWTKey()];
});

export function clearCacheExpired () {
    let keysStorage = Object.keys(allInStore).filter(key => key.includes("__vp__cache"));

    keysStorage.map(key => {
        const {
            expiredAt
        } = JSON.parse(allInStore[key]);
        const now = parseInt(new Date().getTime() / 1000);
        if (!(expiredAt && now < expiredAt)) {
            storage.remove(key);
        }
    });

    let keysLocalStorage = Object.keys(localStorage).filter(key => key.includes("__vp__cache"));
    keysLocalStorage.map(key => {
        const {
            expiredAt
        } = JSON.parse(localStorage[key]);
        const now = parseInt(new Date().getTime() / 1000);
        if (!(expiredAt && now < expiredAt)) {
            localStorage.removeItem(key);
        }
    });
}
export function clearCacheTrackinfgExpired () {
    let keysStorage = Object.keys(allInStore).filter(key => key.includes("__vp__cache_tracking"));

    keysStorage.map(key => {
        storage.remove(key);
    });

    let keysLocalStorage = Object.keys(localStorage).filter(key => key.includes("__vp__cache_tracking"));
    keysLocalStorage.map(key => {
        localStorage.removeItem(key);
    });
}

export async function sharedCacheOrFecthPaginationByLocalStorage (key, url, limit = 10, offset = 0, search = "", timeout = 60 * 30, debug = false) {

    try {
        const now = parseInt(new Date().getTime() / 1000);
        let {
            expiredAt,
            items,
            query
        } = sharedGetItemsLocalStorage(key);
        if (expiredAt && now < expiredAt && search == "" && url == query) {
            if (limit == 0 && items.length) {

                return items;
            }
            if (items && items.length && items.length >= (offset + limit)) {
                return items.slice(offset, offset + limit);

            }
        }
        if (search != "" || limit == 0) {
            items = [];
        }

        const data = await sharedGetAPI(url, limit, offset, search);

        if (data) {
            if (search == "") {
                items = Array.isArray(items) ? items.concat(data) : data;
                sharedSaveItemsLocalStorage(key, [...new Set(items)], now + parseInt(timeout), url);
            }
            return data;
        }

        throw new Error();



    } catch (error) {
        Console(`sharedCacheOrFecthPaginationByLocalStorage ${error.stack.toString()}`, true);
        return [];
    }
}

export async function sharedCacheOrFecthPaginationByStorage (key, url, limit = 10, offset = 0, search = "", timeout = 300, debug = false) {
    try {
        const now = parseInt(new Date().getTime() / 1000);

        let {
            expiredAt,
            items,
            query
        } = await sharedGetItemsStorage(key);

        if (expiredAt && now < expiredAt && search == "" && url == query) {
            if (limit == 0 && items.length) {
                return items;
            }
            if (items && items.length && items.length >= (offset + limit)) {
                return items.slice(offset, offset + limit);
            }
        }
        if (search != "" || limit == 0) {
            items = [];
        }

        const data = await sharedGetAPI(url, limit, offset, search);

        if (data) {
            if (search == "") {
                items = Array.isArray(items) ? items.concat(data) : data;
                sharedSaveItemsStorage(key, [...new Set(items)], now + parseInt(timeout), url);
            }
            return data;
        }

        return [];


    } catch (error) {
        Console(`sharedCacheOrFecthPaginationByStorage ${error.stack.toString()}`, true);
        return [];
    }
}


export async function sharedCacheOrFecthByLocalStorage ({ key, url, property = "", timeout = 300, debug = false, search = "", limit = 30, offset = 0 }) {
    try {
        const now = parseInt(new Date().getTime() / 1000);

        let {
            expiredAt,
            items
        } = sharedGetItemsLocalStorage(key);

        if (expiredAt && now < expiredAt && Array.isArray(items)) {
            return items;
        } else {
            items = [];

            let data = await sharedGetAPI(url, limit, offset, search);
            if (property && !Array.isArray(data) && data.hasOwnProperty(property) && data[property] && Array.isArray(data[property])) data = data[property];
            if (data) {
                sharedSaveItemsLocalStorage(key, data, now + parseInt(timeout));
                return data;
            }

            return [];
        }

    } catch (error) {
        Console(`sharedCacheOrFecthByLocalStorage ${error.stack.toString()}`, true);
        return [];
    }
}

export async function sharedCacheOrFecthByStorage ({ key, url, property = "", timeout = 300, debug = false, limit = 0, offset = 0, search = "", returnWithouItems = false }) {
    try {
        const now = parseInt(new Date().getTime() / 1000);
        let {
            expiredAt,
            items
        } = await sharedGetItemsStorage(key);
        if (expiredAt && now < expiredAt && Array.isArray(items)) {
            if ((limit == 0) && items.length) {
                return items;
            }
            if (returnWithouItems) {
                return items;
            }
            if (items && items.length) {
                return items.slice(offset, offset + limit);
            }
        }
        if (search != "" || limit == 0) {
            items = [];
        }
        let data = await sharedGetAPI(url, limit, offset, search);
        if (property && !Array.isArray(data) && data.hasOwnProperty(property) && data[property] && Array.isArray(data[property])) data = data[property];
        if (data) {
            if (search == "") {
                items = Array.isArray(items) ? items.concat(data) : data;
                sharedSaveItemsStorage(key, [...new Set(items)], now + parseInt(timeout), url);
            }
            return data;
        }

        return [];

    } catch (error) {
        Console(`sharedCacheOrFecthByStorage ${error.stack.toString()}`, true);
        return [];
    }
}

export async function sharedCacheOrFecthItemByStorage (key, url, timeout = 300, debug = false, force = false) {
    try {
        const now = parseInt(new Date().getTime() / 1000);
        let {
            expiredAt,
            item
        } = await sharedGetItemStorage(key);
        if (expiredAt && now < expiredAt && typeof item == "object" && force === false && Object.keys(item).length) {
            return item;
        } else {

            let data = await sharedGetAPI(url, 30, 0, "", force);
            if (data) {
                await sharedSaveItemStorage(key, data, now + parseInt(timeout));
                return data;
            }

            return [];
        }

    } catch (error) {
        Console(`sharedCacheOrFecthItemByStorage ${error.stack.toString()}`, true);
        return [];
    }
}
export async function sharedGetItemsStorage (key) {

    return new Promise((resolve) => {
        try {

            storage.get(key, (item) => {
                if (item[key]) {
                    const {
                        expiredAt,
                        items,
                        query
                    } = JSON.parse(item[key]);

                    if (Array.isArray(items)) {
                        resolve({
                            expiredAt: expiredAt || 0,
                            items: [...new Set(items)] || [],
                            query
                        });
                    } else {
                        resolve({
                            expiredAt: expiredAt || 0,
                            items: items || {},
                            query
                        });
                    }
                } else {
                    resolve({
                        expiredAt: 0,
                        items: [],
                        query: null
                    });
                }
            });
        } catch (error) {
            Console(`sharedGetItemsStorage ${error.stack.toString()}`, true);
            resolve({
                expiredAt: 0,
                items: [],
                query: null
            });
        }
    });
}


export function sharedGetItemsLocalStorage (key) {
    try {
        if (localStorage.hasOwnProperty(key)) {
            const {
                expiredAt,
                items,
                query
            } = JSON.parse(localStorage.getItem(key));
            if (Array.isArray(items))
                return {
                    expiredAt: expiredAt || 0,
                    items: [...new Set(items)] || [],
                    query
                };
            return {
                expiredAt: expiredAt || 0,
                items: items || {},
                query
            };
        }
        throw new Error();

    } catch (error) {
        Console(`sharedGetItemsLocalStorage ${error.stack.toString()}`, true);
        return {
            expiredAt: 0,
            items: [],
            query: null
        };
    }
}

export function sharedGetItemStorage (key) {
    try {
        if (allInStore && allInStore.hasOwnProperty(key)) {
            const {
                expiredAt,
                item,
                query
            } = JSON.parse(allInStore[key]);
            if (typeof item == "object")
                return {
                    expiredAt: expiredAt || 0,
                    item,
                    query
                };
            return {
                expiredAt: expiredAt || 0,
                item: {},
                query
            };
        }
        throw new Error();
    } catch (error) {
        Console(`sharedGetItemStorage ${error.stack.toString()}`, true);
        return {
            expiredAt: 0,
            item: {},
            query: null
        };
    }
}
export function sharedGetItemStorageByStorage (key) {
    return new Promise((resolve) => {
        storage.get(key, (values) => {
            let data = { expiredAt: 0 };
            try {
                if (values[key]) {
                    data = JSON.parse(values[key]);
                }

            } catch (error) {
                ///
            }
            resolve(data);
        });
    });
}


export function getStorageByKey(key) {
    if (allInStore && allInStore.hasOwnProperty(key)) {
        return allInStore[key];
    } else {
        return null;
    }
}

export function sharedGetItemLocalStorage(key) {

    try {

        if (localStorage.hasOwnProperty(key)) {
            const {
                expiredAt,
                item,
                query
            } = JSON.parse(localStorage.getItem(key));
            if (typeof item == "object")
                return {
                    expiredAt: expiredAt || 0,
                    item,
                    query
                };
            return {
                expiredAt: expiredAt || 0,
                item: {},
                query
            };
        }
        throw new Error();
    } catch (error) {
        Console(`sharedGetItemLocalStorage ${error.stack.toString()}`, true);
        return {
            expiredAt: 0,
            item: {},
            query: null
        };
    }
}


export function sharedSaveItemsLocalStorage (key, items, expiredAt, query) {
    try {
        const data = {
            items: [...new Set(items)],
            expiredAt,
            query
        };

        let toStorage = {};
        toStorage[key] = JSON.stringify(data);

        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        Console(`sharedSaveItemsLocalStorage ${error.stack.toString()}`, true);
    }

}

export function sharedSaveItemsStorage (key, items, expiredAt, query) {
    try {
        const data = {
            items: [...new Set(items)],
            expiredAt,
            query
        };

        let toStorage = {};
        toStorage[key] = JSON.stringify(data);

        storage.set(toStorage);
        allInStore[key] = JSON.stringify(data);
    } catch (error) {
        Console(`sharedSaveItemsStorage ${error.stack.toString()}`, true);
    }
}

export function sharedSaveItemLocalStorage (key, item, expiredAt, query) {
    try {
        const data = {
            item,
            expiredAt,
            query
        };
        localStorage.setItem(key, JSON.stringify(data));

    } catch (error) {
        Console(`sharedSaveItemLocalStorage ${error.stack.toString()}`, true);
    }
}

export function sharedSaveItemStorage (key, item, expiredAt, query) {
    try {
        const data = {
            item,
            expiredAt,
            query
        };
        let toStorage = {};
        toStorage[key] = JSON.stringify(data);
        storage.set(toStorage);
        allInStore[key] = JSON.stringify(data);
    } catch (error) {
        Console(`sharedSaveItemStorage ${error.stack.toString()}`, true);
    }
}


export function sharedChangeLocalStorage (key, items) {
    try {
        let {
            expiredAt,
            query
        } = sharedGetItemsLocalStorage(key);

        sharedSaveItemsLocalStorage(key, items, expiredAt, query);

    } catch (error) {
        Console(`sharedChangeLocalStorage ${error.stack.toString()}`, true);
    }
}

export async function sharedChangeStorage (key, items) {
    try {

        let {
            expiredAt,
            query
        } = await sharedGetItemsStorage(key);

        await sharedSaveItemsStorage(key, items, expiredAt, query);
    } catch (error) {
        Console(`sharedChangeStorage ${error.stack.toString()}`, true);
    }
}



export async function sharedGetAPI (url, limit = 30, offset = 0, search = "", force = false) {
    try {
        Console(`sharedGetAPI ${url}`, true);
        let separator = url.includes("?") ? "&" : "?";
        let addQuery = force ? `&force=${Date.now()}` : "";
        const {
            data: response
        } = await axios.get(`${url + separator}offset=${offset}&limit=${limit}&find=${search}${addQuery}`);
        return response.data || response;
    } catch (error) {
        Console(`sharedGetAPI ${error.stack.toString()}`, true);
        return null;
    }
}

export async function saveOnCache (key, time, fn, saveOnCache = true) {
    if (await checkCache(key)) {
        if(typeof fn == "function") fn();
        if(saveOnCache) saveCache(key, time);
    }
}

export async function checkCache (key) {
    const now = parseInt(new Date().getTime() / 1000);
    const storage = await sharedGetItemStorageByStorage(key);
    if (storage.expiredAt == 0) return true;
    if (storage.expiredAt > now) return false;
    return true;
}

export async function  saveCache (key, time) {
    const now = parseInt(new Date().getTime() / 1000);
    sharedSaveItemStorage(
        key,
        {},
        now + time,
        ""
    );
}
export async function  deleteCache (key) {
    storage.remove(key);
    allInStore[key] = null;
}
