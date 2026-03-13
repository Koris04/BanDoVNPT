const express = require('express');
const router = express.Router();
const sql = require('mssql');

const sqlConfig = {
    user: 'sa', password: 'sql2019', database: 'VNPT_BanDo_Admin', server: 'localhost', port: 1433,
    options: { encrypt: false, trustServerCertificate: true }
};

//Route: Xử lý xóa gói cước
router.post('/xoa', async (req, res) => {
    try {
        //Chỉ cho phép Admin thực hiện
        if (!req.session.user || req.session.user.vai_tro_id !== 1) {
            return res.redirect('/quanly/goicuoc');
        }

        const idCanXoa = req.body.id;

        //Xóa gói cước khỏi Database
        let pool = await sql.connect(sqlConfig);
        await pool.request()
            .input('id', sql.Int, idCanXoa)
            .query('DELETE FROM GoiCuoc WHERE id = @id');
        res.redirect('/quanly/goicuoc');

    } catch (error) {
        console.error("Lỗi xóa gói cước:", error);
        res.redirect('/quanly/goicuoc');
    }
});

module.exports = router;