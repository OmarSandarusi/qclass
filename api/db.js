var mysql = require('mysql');
var uuid = require('uuid/v4');
var async = require('async');

var pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "password",
    database: "SISystem"
});

exports.addClass = function(code, name, defLocation, callback) {
    var id = uuid();
    var query = `INSERT INTO course (cID, cCode, cName, defLocation) VALUES (?, ?, ?, ?)`;
    runQuery(query, [id, code, name, defLocation], callback);
};

exports.enroll = function(classId, students, callback) {
    useConnection(callback, function(con) {
        var values = [];
        var newStudents = [];
        var errorStudents = [];
        async.forEachOf(students, function(student, i, innerCallback) {
            con.query('SELECT 1 FROM student WHERE sNetID = ?', [student], function(err, results, fields) {
                if (err) {
                    errorStudents.push(student);
                    innerCallback(err);
                } else {
                    if (!Array.isArray(results)) { 
                        errorStudents.push(student);
                        innerCallback(new Error('Select query did not return an array'));
                    } else if (results.length > 1) {
                        errorStudents.push(student);
                        innerCallback(new Error('Selct query returned more than 1 row'));
                    } else {
                        if (results.length == 0) { // student does not exist, insert student
                            newStudents.push([student]);
                            values.push([student, classId]);
                            innerCallback();
                        } else { // student exists, need to check current enrollment to avoid attempting duplicates
                            alreadyEnrolledQuery = 'SELECT 1 FROM enrolled WHERE sNetID = ? AND cID = ?';
                            runExistenceQuery(alreadyEnrolledQuery, [student, classId], function(err, result) {
                                if (err) innerCallback(err);
                                else {
                                    if (!result) values.push([student, classId]);
                                    innerCallback();
                                }
                            });
                        }
                    }
                }
            });
        }, function (err) { 
            if (err) {
                err.errorStudents = errorStudents;
                if (con) con.release();
                callback(err);
            } else {
                if (newStudents.length > 0) {
                    con.query('INSERT INTO student (sNetID) VALUES ?', [newStudents], function(err, results, fields) {
                        if (err) callback(err);
                        else _runEnrollQuery(con, values, callback);
                    });
                } else _runEnrollQuery(con, values, callback);
            }
        })
    });
};

function _runEnrollQuery(con, values, callback) {
    if (values.length < 1) callback({ customStatus: 409, message: 'All students already enrolled' });
    else con.query('INSERT INTO enrolled (sNetID, cID) VALUES ?', [values], callback);
}

exports.profExists = function(netId, callback) {
    runExistenceQuery(`SELECT 1 FROM professor WHERE pNetID = ?`, [netId], callback);
};

exports.studentExists = function(netId, callback) {
    runExistenceQuery(`SELECT 1 FROM student WHERE sNetID = ?`, [netId], callback);
};

exports.ownsClass = function(classId, netId, callback) {
    runExistenceQuery(`SELECT 1 FROM  teaches WHERE pNetID = ? AND cID = ?`, [netId, classId], callback);
};

exports.isEnrolled = function(netId, classId, callback) {
    runExistenceQuery(`SELECT 1 FROM  enrolled WHERE sNetID = ? AND cID = ?`, [netId, classId], callback);
};

exports.getEnrolledClasses = function(studentId, callback) {
    var query = 
        `SELECT course.cID, course.cName, course.cCode
        FROM student
            INNER JOIN enrolled ON student.sNetID = enrolled.sNetID AND student.sNetID = ?
            INNER JOIN course ON enrolled.cID = course.cID`;
    runQuery(query, [studentId], callback);
};


exports.startAttendance = function(classId, duration, time, callback) {
    var query = 'INSERT INTO attendanceSession (cID, attTime, attDuration) VALUES ?';
    runQuery(query, [classId, time, duration], callback);
}

exports.recordAttendance = function(netId, classId, time, callback) {
    var query = `INSERT INTO attendance (cID, attTime, sNetID) VALUES ?`;
    runQuery(query, [classId, time, netId], callback);
}

exports.getTeachesClasses = function(profId, callback) {
    var query = 
        `SELECT course.cID, course.cName, course.cCode
         FROM teaches NATURAL JOIN course
         WHERE pNetID = ?`;
    runQuery(query, [profId], callback);
};

/**
 * Runs the given query, checks if the result returned any values and returns its findings as a boolean to the callback
 * @param {string} query 
 * @param {Array} values
 * @param {Function} callback (err, result)
 */
function runExistenceQuery(query, values, callback) {
    runQuery(query, values, function(err, results, fields) {
        if (err) callback(err);
        else if (results.length > 0) 
            callback(undefined, true);
        else callback(undefined, false);
    });
}

/**
 * Run a query
 * @param {string} query
 * @param {function} callback Will call callback(err) if err or callback(undefined, results, fields)
 * @param {Array} values Values for automatic insertion
 */
function runQuery(query, values, callback) {
    useConnection(callback, function(con) {
        if (values) con.query(query, values, callback)
        else con.query(query, callback);
    });
}

function useConnection(callback, queryFunc) {
    pool.getConnection(function(err, con) {
        if (err) {
            console.log('Error getting connection from pool');
            if (con) { // try to release connection if it exists for some reason
                try {
                    con.release();
                } finally { }
            }
            callback(err);
        } else {
            queryFunc(con);
            con.release();
        }
    });
}; 

// Below are legacy Q&A queries

// exports.getLectures = function(classId, callback) {
//     var query = 
//         `SELECT *
//          FROM lecture
//          WHERE lecture.cID = '${classId}'`;
//     runQuery({ query: query, callback: callback });
// };

// exports.getActiveLecture = function(classId, callback) {
//     var now = Date.now();
//     var query = 
//         `SELECT *
//         FROM lecture
//         WHERE cID = '${classId}'
//             AND `; //TODO: finish query
//     runQuery({ query: query, callback: function (err, results, fields) {
//         if (err)
//             callback(err);
//         else if (results.length < 1) {
//             callback();
//         } else { 
//             if (results.length > 1) 
//                 console.log(`Warning: db.getActiveLecture query returned more than one result: ${results}`);
//             callback(undefined, results[0], fields);
//         }
//     } });
// }