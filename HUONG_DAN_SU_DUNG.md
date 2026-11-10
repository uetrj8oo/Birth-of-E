# 🎉 HỆ THỐNG BỐC THĂM LỜI CHÚC SINH NHẬT - ĐỘI EVENT UIT 💛

> **Đơn vị phát triển:** Đội Sự Kiện (Đội Event) - Trường Đại học Công nghệ Thông tin (ĐHQG-HCM)  
> **Phiên bản:** 2026 Official Release  
> **Chủ đề thiết kế:** Vàng chanh đặc trưng (Lemon Yellow Neo-Pop) • Đồ họa thủ công sinh viên năng động, ấm áp, đậm chất Đội Event UIT (không mang cảm giác AI).

---

## 🌟 TÍNH NĂNG NỔI BẬT

1. **Nhận diện thành viên tức thì:**
   - Khi thành viên nhập 8 số MSSV (ví dụ: `26520057`, `25520450`...), hệ thống tự động tra cứu danh sách 27 thành viên chính thức của Đội Event, hiển thị họ tên và phân ban (Ban Sự kiện / Ban Truyền thông) để chào mừng.

2. **Vòng quay bốc thăm ngẫu nhiên (Random Matching):**
   - Bấm nút **"Bắt đầu bốc thăm"** với hiệu ứng vòng quay Slot Machine sinh động và âm thanh vui nhộn.
   - **Cam kết 100%:** Thuật toán loại bỏ MSSV của chính người nhập, đảm bảo không bao giờ bạn tự bốc thăm trúng chính mình.
   - Hiển thị đầy đủ: **Họ và tên người nhận, MSSV, Phân ban** và avatar viết tắt.

3. **Khung nhập lời chúc sinh nhật ấm áp:**
   - Thiết kế dạng bưu thiếp sinh nhật / giấy note vàng chanh xinh xắn.
   - Đếm ký tự trực tiếp.
   - Tích hợp sẵn 5 thẻ gợi ý lời chúc vui vẻ, năng động (nhấn để chèn tự động).
   - Tùy chọn chế độ người gửi:
     - Dùng tên thật của mình.
     - Ẩn danh bí mật (`Ẩn danh (Bí mật 🤫)`).
     - Tự đặt biệt danh (Nickname).

4. **Lưu trữ dữ liệu chỉ Quản trị viên (Admin) xem được:**
   - **Cách 1 - Google Sheets (Khuyên dùng):** Đồng bộ trực tiếp qua Google Apps Script Web App. Bảng tính Google Sheets được lưu trong Google Drive riêng của bạn, chỉ bạn (Admin) mới có quyền mở xem. Người dùng công khai trên web hoàn toàn không thể xem trộm lời chúc của người khác.
   - **Cách 2 - Cổng Quản Trị Viên (Admin Dashboard) tích hợp sẵn trên web:** Bảo mật bằng mã PIN riêng (`eventuit2026`). Cho phép xem danh sách, lọc theo người nhận, chuyển trạng thái "Đã đăng post", tự động tạo Caption đăng bài Fanpage và xuất file Excel (.CSV) chuẩn UTF-8 có dấu.

---

## 🚀 HƯỚNG DẪN MỞ & SỬ DỤNG TRÊN MÁY TÍNH

1. Mở thư mục: `D:\Birth of E`
2. **Nhấp đúp chuột vào file `index.html`** (hoặc chạy `open-web.bat`).
3. Trang web sẽ lập tức mở trên trình duyệt (Chrome, Edge, Firefox, Cốc Cốc...) và sẵn sàng hoạt động ngay mà không cần cài đặt thêm phần mềm nào!

---

## 🌐 HƯỚNG DẪN PUBLIC LÊN WEB HOÀN TOÀN MIỄN PHÍ (TRONG 2 PHÚT)

Bạn có thể đưa trang web này lên Internet để toàn bộ thành viên Đội Event có thể truy cập qua điện thoại hoặc máy tính ở bất kỳ đâu. Có 3 cách cực kỳ dễ dàng:

### CÁCH 1: NETLIFY DROP (DỄ NHẤT - CHỈ MẤT 30 GIÂY, KHÔNG CẦN TÀI KHOẢN GIT)
1. Truy cập vào đường link: **[https://app.netlify.com/drop](https://app.netlify.com/drop)**
2. Kéo toàn bộ thư mục `Birth of E` và thả vào ô tải lên trên màn hình trình duyệt.
3. Chờ 10 giây! Netlify sẽ cung cấp cho bạn một đường link công khai (ví dụ: `https://event-uit-birthday.netlify.app`). Bạn có thể gửi link này vào group Zalo / Messenger của Đội Event ngay lập tức!

### CÁCH 2: VERCEL
1. Đăng nhập vào [vercel.com](https://vercel.com).
2. Tạo dự án mới và kết nối với GitHub repository của bạn (hoặc dùng Vercel CLI).
3. Bấm **Deploy**. Trang web sẽ chạy với tốc độ cực nhanh trên toàn cầu.

### CÁCH 3: GITHUB PAGES
1. Đẩy toàn bộ source code trong `Birth of E` lên một repository trên GitHub (ví dụ: `birth-of-e-uit`).
2. Vào **Settings** -> **Pages**.
3. Tại mục **Branch**, chọn `main` (hoặc `master`) và thư mục `/(root)`, rồi bấm **Save**.
4. Sau 1 phút, trang web sẽ online tại: `https://<ten-user>.github.io/<ten-repo>/`.

---

## 📊 HƯỚNG DẪN KẾT NỐI GOOGLE SHEETS (LƯU LỜI CHÚC TỰ ĐỘNG)

Để tất cả lời chúc của các thành viên tự động lưu vào 1 file Google Sheets riêng của Admin:

1. Mở Google Drive hoặc truy cập: **[https://sheets.google.com](https://sheets.google.com)**
2. Bấm tạo một bảng tính mới, đặt tên: **`LỜI CHÚC SINH NHẬT - ĐỘI EVENT UIT`**.
3. Trên thanh menu trên cùng của Google Sheets, chọn: **Tiện ích mở rộng (Extensions)** ➜ **Apps Script**.
4. Xóa hết mã mặc định trong file `Code.gs`.
5. Mở file `google-apps-script.js` trong thư mục dự án này, copy toàn bộ nội dung và dán vào Apps Script.
6. Nhấn biểu tượng đĩa mềm 💾 (hoặc Ctrl + S) để lưu lại.
7. Nhấn nút **Triển khai (Deploy)** màu xanh góc trên bên phải ➜ Chọn **Tùy chọn triển khai mới (New deployment)**:
   - **Chọn loại:** Bấm icon bánh răng ⚙️ ➜ Chọn **Ứng dụng web (Web app)**.
   - **Mô tả:** `Event UIT Birthday Webhook`
   - **Thực thi dưới dạng (Execute as):** `Tôi (email của bạn)`
   - **Ai có quyền truy cập (Who has access):** Chọn **`Bất kỳ ai (Anyone)`** *(Bắt buộc chọn Anyone để trang web công khai có thể gửi lời chúc vào sheet)*.
8. Bấm **Triển khai** ➜ Bấm **Ủy quyền truy cập** và đăng nhập tài khoản Google của bạn.
9. Copy đường link **URL ứng dụng web** (Web App URL có đuôi `/exec`).
10. Mở trang web `index.html` của bạn:
    - Bấm nút **Quản Trị** ở góc trên bên phải (hoặc phím tắt `Ctrl + Shift + A`).
    - Nhập PIN: `eventuit2026`.
    - Chuyển sang tab **"Kết nối Sheets & Bảo mật"**.
    - Dán đường link URL vừa copy vào ô rồi bấm **"Lưu URL Webhook"**.
    - Bấm **"Kiểm tra kết nối"** để kiểm tra hoạt động!

Từ lúc này, mỗi khi có bạn gửi lời chúc trên web, Google Sheets của bạn sẽ tự động thêm 1 dòng mới với đầy đủ thông tin: Thời gian, MSSV nhận, Tên nhận, Ban, MSSV gửi, Lời chúc, và Trạng thái!

---

## 🛡️ HƯỚNG DẪN SỬ DỤNG CỔNG QUẢN TRỊ VIÊN (ADMIN DASHBOARD)

- **Cách mở:** Nhấn nút **"Quản Trị"** ở góc trên bên phải thanh Menu hoặc nhấn tổ hợp phím **`Ctrl + Shift + A`**.
- **Mã PIN mặc định:** `eventuit2026` *(Có thể thay đổi trong tab Cài đặt)*.
- **Các tính năng dành riêng cho Admin:**
  1. **Xem toàn bộ lời chúc:** Tìm kiếm theo tên người nhận, MSSV, nội dung; Lọc theo trạng thái "Chưa đăng post" / "Đã đăng post".
  2. **Nút "Copy":** Tự động tạo caption Facebook hoàn chỉnh theo đúng văn phong Fanpage Đội Event UIT kèm hashtag, chỉ cần Ctrl+V lên Facebook là xong bài!
  3. **Nút "Xuất Excel (.CSV)":** Tải toàn bộ danh sách lời chúc về máy tính với chuẩn font tiếng Việt UTF-8 có dấu rõ nét.
  4. **Quản lý thành viên:** Xem danh sách 27 thành viên, thêm thành viên mới khi có đợt tuyển CTV/thành viên bổ sung, hoặc sửa đổi thông tin.

---

## 🎨 TÀI NGUYÊN ĐỒ HỌA & LOGO
- **Logo chính thức Đội Event - UIT:** Đã được tích hợp chuẩn xác tại `assets/images/logo-event-uit.png` (được trích xuất từ bộ nhận diện chính thức của UIT & Hội Sinh Viên).
- **Bộ font chữ:** Sử dụng font `Lexend`, `UTM Bitsumishi Pro` và `Caveat` kết hợp phong cách Neo-Brutalist trẻ trung, tạo cảm giác thân thuộc của một website do chính các bạn sinh viên UIT thiết kế.
