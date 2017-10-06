exports.getRenderName = function(prefix, suffix) {
    return `${prefix}/${suffix}`;  
} 

/**
 * Send an error from a route back to the client. 
 * The errMsg is returned to the client, and the http code is specified in status.
 */
exports.sendError = function (res, err, errMsg = 'Error - Unspecified', status = 500) {
    console.err(`db.sendError: ${errMsg} ;; ${err || '' }`);
    if (isNaN(status)) {
        status = 500;
        console.log('routes/helper.sendError status not a number, changed to 500');
    } else if (status >= 200 && status <= 299) {
        status = 500;
        console.log('routes/helper.sendError status cannot be a 2xx code, changed to 500');
    }
    res.status(status).send(errMsg);
}

/**
 * Run regex test on value, sends HTTP 422 and optional errMsg to client on failure.
 * Returns success of regular expression test.
 */
exports.paramRegex = function(res, value, regex, errMsg = 'Invalid parameter') {
    if (!regex.test(value)) {
        res.status(422).send(errMsg);
        return false;
    }
    return true;
};

/**
 * Common regular expressions
 */
exports.regex = {
    classId: /^[a-z0-9]{8}-[a-z0-9]{4}-4[a-z0-9]{3}-[a-z0-9]{4}-[a-z0-9]{12}$/,
    studentNetId: /.*/ 
};