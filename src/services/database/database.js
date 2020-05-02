const sql = require("mssql");
const fs = require("fs");

let pool;

const config = {
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    server: process.env.SQL_SERVER,
    database: process.env.SQL_DB,
}

// Call this before connectDB() to initialize empty servers.
async function initDB() {
    console.log("-> Initializing the database... please wait!");
    const config_init = {
        user: process.env.SQL_USER,
        password: process.env.SQL_PASSWORD,
        server: process.env.SQL_SERVER,
    }
    try {
        let init_pool = await sql.connect(config_init);
        let createtablesql = fs.readFileSync(__dirname + '/create_tables.sql', 'utf8');
        let createdbsql = fs.readFileSync(__dirname + '/create_db.sql', 'utf8');

        await init_pool.request().query(createdbsql)
        await init_pool.request().query(createtablesql);
        await init_pool.close();
    } catch (e) {
        console.error("There was an error initializing the database...");
        console.error(e);
        process.exit(1);
    }

}

async function connectDB() {
    console.log("-> Connecting to MS SQL Server...");
    try {
        pool = await sql.connect(config);
        let result = await pool.request().query("select 1 as number");
        console.log("-> Test Query: ");
        console.log(result);
    } catch (e) {
        console.error("-> There was an error connecting to the database...");
        console.error(e);
    }
}

async function createUserIfNotExists(userID) {
    try {
        let result = await pool.request()
            .input("user_id", userID)
            .query(`IF NOT EXISTS ( select 1 from users where user_id = @user_id) INSERT INTO users (user_id) VALUES (@user_id)`);
        //console.log(result);
        return null;
    } catch(e) {
        console.log(e);
        return e;
    }

}

module.exports = {initDB, connectDB, createUserIfNotExists}
