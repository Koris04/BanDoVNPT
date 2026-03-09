const express = require('express');
const router = express.Router();

// Route: Hiện form đăng nhập
router.get('/dangnhap', (req, res) => {
    // Nếu đã đăng nhập rồi thì trở về trang chủ
    if (req.session.user) return res.redirect('/');
    res.render('dangnhap');
});

module.exports = router;