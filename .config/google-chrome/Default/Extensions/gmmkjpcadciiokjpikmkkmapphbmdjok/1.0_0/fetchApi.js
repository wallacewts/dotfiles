
function fetchRequest(data, sendResponse) {
    var json = JSON.parse(data.json);
    var headers = json.headers.split("\n");

    var xhr = new XMLHttpRequest();
    xhr.open(json.method, json.idnUrl);
    xhr.responseType = 'text';
    xhr.withCredentials = false;
    xhr.timeout = 7000;

    //add headers
    for (var i = 0; i < headers.length; i++) {
        var header = headers[i].trim();
        if (header) {
            var hdr = header.split(':');
            if (hdr.length !== 2) {
                sendResponse(invalidRequest(`Invalid Header:\n${header}`));
                return;
            }

            var key = hdr[0].trim();
            var val = hdr[1].trim();
            if (!isASCII(key) || !isASCII(val) || key.includes(' ')) {
                sendResponse(invalidRequest(`Invalid Header:\n${header}`));
                return;
            }

            if (isForbiddenHeader(key)) {
                sendResponse(invalidRequest(`Cannot set the header:\n${key}`));
                return;
            }

            xhr.setRequestHeader(key, val);
        }
    }

    // auth header
    var authError = validateAuthHeader(json.auth)
    if (authError) {
        sendResponse(invalidRequest(authError));
        return;
    }

    var authHeader = getAuthHeader(json.auth).trim();
    if (authHeader) {
        xhr.setRequestHeader("Authorization", authHeader);
    }

    // some additional headers
    //if (!headers.find(a =>a.includes("User-Agent"))) {
    //    xhr.setRequestHeader("User-Agent", navigator.userAgent);
    //}
    //if "Expect" not in headers:
    //    headers['Expect'] = ''

    var start = new Date();

    if (json.method === 'POST' || json.method === 'PUT' || json.method === 'PATCH') {
        var contentType = json.contentType;
        if (contentType) {
            xhr.setRequestHeader("Content-Type", getContentType(contentType));
        }
//        if (!json.content) {
//            xhr.setRequestHeader("Content-Length", "0");
//        }
    }

    xhr.onerror = function() {
      sendResponse(invalidRequest("Error sending request."));
    }

    xhr.onabort = function() {
      sendResponse(invalidRequest("Request was aborted."));
    }

    xhr.ontimeout = function() {
      sendResponse(invalidRequest("Request timeout."));
    }

    xhr.onload = function () {
      if (xhr.readyState === xhr.DONE) {
            var elapsed = new Date() - start;
            var content = xhr.responseText || '';
            var contentType = xhr.getResponseHeader('content-type');

            sendResponse({
                'Success': true,
                'Version': "1.1",
                'StatusCode': xhr.status,
                'StatusDescription': xhr.statusText,
                'Headers': xhr.getAllResponseHeaders(),
                'Content': content,
                'ContentLength': content.length,
                'ContentType': contentType,
                'Elapsed': elapsed,
                //'Redirects': response_redirect_urls,
                //'RedirectsTime': int(response_redirect_time * 1000),
                //'RedirectsCount': response_redirect_count,
                //'Timings': {}
            });
        }
    }

    try {
        xhr.send(json.content);
    } catch (err) {
        sendResponse(invalidRequest(err));
    }
}

function invalidRequest(error) {
    return {
        'Success': false,
        'Version': '',
        'StatusCode': 0,
        'StatusDescription': 'Error',
        'ContentType': 'text/plain',
        "Content": "ReqBin Chrome Extension\n\n" + error,
        'Elapsed': 0
    }
}

function isASCII(str) {
    return /^[\x00-\x7F]*$/.test(str);
}

function validateAuthHeader(auth) {
    if (!auth || !auth.auth) {
        return "";
    }

    var authType = auth.auth;
    if (authType === "bearerToken") {
        var header = auth.bearerToken;
        if (!header) {
            return "Invalid Bearer Token.";
        }

        if (!isASCII(header)) {
            return `Bearer Token contains non-ascii characters:\n${header}`;
        }
    }

    if (authType === "basicAuth") {
        var header = auth.basicUsername + ":" + auth.basicPassword;
        if (!auth.basicUsername || !auth.basicPassword) {
            return `Invalid Basic Auth header:\n${header}`;
        }

        if (!isASCII(header)) {
            return `Basic Auth header contains non-ascii characters:\n${header}`;
        }
    }

    if (authType === "customAuth") {
        var header = auth.customHeader;
        if (!header) {
            return "Invalid Custom Auth header.";
        }

        if (!isASCII(header)) {
            return `Custom Auth header contains non-ascii characters:\n${header}`;
        }
    }

    return "";
}

function getAuthHeader(auth) {
    if (!auth || !auth.auth) {
        return "";
    }

    var authType = auth.auth;
    if (authType === "noAuth") {
        return "";
    }

    if (authType === "bearerToken") {
        return "Bearer " + auth.bearerToken;
    }

    if (authType === "basicAuth") {
        basic = auth.basicUsername + ":" + auth.basicPassword;
        return "Basic " + btoa(basic);
    }

    if (authType === "customAuth") {
        return auth.customHeader;
    }

    return "";
}

function getContentType(contentType) {
    if (contentType == "URLENCODED")
        return "application/x-www-form-urlencoded"
    if (contentType == "JSON")
        return "application/json"
    if (contentType == "HTML")
        return "text/html"
    if (contentType == "XML")
        return "application/xml"
    if (contentType == "TEXT")
        return "text/plain"
    return ""
}

function isForbiddenHeader(header) {
    var headers = [
        "Accept-Charset",
        "Accept-Encoding",
        "Access-Control-Request-Headers",
        "Access-Control-Request-Method",
        "Connection",
        "Content-Length",
        "Cookie",
        "Cookie2",
        "Date",
        "DNT",
        "Expect",
        "Feature-Policy",
        "Host",
        "Keep-Alive",
        "Origin",
        //"Proxy-",
        //"Sec-",
        "Set-Cookie",
        "Set-Cookie2",
        "Referer",
        "TE",
        "Trailer",
        "Transfer-Encoding",
        "Upgrade",
        "User-Agent",
        "Via"
    ];

    return !!headers.find(a =>a.toLowerCase().includes(header.toLowerCase()));
}