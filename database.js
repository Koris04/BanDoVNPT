require('dotenv').config();
const mongoose = require('mongoose');
const sql = require('mssql');

// 1. Cấu hình kết nối SQL Server
const sqlConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    server: process.env.DB_SERVER,
    port: Number(process.env.DB_PORT),
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

// 2. Hàm kết nối MongoDB
const connectMongoDB = async () => {
    try {
        const uri = process.env.MONGO_URI;
        await mongoose.connect(uri);
        console.log('Đã kết nối MongoDB thành công!');
    } catch (err) {
        console.error(' Lỗi kết nối MongoDB:', err);
    }
};

module.exports = {
    sqlConfig,
    connectMongoDB
};