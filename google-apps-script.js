/**
 * ============================================================================
 * GOOGLE APPS SCRIPT - LƯU TRỮ LỜI CHÚC SINH NHẬT ĐỘI EVENT - UIT
 * ============================================================================
 * 
 * HƯỚNG DẪN CÀI ĐẶT NHANH TRONG 1 PHÚT:
 * 1. Mở https://sheets.google.com -> Tạo một bảng tính Google Sheets mới (Đặt tên: "LỜI CHÚC SINH NHẬT - ĐỘI EVENT UIT").
 * 2. Trên thanh menu, chọn: Tiện ích mở rộng (Extensions) -> Apps Script.
 * 3. Xóa hết code mặc định trong file Code.gs và dán toàn bộ đoạn mã bên dưới vào.
 * 4. Nhấn nút "Lưu" (biểu tượng đĩa mềm hoặc Ctrl + S).
 * 5. Nhấn nút "Triển khai" (Deploy) màu xanh ở góc trên bên phải -> Chọn "Tùy chọn triển khai mới" (New deployment).
 *    - Loại triển khai: Chọn "Ứng dụng web" (Web app).
 *    - Mô tả: "Event UIT Birthday Webhook".
 *    - Thực thi dưới dạng (Execute as): "Tôi" (Me / your-email@gmail.com).
 *    - Ai có quyền truy cập (Who has access): "Bất kỳ ai" (Anyone).
 * 6. Nhấn "Triển khai" -> Cấp quyền truy cập Google Account khi được hỏi.
 * 7. Sao chép "URL ứng dụng web" (Web App URL có dạng: https://script.google.com/macros/s/.../exec)
 *    và dán vào phần "Cài đặt Quản trị viên" trên website là xong!
 * ============================================================================
 */

// Đặt mật khẩu bí mật nếu muốn Admin đọc dữ liệu trực tiếp qua API (Tùy chọn)
const ADMIN_API_KEY = "eventuit2026";

function doPost(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName("Lời Chúc");
    
    // Nếu sheet chưa tồn tại thì tạo mới và tạo hàng tiêu đề chuẩn
    if (!sheet) {
      sheet = ss.insertSheet("Lời Chúc");
      const headers = [
        "Thời Gian Gửi",
        "MSSV Người Nhận",
        "Họ Tên Người Nhận",
        "Phân Ban Người Nhận",
        "MSSV Người Gửi",
        "Họ Tên Người Gửi",
        "Tên Hiển Thị (Ẩn Danh)",
        "Nội Dung Lời Chúc Sinh Nhật",
        "Trạng Thái Đăng Post"
      ];
      sheet.appendRow(headers);
      
      // Định dạng thanh tiêu đề chuẩn màu Vàng Chanh Đội Event
      const headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setBackground("#E8FF3B"); // Màu vàng chanh Event
      headerRange.setFontColor("#18181B");
      headerRange.setFontWeight("bold");
      headerRange.setHorizontalAlignment("center");
      headerRange.setVerticalAlignment("middle");
      sheet.setRowHeight(1, 38);
      
      sheet.setColumnWidth(1, 160); // Thời gian
      sheet.setColumnWidth(2, 120); // MSSV nhận
      sheet.setColumnWidth(3, 180); // Tên nhận
      sheet.setColumnWidth(4, 140); // Ban
      sheet.setColumnWidth(5, 120); // MSSV gửi
      sheet.setColumnWidth(6, 180); // Tên gửi
      sheet.setColumnWidth(7, 160); // Tên hiển thị
      sheet.setColumnWidth(8, 450); // Nội dung lời chúc
      sheet.setColumnWidth(9, 140); // Trạng thái
    }
    
    // Parse dữ liệu gửi lên (hỗ trợ cả JSON body và URL-encoded form data)
    let data;
    if (e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (err) {
        data = e.parameter;
      }
    } else {
      data = e.parameter;
    }
    
    const timestamp = data.timestamp || Utilities.formatDate(new Date(), "Asia/Ho_Chi_Minh", "dd/MM/yyyy HH:mm:ss");
    const receiverMssv = data.receiver_mssv || "";
    const receiverName = data.receiver_name || "";
    const receiverDept = data.receiver_dept || "";
    const senderMssv = data.sender_mssv || "";
    const senderName = data.sender_name || "";
    const senderDisplay = data.sender_display || (data.is_anonymous ? "Ẩn danh (Bí mật 🤫)" : senderName);
    const wishContent = data.wish_content || "";
    const status = data.status || "Chưa đăng post";
    
    if (!wishContent || !receiverMssv) {
      return ContentService.createTextOutput(JSON.stringify({
        status: "error",
        message: "Thiếu thông tin người nhận hoặc nội dung lời chúc"
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Thêm hàng mới
    sheet.appendRow([
      timestamp,
      "'" + receiverMssv, // Dấu nháy đơn để giữ đúng số 0 ở đầu nếu có
      receiverName,
      receiverDept,
      "'" + senderMssv,
      senderName,
      senderDisplay,
      wishContent,
      status
    ]);
    
    // Canh chỉnh hàng mới
    const lastRow = sheet.getLastRow();
    sheet.getRange(lastRow, 1, 1, 9).setVerticalAlignment("middle");
    sheet.getRange(lastRow, 8).setWrap(true); // Tự động xuống dòng cho lời chúc dài
    
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Lời chúc đã được lưu thành công vào Google Sheet!",
      row: lastRow
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  const params = e ? e.parameter : {};
  
  // Kiểm tra nếu admin yêu cầu lấy danh sách lời chúc
  if (params && params.action === "get_wishes" && params.key === ADMIN_API_KEY) {
    try {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const sheet = ss.getSheetByName("Lời Chúc");
      if (!sheet) {
        return ContentService.createTextOutput(JSON.stringify({ status: "success", wishes: [] }))
          .setMimeType(ContentService.MimeType.JSON);
      }
      
      const values = sheet.getDataRange().getValues();
      const wishes = [];
      for (let i = 1; i < values.length; i++) {
        const row = values[i];
        wishes.push({
          id: i,
          timestamp: row[0],
          receiver_mssv: String(row[1]).replace(/^'/, ''),
          receiver_name: row[2],
          receiver_dept: row[3],
          sender_mssv: String(row[4]).replace(/^'/, ''),
          sender_name: row[5],
          sender_display: row[6],
          wish_content: row[7],
          status: row[8]
        });
      }
      
      return ContentService.createTextOutput(JSON.stringify({ status: "success", wishes: wishes }))
        .setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
      return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  
  // Mặc định trả về thông báo hệ thống hoạt động
  return ContentService.createTextOutput(JSON.stringify({
    status: "active",
    club: "ĐỘI EVENT - TRƯỜNG ĐH CÔNG NGHỆ THÔNG TIN (UIT)",
    service: "Hệ thống Tiếp Nhận Lời Chúc Sinh Nhật Thành Viên",
    time: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}
