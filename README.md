# BanDoVNPT
Đề tài xây dựng hệ thống bản đồ theo dõi kết nối mạng của VNPT đến với người dùng trong vùng đô thị Long Xuyên 

Hệ thống hoạt động bằng lệnh npm t trong Terminal của folder source code. Nếu muốn ngừng hoạt động của phiên làm việc, thì chỉ cần nhấn giữ tổ hợp Ctrl C (nhấn thêm Y để Yes nếu sử dụng cmd).

1. Danh sách các thư viện mã nguồn mở mà hệ thống sử dụng:
Backend
+ express: Framework chính để xây dựng Web Server
+ .mongoose: Thư viện kết nối và thao tác với Cơ sở dữ liệu MongoDB
+ .ejs: Công cụ mẫu  để hiển thị giao diện
+ .express-ejs-layouts: Hỗ trợ quản lý Master Layout giúp tối ưu cấu trúc giao diện
+ .express-session: Quản lý phiên đăng nhập và bảo mật người dùng
+ .connect-flash: Hỗ trợ truyền thông báo  giữa các trang
+ .dotenv: Quản lý các biến môi trường và thông tin bảo mật
+ .path: Xử lý đường dẫn thư mục trong hệ thống.

Frontend & Thư viện bổ trợ
+ Leaflet.js: Thư viện xử lý bản đồ không gian và hiển thị các điểm tọa độ. 
+ Bootstrap 5: Framework CSS hỗ trợ giao diện Responsive và các thành phần UI. 
+ Bootstrap Icons: Bộ icon dùng cho hệ thống điều hướng và trạng thái.
+ jQuery: Hỗ trợ xử lý các sự kiện DOM và tương tác JavaScript. 
+ SheetJS (xlsx): Hỗ trợ xuất dữ liệu từ bảng HTML ra file Excel.  

2. Khi tải source code về. Trước hết phải mở Terminal của source lên, và dùng lệnh npm install để hệ thống có thể tải đủ các module cần thiết để hoạt động.
Lưu ý: Nếu npm install không tải đủ thư viện hoặc báo lỗi. Thực hiện các cách sau:
1/ Chạy lệnh "npm cache clean --force" để xóa các dữ liệu tải lỗi trước đó.

2/ Kiểm tra và đảm bảo đang dùng phiên bản Node LTS.

3/ Xóa file "package-lock.json" và thư mục "node_modules", sau đó chạy lại lệnh "npm install".

4/ Nếu vẫn còn lỗi, hãy thử cài lại các thư viện cốt lõi bằng lệnh sau: npm install express mongoose ejs express-ejs-layouts express-session connect-flash dotenv

3. Vì lý do bảo mật và tối ưu dung lượng, một số file quan trọng không được đẩy lên GitHub (Danh sách nằm trong .gitignore).
Lưu ý: Hệ thống sẽ không tự sinh ra các file này, người dùng cần phải tạo thủ công sau khi tải mã nguồn về. Cách tạo các file lần lượt như sau.

1/ Thư mục "node_modules/": Chạy lệnh npm install như hướng dẫn ở mục 2 sẽ tải lại toàn bộ.

2/ File cấu hình môi trường ".env" và ".env.vnpt": Tạo file ở thư mục gốc với mẫu như sau: 
--PORT=3000
MONGO_URI=mongodb://localhost:27017/Ten_Database_Cua_Nguoi_Dung--

3/ File "database.config.json": Tạo file này trong thư mục gốc nếu logic code của người dùng yêu cầu đọc thông tin từ JSON thay vì ".env".

4/ File logic kết nối "database.js": Tạo file ở thư mục gốc với nội dung như sau:
--const mongoose = require('mongoose');
require('dotenv').config();

const connectMongoDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Kết nối MongoDB thành công!");
    } catch (err) {
        console.error("Lỗi kết nối:", err);
    }
};

module.exports = { connectMongoDB };--
5/ Cách để sử dụng file DanhSachGoiCuoc để tải các thông tin về các gói cước (Lưu ý: Người dùng cần phải chạy lệnh Create GoiCuoc để SQL có thể tạo sẵn các cột dữ liệu):
Bước 1: Kích hoạt SQL Sever Import and Export Wizard. Tại đây, người dùng chọn Data Source là Microsoft Excel tại ô Data source. Cùng lúc đó, người dùng sẽ tìm đến file Excel muốn nhập liệu thông qua Browse rồi chọn Next.
Bước 2: Tiếp đến, trong cửa sổ Choose a destination, người dùng chọn vào mục SQL sever Native Client 11.0.
Bước 3: Khi đã hoàn tất chọn thì giao diện sẽ thay đổi. Lúc này người dùng sẽ cần nhập thêm các thông tin để kết nối với cơ sở dữ liệu. Trong đó bao gồm các trường thông tin như Sever name, loại Authentication và Database.
Bước 4: Kiểm tra lại các thông tin đã nhập ở bước 3 trước khi Next.
Bước 5: Cuối cùng, chọn tạo bản sao hoặc truy vấn tại cửa sổ Specify Table Copy or Query rồi chọn Next để tiếp tục và hoàn tất.

Tài khoản để thầy cô có thể sử dụng để test bài:
Tên đăng nhập: taikhoan_test
Mật khẩu: 123456
