const express = require('express');
const router = express.Router();

const kiemTraDangNhap = (req, res, next) => {
    if (req.session.user) next(); else res.redirect('/dangnhap');
};

//Route: Hiển thị giao diện cập nhật hồ sơ
router.get('/capnhat', kiemTraDangNhap, (req, res) => {
    res.render('taikhoan_capnhat', { 
        title: 'Cập nhật hồ sơ', 
        user: req.session.user 
    });
});

module.exports = router;