/**
 * ============================================================================
 * GOOGLE APPS SCRIPT - LƯU TRỮ LỜI CHÚC SINH NHẬT ĐỘI EVENT - UIT
 * ============================================================================
 * Thứ tự cột trong Google Sheet:
 *   A Thời gian gửi | B MSSV người gửi | C Họ tên người gửi | D MSSV người nhận
 *   E Họ tên người nhận | F Phân ban người nhận (thả xuống: Sự kiện xanh lá / Truyền thông xanh dương)
 *   G Ngày sinh người nhận | H Nội dung lời chúc
 *
 * CÀI ĐẶT:
 * 1. Mở Google Sheets mới -> Tiện ích mở rộng (Extensions) -> Apps Script.
 * 2. Xóa code mặc định, dán toàn bộ file này vào, bấm Lưu (Ctrl + S).
 * 3. Triển khai (Deploy) -> Tùy chọn triển khai mới -> loại "Ứng dụng web":
 *      Thực thi dưới dạng: Tôi | Ai có quyền truy cập: Bất kỳ ai.
 * 4. Dán "URL ứng dụng web" (đuôi /exec) vào Cổng Quản Trị trên website.
 *
 * ĐÃ DEPLOY TỪ TRƯỚC? Dán code mới -> Triển khai -> Quản lý bản triển khai ->
 * bấm biểu tượng bút chì -> Phiên bản: "Phiên bản mới" -> Triển khai.
 * (URL giữ nguyên, không cần dán lại vào website.)
 * ============================================================================
 */

const ADMIN_API_KEY = "eventuit2026";
const SHEET_NAME = "Lời Chúc";
const HEADERS = [
  "Thời Gian Gửi",
  "MSSV Người Gửi",
  "Họ Tên Người Gửi",
  "MSSV Người Nhận",
  "Họ Tên Người Nhận",
  "Phân Ban Người Nhận",
  "Ngày Sinh Người Nhận",
  "Nội Dung Lời Chúc"
];
const DEPT_LIST = ["Sự kiện", "Truyền thông"];
const MAX_ROWS = 1000;

// Tạo (hoặc dựng lại) sheet đúng định dạng. Có thể chạy tay hàm này 1 lần để kiểm tra.
function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);

  // Sheet cũ (bố cục cũ có cột "Trạng Thái Đăng Post") -> đổi tên giữ lại, tạo sheet mới
  if (sheet) {
    const first = sheet.getRange(1, 1, 1, 2).getValues()[0];
    if (first[0] !== HEADERS[0] || first[1] !== HEADERS[1]) {
      sheet.setName(SHEET_NAME + " (cũ " + Utilities.formatDate(new Date(), "Asia/Ho_Chi_Minh", "dd-MM-yyyy HH.mm") + ")");
      sheet = null;
    }
  }
  if (sheet) return sheet;

  sheet = ss.insertSheet(SHEET_NAME);
  sheet.appendRow(HEADERS);

  const headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
  headerRange.setBackground("#E8FF3B").setFontColor("#18181B").setFontWeight("bold")
    .setHorizontalAlignment("center").setVerticalAlignment("middle").setWrap(true);
  sheet.setRowHeight(1, 38);
  sheet.setFrozenRows(1);

  [160, 120, 180, 120, 180, 150, 150, 450].forEach((w, i) => sheet.setColumnWidth(i + 1, w));

  // MSSV + ngày sinh lưu dạng văn bản (giữ nguyên số 0, không bị đổi thành ngày)
  sheet.getRange(2, 2, MAX_ROWS, 1).setNumberFormat("@");
  sheet.getRange(2, 4, MAX_ROWS, 1).setNumberFormat("@");
  sheet.getRange(2, 7, MAX_ROWS, 1).setNumberFormat("@");
  sheet.getRange(2, 8, MAX_ROWS, 1).setWrap(true);
  sheet.getRange(2, 1, MAX_ROWS, HEADERS.length).setVerticalAlignment("middle");

  // Cột F: danh sách thả xuống
  const deptRange = sheet.getRange(2, 6, MAX_ROWS, 1);
  deptRange.setDataValidation(
    SpreadsheetApp.newDataValidation().requireValueInList(DEPT_LIST, true).setAllowInvalid(true).build()
  );
  deptRange.setFontWeight("bold").setHorizontalAlignment("center");

  // Tô màu: Sự kiện = xanh lá, Truyền thông = xanh dương
  sheet.setConditionalFormatRules([
    SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo(DEPT_LIST[0])
      .setBackground("#DCFCE7").setFontColor("#14532D").setRanges([deptRange]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo(DEPT_LIST[1])
      .setBackground("#E0F2FE").setFontColor("#075985").setRanges([deptRange]).build()
  ]);

  return sheet;
}

function doPost(e) {
  try {
    const sheet = getOrCreateSheet();

    let data;
    if (e.postData && e.postData.contents) {
      try { data = JSON.parse(e.postData.contents); } catch (err) { data = e.parameter; }
    } else {
      data = e.parameter;
    }

    const timestamp = data.timestamp || Utilities.formatDate(new Date(), "Asia/Ho_Chi_Minh", "dd/MM/yyyy HH:mm:ss");
    const senderMssv = String(data.sender_mssv || "");
    const senderName = data.sender_name || "";
    const receiverMssv = String(data.receiver_mssv || "");
    const receiverName = data.receiver_name || "";
    const receiverDept = data.receiver_dept || "";
    const receiverBirthday = String(data.receiver_birthday || "");
    const wishContent = data.wish_content || "";

    if (!wishContent || !receiverMssv) {
      return json({ status: "error", message: "Thiếu thông tin người nhận hoặc nội dung lời chúc" });
    }

    // Ghi ngay dưới dòng cuối có dữ liệu (cột A) để không lệch vùng đã định dạng sẵn
    const row = Math.max(sheet.getLastRow(), 1) + 1;
    sheet.getRange(row, 1, 1, HEADERS.length).setValues([[
      timestamp, senderMssv, senderName, receiverMssv, receiverName, receiverDept, receiverBirthday, wishContent
    ]]);

    return json({ status: "success", message: "Lời chúc đã được lưu vào Google Sheet!", row: row });
  } catch (error) {
    return json({ status: "error", message: error.toString() });
  }
}

function doGet(e) {
  const params = e ? e.parameter : {};

  if (params && params.action === "get_wishes" && params.key === ADMIN_API_KEY) {
    try {
      const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
      if (!sheet) return json({ status: "success", wishes: [] });

      const values = sheet.getDataRange().getValues();
      const wishes = [];
      for (let i = 1; i < values.length; i++) {
        const r = values[i];
        if (!r[7]) continue;
        wishes.push({
          id: i,
          timestamp: r[0],
          sender_mssv: String(r[1]),
          sender_name: r[2],
          receiver_mssv: String(r[3]),
          receiver_name: r[4],
          receiver_dept: r[5],
          receiver_birthday: String(r[6]),
          wish_content: r[7]
        });
      }
      return json({ status: "success", wishes: wishes });
    } catch (err) {
      return json({ status: "error", message: err.toString() });
    }
  }

  return json({
    status: "active",
    club: "ĐỘI EVENT - TRƯỜNG ĐH CÔNG NGHỆ THÔNG TIN (UIT)",
    service: "Hệ thống Tiếp Nhận Lời Chúc Sinh Nhật Thành Viên",
    time: new Date().toISOString()
  });
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
