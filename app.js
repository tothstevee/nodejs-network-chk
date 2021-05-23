const speedTest = require('speedtest-net');
const mysql = require('mysql');
require('dotenv').config();

let mysql_connection = {
    connect: () => {
        return new Promise((resolve,reject) => {
            let connection = mysql.createConnection({
                host     : process.env.DB_HOST || '127.0.0.1',
                user     : process.env.DB_USER,
                password : process.env.DB_PASSWORD,
                database : process.env.DB_DATABASE
            });
            
            connection.connect((err) => {
                if(err){
                    reject(err);
                }else{
                    resolve(connection);
                }
            });
        });
    },

    run: (connection, sql, params) => {
        if(params == undefined){
            params = [];
        }

        return new Promise((resolve, reject) => {
            connection.query(sql, params, (err, res) => {
                if(err){
                    reject();
                }
                resolve(res);
            });
        });
    }
}

/*
    Database test
    ----
    Testing connection to database
*/
let testDatabase = () => {
    let saveToDb = process.env.SAVE_TO_DB || false;
    return new Promise((resolve, reject) => {
        if(!saveToDb) resolve(true);
        mysql_connection.connect().then((connection) => {
            mysql_connection.run(connection,"SHOW TABLES LIKE ?",['tests']).then((res) => {
                if(!res.length){
                    reject(300);
                }
                resolve(true);
            }).catch(() => {
                reject(200);
            });
        }).catch((error) => {
            console.log(error);
            reject(100);
        });
    });
}

/*
    Start test
    ----
    Starting test using speedtest cli and returning the result.
*/
let startTest = () => {
    return new Promise((resolve,reject) => {
        speedTest({
            acceptLicense: true,
            acceptGdpr: true,
        }).then((res) => {
            resolve({
                'tester': res.isp,
                'server': res.server.name,
                'ping': res.ping.latency,
                'download': res.download.bandwidth,
                'upload': res.upload.bandwidth,
                'url': res.result.url
            });
        }).catch((error) => {
            reject(error);
        });
    });
}

/*
    restart
    ----
    Restart testing
*/

let timeout = null;
let restart = () => {
    let restart_endabled = process.env.RESTART_AFTER_TEST || false;
    if(!restart_endabled) return;

    if(timeout != null){
        clearTimeout(timeout);
        timeout = null;
    }

    timeout = setTimeout(run, process.env.TEST_DALEY || 3600000);
}

/*
    run
    ----
    Base function.
*/
let run = () => {
    let saveToDb = process.env.SAVE_TO_DB || false;

    console.log("---------");
    console.log("Start testing...");
    startTest().then((res) => {
        console.log("Test success!");
        console.table([res]);
        if(saveToDb){
            mysql_connection.connect().then((connection) => {
                mysql_connection.run(
                    connection,
                    "INSERT INTO tests (tester,server,ping,download,upload,url) VALUES (?,?,?,?,?,?)",
                    [res.tester,res.server,res.ping,res.download,res.upload,res.url]
                ).then(() => {
                    restart();
                }).catch(() => {
                    console.log("Error when trying to save data to db!");
                    restart();
                })
            })
        }else{
            restart();
        }
        
    }).catch((error) => {
        console.log("Opps.. looks like sg went wrong!");
        console.log(error);
        restart();
    });
}


let init = () => {
    console.log("Init application");
    console.log("Testing settings");
    testDatabase().then(() => {
        console.log("Database connection success!");
        run();
    }).catch((error) => {
        console.log("error-code",error);
        console.log("Database connection falied!");
        console.log("Check following database settings:")
        console.table([{
            'host': process.env.DB_HOST,
            'user': process.env.DB_USER,
            'password': 'hidden',
            'database': process.env.DB_DATABASE,
        }]);
        console.log("If you dont want use database storing option just disable in .env file");
    });
}
init();