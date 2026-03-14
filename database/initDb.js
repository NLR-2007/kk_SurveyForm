const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function initDb() {
    try {
        // First connect without specifying database to create it if it doesn't exist
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            multipleStatements: true
        });

        console.log('Connected to MySQL server.');

        // Read the schema.sql file
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        // Execute the SQL queries
        console.log('Executing schema.sql...');
        await connection.query(schemaSql);
        console.log('Database and tables created successfully.');
        
        await connection.end();
        console.log('Connection closed.');
        process.exit(0);
    } catch (error) {
        console.error('Error initializing database:', error);
        process.exit(1);
    }
}

initDb();
