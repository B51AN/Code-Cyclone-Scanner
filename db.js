const mysql = require('mysql');

// mySQL database details info below
const db = mysql.createPool({
    host: 'localhost',        
    user: 'root',             
    password: 'rolland$1234', 
    database: 'npm_audit',    
    connectionLimit: 10,      
});

// Test the connection
db.getConnection((err, connection) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        process.exit(1); // Exit the process if there's an error
    }
    console.log('Connected to the MySQL database.');
    connection.release(); // Release the connection back to the pool
});

module.exports = db;


// when app is running it connects to the dataabase
