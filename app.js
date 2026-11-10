/**
 * ============================================================================
 * APP.JS - HỆ THỐNG BỐC THĂM LỜI CHÚC SINH NHẬT - ĐỘI EVENT UIT
 * Bản quyền: Đội Event - Trường ĐH Công nghệ Thông tin (ĐHQG-HCM)
 * ============================================================================
 */

// STATE MANAGEMENT
const AppState = {
    members: [],
    currentSender: null,
    currentTarget: null,
    wishes: [],
    soundEnabled: true,
    adminPin: 'eventuit2026',
    googleScriptUrl: '',
    pairingMode: 'random', // 'random' hoặc 'secret_santa'
};

// STORAGE KEYS
const STORAGE_KEYS = {
    MEMBERS: 'EVENT_UIT_MEMBERS',
    WISHES: 'EVENT_UIT_WISHES_DB',
    ADMIN_PIN: 'EVENT_UIT_ADMIN_PIN',
    GOOGLE_URL: 'EVENT_UIT_GOOGLE_URL',
    SOUND: 'EVENT_UIT_SOUND_ENABLED',
    SAVED_PAIRS: 'EVENT_UIT_SAVED_PAIRS'
};

// ============================================================================
// WEB AUDIO SYNTHESIZER (ÂM THANH TƯƠI VUI KHÔNG CẦN TẢI FILE NGOÀI)
// ============================================================================
let audioCtx = null;

function getAudioContext() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    return audioCtx;
}

function playSound(type) {
    if (!AppState.soundEnabled) return;
    try {
        const ctx = getAudioContext();
        const now = ctx.currentTime;

        if (type === 'click') {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(440, now);
            osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);
            gain.gain.setValueAtTime(0.15, now);
            gain.gain.linearRampToValueAtTime(0.01, now + 0.08);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.08);
        } else if (type === 'tick') {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(520, now);
            gain.gain.setValueAtTime(0.08, now);
            gain.gain.linearRampToValueAtTime(0.001, now + 0.04);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.04);
        } else if (type === 'boom') {
            // Tiếng "bùm" pháo bông: nhiễu trắng giảm dần qua bộ lọc thấp
            const len = Math.floor(ctx.sampleRate * 0.28);
            const buf = ctx.createBuffer(1, len, ctx.sampleRate);
            const d = buf.getChannelData(0);
            for (let k = 0; k < len; k++) d[k] = (Math.random() * 2 - 1) * Math.pow(1 - k / len, 3);
            const src = ctx.createBufferSource();
            const filt = ctx.createBiquadFilter();
            const gain = ctx.createGain();
            src.buffer = buf;
            filt.type = 'lowpass';
            filt.frequency.value = 900;
            gain.gain.value = 0.3;
            src.connect(filt);
            filt.connect(gain);
            gain.connect(ctx.destination);
            src.start(now);
        } else if (type === 'fanfare') {
            // Chuỗi âm thanh chúc mừng ngọt ngào
            const notes = [
                { f: 523.25, t: 0, d: 0.12 },     // C5
                { f: 659.25, t: 0.10, d: 0.12 },    // E5
                { f: 783.99, t: 0.20, d: 0.15 },    // G5
                { f: 1046.50, t: 0.35, d: 0.40 }   // C6
            ];
            notes.forEach(n => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(n.f, now + n.t);
                gain.gain.setValueAtTime(0.2, now + n.t);
                gain.gain.exponentialRampToValueAtTime(0.001, now + n.t + n.d);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now + n.t);
                osc.stop(now + n.t + n.d);
            });
        }
    } catch (e) {
        console.warn('Audio play error:', e);
    }
}

// ============================================================================
// KHỞI TẠO ỨNG DỤNG
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
    initAppState();
    initEventListeners();
    setupCanvasConfetti();
    renderMemberListTable();
    updateDashboardStats();
});

function initAppState() {
    // 1. Tải danh sách thành viên
    AppState.members = getMemberList();

    // 2. Tải lời chúc đã lưu
    try {
        const storedWishes = localStorage.getItem(STORAGE_KEYS.WISHES);
        AppState.wishes = storedWishes ? JSON.parse(storedWishes) : [];
    } catch (e) {
        AppState.wishes = [];
    }

    // 3. Tải cài đặt admin
    const storedPin = localStorage.getItem(STORAGE_KEYS.ADMIN_PIN);
    if (storedPin) AppState.adminPin = storedPin;

    const storedGoogleUrl = localStorage.getItem(STORAGE_KEYS.GOOGLE_URL);
    if (storedGoogleUrl) {
        AppState.googleScriptUrl = storedGoogleUrl;
        const inputUrl = document.getElementById('settingGoogleUrl');
        if (inputUrl) inputUrl.value = storedGoogleUrl;
    }

    const storedSound = localStorage.getItem(STORAGE_KEYS.SOUND);
    if (storedSound !== null) {
        AppState.soundEnabled = storedSound === 'true';
        updateSoundButtonUI();
    }
}

// ============================================================================
// EVENT LISTENERS & ĐIỀU HƯỚNG GIAO DIỆN
// ============================================================================
function initEventListeners() {
    // Input MSSV bản thân
    const senderMssvInput = document.getElementById('senderMssvInput');
    if (senderMssvInput) {
        senderMssvInput.addEventListener('input', handleSenderMssvInput);
        senderMssvInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const btn = document.getElementById('btnStartRandom');
                if (btn && !btn.disabled) btn.click();
            }
        });
    }

    // Nút Bắt đầu Bốc Thăm
    const btnStartRandom = document.getElementById('btnStartRandom');
    if (btnStartRandom) {
        btnStartRandom.addEventListener('click', handleStartRandomMatching);
    }

    // Đếm số từ lời chúc (không giới hạn số chữ)
    const wishContentInput = document.getElementById('wishContentInput');
    if (wishContentInput) {
        wishContentInput.addEventListener('input', updateWordCount);
    }

    // Nút Gửi Lời Chúc
    const btnSubmitWish = document.getElementById('btnSubmitWish');
    if (btnSubmitWish) {
        btnSubmitWish.addEventListener('click', handleSubmitWish);
    }

    // Nút Gửi lời chúc khác / Quay lại từ màn hình thành công
    const btnSendAnother = document.getElementById('btnSendAnother');
    if (btnSendAnother) {
        btnSendAnother.addEventListener('click', handleResetForNextWish);
    }

    // Nút Bật/Tắt Âm thanh
    const btnToggleSound = document.getElementById('btnToggleSound');
    if (btnToggleSound) {
        btnToggleSound.addEventListener('click', () => {
            AppState.soundEnabled = !AppState.soundEnabled;
            localStorage.setItem(STORAGE_KEYS.SOUND, AppState.soundEnabled);
            updateSoundButtonUI();
            if (AppState.soundEnabled) playSound('click');
        });
    }

    // Mở Portal Quản Trị Viên
    const btnOpenAdmin = document.getElementById('btnOpenAdmin');
    if (btnOpenAdmin) {
        btnOpenAdmin.addEventListener('click', () => {
            playSound('click');
            openAdminModal();
        });
    }

    // Phím tắt bí mật mở Admin: Ctrl + Shift + A
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
            e.preventDefault();
            openAdminModal();
        }
    });

    // Đóng Modal Admin
    const btnCloseAdmin = document.getElementById('btnCloseAdmin');
    if (btnCloseAdmin) {
        btnCloseAdmin.addEventListener('click', closeAdminModal);
    }

    // Xác thực PIN Admin
    const btnVerifyPin = document.getElementById('btnVerifyPin');
    if (btnVerifyPin) {
        btnVerifyPin.addEventListener('click', handleAdminPinVerification);
    }
    const adminPinInput = document.getElementById('adminPinInput');
    if (adminPinInput) {
        adminPinInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleAdminPinVerification();
        });
    }

    // Admin Tabs
    document.querySelectorAll('.admin-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            playSound('click');
            const tabId = btn.getAttribute('data-tab');
            switchAdminTab(tabId);
        });
    });

    // Admin Tìm kiếm & Lọc Lời Chúc
    const adminSearchInput = document.getElementById('adminSearchInput');
    if (adminSearchInput) {
        adminSearchInput.addEventListener('input', renderAdminWishesTable);
    }
    const adminStatusFilter = document.getElementById('adminStatusFilter');
    if (adminStatusFilter) {
        adminStatusFilter.addEventListener('change', renderAdminWishesTable);
    }

    // Admin Nút Xuất Excel (CSV UTF-8)
    const btnExportCsv = document.getElementById('btnExportCsv');
    if (btnExportCsv) {
        btnExportCsv.addEventListener('click', exportWishesToCsv);
    }

    // Admin Lưu Cài Đặt Google URL
    const btnSaveGoogleUrl = document.getElementById('btnSaveGoogleUrl');
    if (btnSaveGoogleUrl) {
        btnSaveGoogleUrl.addEventListener('click', handleSaveGoogleUrl);
    }

    // Admin Test Kết nối Google URL
    const btnTestGoogleUrl = document.getElementById('btnTestGoogleUrl');
    if (btnTestGoogleUrl) {
        btnTestGoogleUrl.addEventListener('click', handleTestGoogleConnection);
    }

    // Admin Đổi mã PIN
    const btnChangePin = document.getElementById('btnChangePin');
    if (btnChangePin) {
        btnChangePin.addEventListener('click', handleChangeAdminPin);
    }

    // Admin Thêm Thành Viên Mới
    const btnAddMember = document.getElementById('btnAddMember');
    if (btnAddMember) {
        btnAddMember.addEventListener('click', handleAddNewMember);
    }

    // Admin Khôi Phục Danh Sách Mặc Định
    const btnResetDefaultMembers = document.getElementById('btnResetDefaultMembers');
    if (btnResetDefaultMembers) {
        btnResetDefaultMembers.addEventListener('click', handleResetDefaultMembers);
    }
}

// Cập nhật giao diện nút âm thanh
function updateSoundButtonUI() {
    const btn = document.getElementById('btnToggleSound');
    if (!btn) return;
    if (AppState.soundEnabled) {
        btn.innerHTML = '<i class="fa-solid fa-volume-high"></i> <span class="hidden sm:inline">Âm thanh: BẬT</span>';
        btn.classList.add('bg-lemon', 'border-black');
    } else {
        btn.innerHTML = '<i class="fa-solid fa-volume-xmark"></i> <span class="hidden sm:inline">Âm thanh: TẮT</span>';
        btn.classList.remove('bg-lemon');
    }
}

// ============================================================================
// BƯỚC 1: XỬ LÝ NHẬP MSSV BẢN THÂN
// ============================================================================
function handleSenderMssvInput(e) {
    const rawVal = e.target.value.trim();
    const feedbackBox = document.getElementById('senderFeedbackBox');
    const btnStart = document.getElementById('btnStartRandom');

    if (rawVal.length === 0) {
        feedbackBox.classList.add('hidden');
        btnStart.disabled = true;
        AppState.currentSender = null;
        return;
    }

    // Tìm thành viên theo MSSV (hỗ trợ nhập 8 số)
    const found = AppState.members.find(m => m.mssv === rawVal);

    if (found) {
        // KIỂM TRA QUY ĐỊNH: MỖI THÀNH VIÊN CHỈ GỬI LỜI CHÚC CHO 1 NGƯỜI DUY NHẤT
        const existingWish = AppState.wishes.find(w => w.sender_mssv === found.mssv);
        if (existingWish) {
            AppState.currentSender = null;
            btnStart.disabled = true;
            feedbackBox.classList.remove('hidden');
            feedbackBox.innerHTML = `
                <div class="p-4 bg-amber-50 border-2 border-amber-500 rounded-xl text-amber-950 text-sm animate-card-pop shadow-sm">
                    <div class="flex items-center gap-2 font-black text-amber-900 mb-1">
                        <i class="fa-solid fa-circle-check text-emerald-600 text-base"></i>
                        <span>BẠN ĐÃ GỬI LỜI CHÚC RỒI!</span>
                    </div>
                    <div class="text-xs text-zinc-700 mb-2">
                        Chào <strong>${found.name}</strong>, bạn đã hoàn thành gửi lời chúc sinh nhật cho <strong>${existingWish.receiver_name}</strong> (${existingWish.receiver_mssv}) rồi nè!
                    </div>
                    <div class="text-xs bg-white p-2.5 rounded-lg border border-amber-300 italic text-zinc-800">
                        "${existingWish.wish_content}"
                    </div>
                    <div class="text-[11px] text-zinc-500 mt-2 font-semibold">
                        (Mỗi thành viên chỉ bốc thăm và gửi lời chúc cho 1 người để BĐH tổng hợp đăng bài 💛)
                    </div>
                </div>
            `;
            return;
        }

        AppState.currentSender = found;
        btnStart.disabled = false;
        feedbackBox.classList.remove('hidden');
        feedbackBox.innerHTML = `
            <div class="p-3 bg-emerald-50 border-2 border-emerald-600 rounded-xl flex items-center justify-between animate-card-pop">
                <div class="flex items-center gap-2">
                    <span class="text-xl">👋</span>
                    <div>
                        <div class="text-xs font-semibold text-emerald-800 uppercase tracking-wider">Đã nhận diện thành viên</div>
                        <div class="font-bold text-emerald-950 text-base">${found.name}</div>
                    </div>
                </div>
                <span class="${found.dept === 'Sự kiện' ? 'badge-dept-event' : 'badge-dept-media'}">
                    ${found.dept}
                </span>
            </div>
        `;
        playSound('click');
    } else if (rawVal.length >= 8) {
        AppState.currentSender = null;
        btnStart.disabled = true;
        feedbackBox.classList.remove('hidden');
        feedbackBox.innerHTML = `
            <div class="p-3 bg-rose-50 border-2 border-rose-500 rounded-xl text-rose-800 text-sm flex items-start gap-2">
                <i class="fa-solid fa-circle-exclamation text-rose-600 mt-0.5"></i>
                <div>
                    <strong>Chưa tìm thấy MSSV "${rawVal}"</strong> trong danh sách Đội Event 2026. 
                    <div class="text-xs text-rose-700 mt-1">Vui lòng kiểm tra lại 8 số MSSV hoặc liên hệ BĐH Đội Event để cập nhật danh sách nhé!</div>
                </div>
            </div>
        `;
    } else {
        feedbackBox.classList.add('hidden');
        btnStart.disabled = true;
        AppState.currentSender = null;
    }
}

// ============================================================================
// BƯỚC 2: BỐC THĂM NGẪU NHIÊN ĐỒNG ĐỘI CẦN CHÚC
// ============================================================================
function handleStartRandomMatching() {
    if (!AppState.currentSender) return;
    playSound('click');

    // Lọc danh sách: BẮT BUỘC KHÔNG ĐƯỢC LÀ CHÍNH MÌNH
    const validCandidates = AppState.members.filter(m => m.mssv !== AppState.currentSender.mssv);

    if (validCandidates.length === 0) {
        alert('Danh sách thành viên không đủ để bốc thăm!');
        return;
    }

    // XÁC ĐỊNH MỤC TIÊU CỐ ĐỊNH (1 người duy nhất, không trùng lặp)
    let savedPairs = {};
    try {
        savedPairs = JSON.parse(localStorage.getItem(STORAGE_KEYS.SAVED_PAIRS) || '{}');
    } catch (e) {}

    let finalTarget = null;
    if (savedPairs[AppState.currentSender.mssv]) {
        const pairedMssv = savedPairs[AppState.currentSender.mssv];
        finalTarget = AppState.members.find(m => m.mssv === pairedMssv && m.mssv !== AppState.currentSender.mssv);
    }

    if (!finalTarget) {
        // Ưu tiên các bạn chưa nhận được lời chúc nào để ai cũng có lời chúc sinh nhật
        const receivedMssvs = new Set(AppState.wishes.map(w => w.receiver_mssv));
        const notYetReceived = validCandidates.filter(c => !receivedMssvs.has(c.mssv));
        const candidatePool = notYetReceived.length > 0 ? notYetReceived : validCandidates;

        finalTarget = candidatePool[Math.floor(Math.random() * candidatePool.length)];
        savedPairs[AppState.currentSender.mssv] = finalTarget.mssv;
        localStorage.setItem(STORAGE_KEYS.SAVED_PAIRS, JSON.stringify(savedPairs));
    }

    AppState.currentTarget = finalTarget;

    showGiftBox(finalTarget);
}

// ============================================================================
// HỘP QUÀ BÍ ẨN: lắc -> mở nắp -> thẻ tên bật ra -> pháo bông & đồ búng ra
// ============================================================================
const REDUCED_MOTION = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let giftTimers = [];
let giftCountdown = null;
const GIFT_AUTO_OPEN_MS = 1500;   // chờ trước khi hộp tự mở
const GIFT_AUTO_NEXT_SEC = 7;     // sau khi mở xong, tự chuyển sang trang lời chúc

function showGiftBox(target) {
    document.getElementById('stepInputMssv').classList.add('hidden');
    const step = document.getElementById('stepShuffleTarget');
    step.classList.remove('hidden');
    step.classList.remove('animate-card-pop');
    void step.offsetWidth; // chạy lại animation
    step.classList.add('animate-card-pop');

    const box = document.getElementById('giftBox');
    const reveal = document.getElementById('giftReveal');

    // Reset trạng thái (cho trường hợp bốc lại)
    box.className = 'gift-box';
    box.dataset.opened = '0';
    reveal.classList.remove('is-revealed');
    document.getElementById('giftTitle').innerText = 'HỘP QUÀ BÍ ẨN SẮP MỞ RA... 🤫';
    document.getElementById('giftFootnote').innerText = 'Bí mật đang nằm trong hộp... ✨';
    document.getElementById('giftFootnote').classList.remove('hidden');

    // Điền sẵn thông tin người nhận (đang ẩn trong hộp)
    document.getElementById('giftRevealName').innerText = target.name;
    document.getElementById('giftRevealMssv').innerText = `MSSV: ${target.mssv}`;
    const deptEl = document.getElementById('giftRevealDept');
    deptEl.innerText = `Ban ${target.dept}`;
    deptEl.className = target.dept === 'Sự kiện' ? 'badge-dept-event' : 'badge-dept-media';

    box.onclick = null;
    box.style.cursor = 'default';

    // Dọn bộ hẹn giờ cũ (nếu bốc lại)
    giftTimers.forEach(clearTimeout);
    giftTimers = [];
    clearInterval(giftCountdown);

    step.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Hộp lắc nhẹ một lúc rồi TỰ ĐỘNG mở
    giftTimers.push(setTimeout(() => openGiftBox(target), GIFT_AUTO_OPEN_MS));
}

function openGiftBox(target) {
    const box = document.getElementById('giftBox');
    if (box.dataset.opened === '1') return;
    box.dataset.opened = '1';

    const reveal = document.getElementById('giftReveal');
    const title = document.getElementById('giftTitle');
    const footnote = document.getElementById('giftFootnote');

    // 1) Hộp rung lắc hồi hộp
    playSound('tick');
    box.classList.add('is-shaking');
    title.innerText = 'ÚI, CÓ GÌ TRONG ĐÂY NHỈ... 🤫';
    footnote.innerText = '';

    setTimeout(() => {
        // 2) Bung nắp
        box.classList.remove('is-shaking');
        box.classList.add('is-open');
        document.getElementById('giftFlash').classList.add('go');
        playSound('fanfare');
        playSound('boom');

        const r = box.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height * 0.3;

        // 3) Pháo bông nổ ngay tại hộp + pháo giấy + đồ bay ra
        fxFireworkBurst(cx, cy, 70);
        fxConfettiBurst(cx, cy, REDUCED_MOTION ? 40 : 110);
        popEmojis(cx, cy);

        // 4) Thẻ tên bật ra khỏi hộp
        setTimeout(() => {
            reveal.classList.add('is-revealed');
            title.innerText = 'ĐÂY RỒI! 🎉';
        }, 220);

        // 5) Pháo bông bắn lên trời liên tiếp
        if (!REDUCED_MOTION) {
            [450, 800, 1150, 1500].forEach((delay, idx) => {
                setTimeout(() => {
                    const W = window.innerWidth, H = window.innerHeight;
                    const x = W * (idx % 2 === 0 ? 0.15 + Math.random() * 0.3 : 0.55 + Math.random() * 0.3);
                    fxRocket(x, H * (0.12 + Math.random() * 0.3));
                }, delay);
            });
        }

        // 6) Đếm ngược rồi tự chuyển sang trang viết lời chúc
        let left = GIFT_AUTO_NEXT_SEC;
        const tick = () => {
            footnote.innerText = `Tự động chuyển sang viết lời chúc sau ${left}s... 💌`;
        };
        tick();
        clearInterval(giftCountdown);
        giftCountdown = setInterval(() => { left--; if (left > 0) tick(); }, 1000);
        giftTimers.push(setTimeout(() => {
            clearInterval(giftCountdown);
            const stepEl = document.getElementById('stepShuffleTarget');
            // Chỉ chuyển nếu người dùng vẫn đang ở màn hình hộp quà này
            if (!stepEl.classList.contains('hidden') && AppState.currentTarget === target) {
                finishMatching(target);
            }
        }, GIFT_AUTO_NEXT_SEC * 1000));
    }, REDUCED_MOTION ? 100 : 750);
}

// Đồ vật "búng" ra khỏi hộp theo đường vòng cung
function popEmojis(cx, cy) {
    const items = ['🎉', '🎊', '🎈', '🎂', '💛', '✨', '⭐', '🍋', '🎁', '🎀', '🥳', '🎶'];
    const total = REDUCED_MOTION ? 6 : 22;
    for (let i = 0; i < total; i++) {
        const el = document.createElement('span');
        el.textContent = items[Math.floor(Math.random() * items.length)];
        el.style.cssText = `position:fixed;left:${cx}px;top:${cy}px;font-size:${22 + Math.random() * 22}px;` +
            'pointer-events:none;z-index:9998;will-change:transform,opacity;line-height:1;';
        document.body.appendChild(el);

        const dx = (Math.random() - 0.5) * Math.min(window.innerWidth * 0.9, 640);
        const up = 140 + Math.random() * 260;
        const fall = 40 + Math.random() * 160;
        const rot = (Math.random() - 0.5) * 720;
        const anim = el.animate([
            { transform: 'translate(-50%,-50%) scale(0.2) rotate(0deg)', opacity: 1 },
            { transform: `translate(calc(-50% + ${dx * 0.6}px), calc(-50% - ${up}px)) scale(1.15) rotate(${rot * 0.5}deg)`, opacity: 1, offset: 0.45 },
            { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${fall}px)) scale(0.9) rotate(${rot}deg)`, opacity: 0 }
        ], { duration: 1300 + Math.random() * 900, easing: 'cubic-bezier(.2,.7,.4,1)', delay: Math.random() * 120, fill: 'forwards' });
        anim.onfinish = () => el.remove();
    }
}

// ----------------------------------------------------------------------------
// ENGINE PHÁO BÔNG + PHÁO GIẤY (vẽ trên #confettiCanvas)
// ----------------------------------------------------------------------------
// Màu pháo bông chọn đậm để nổi bật trên nền vàng chanh
const FX_COLORS = ['#F43F5E', '#0EA5E9', '#8B5CF6', '#16A34A', '#F97316', '#EC4899', '#18181B'];
let fxParticles = [];
let fxAnimId = null;

function fxStart() {
    if (!confettiCanvas || !confettiCtx) return;
    if (!fxAnimId) fxAnimId = requestAnimationFrame(fxFrame);
}

function fxRocket(x, targetY) {
    fxParticles.push({ t: 'rocket', x, y: window.innerHeight + 10, ty: targetY, speed: 17 });
    fxStart();
}

function fxFireworkBurst(x, y, count = 64) {
    const main = FX_COLORS[Math.floor(Math.random() * (FX_COLORS.length - 1))];
    const alt = FX_COLORS[Math.floor(Math.random() * (FX_COLORS.length - 1))];
    for (let i = 0; i < count; i++) {
        const ang = (i / count) * Math.PI * 2 + Math.random() * 0.12;
        const sp = i % 2 === 0 ? 6.5 + Math.random() * 0.6 : 3 + Math.random() * 3.5;
        const life = 55 + Math.random() * 35;
        fxParticles.push({
            t: 'spark', x, y, px: x, py: y,
            vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp,
            color: i % 3 === 0 ? alt : main, life, max: life
        });
    }
    fxStart();
}

function fxConfettiBurst(x, y, n = 100) {
    for (let i = 0; i < n; i++) {
        const ang = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.95;
        const sp = 8 + Math.random() * 11;
        const life = 110 + Math.random() * 70;
        fxParticles.push({
            t: 'confetti', x, y,
            vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp,
            w: 6 + Math.random() * 8, h: 4 + Math.random() * 6,
            rot: Math.random() * 360, rs: (Math.random() - 0.5) * 16,
            color: ['#F7FE45', '#FACC15', '#22C55E', '#1B5E20', '#0EA5E9', '#F43F5E', '#FFFFFF'][Math.floor(Math.random() * 7)],
            life, max: life
        });
    }
    fxStart();
}

function fxFrame() {
    const ctx = confettiCtx;
    const W = confettiCanvas.width, H = confettiCanvas.height;
    ctx.clearRect(0, 0, W, H);
    ctx.lineCap = 'round';
    const next = [];

    for (const p of fxParticles) {
        if (p.t === 'rocket') {
            p.y -= p.speed;
            p.speed = Math.max(5, p.speed * 0.985);
            if (p.y <= p.ty) {
                playSound('boom');
                fxFireworkBurst(p.x, p.y, 72);
                continue;
            }
            ctx.globalAlpha = 1;
            ctx.strokeStyle = '#F59E0B';
            ctx.lineWidth = 3.5;
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x, p.y + 22); ctx.stroke();
            ctx.fillStyle = '#18181B';
            ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI * 2); ctx.fill();
            next.push(p);
        } else if (p.t === 'spark') {
            p.px = p.x; p.py = p.y;
            p.x += p.vx; p.y += p.vy;
            p.vx *= 0.965; p.vy = p.vy * 0.965 + 0.07;
            p.life--;
            if (p.life <= 0) continue;
            const alpha = Math.min(1, p.life / (p.max * 0.6));
            ctx.globalAlpha = alpha;
            ctx.strokeStyle = p.color;
            ctx.lineWidth = 3;
            ctx.beginPath(); ctx.moveTo(p.px, p.py); ctx.lineTo(p.x, p.y); ctx.stroke();
            ctx.fillStyle = p.color;
            ctx.beginPath(); ctx.arc(p.x, p.y, 2.2, 0, Math.PI * 2); ctx.fill();
            next.push(p);
        } else {
            p.x += p.vx; p.y += p.vy;
            p.vx *= 0.985; p.vy = p.vy * 0.985 + 0.32;
            p.rot += p.rs;
            p.life--;
            if (p.life <= 0 || p.y > H + 20) continue;
            ctx.save();
            ctx.globalAlpha = Math.min(1, p.life / (p.max * 0.4));
            ctx.translate(p.x, p.y);
            ctx.rotate((p.rot * Math.PI) / 180);
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
            ctx.strokeStyle = 'rgba(24,24,27,0.55)';
            ctx.lineWidth = 1;
            ctx.strokeRect(-p.w / 2, -p.h / 2, p.w, p.h);
            ctx.restore();
            next.push(p);
        }
    }

    ctx.globalAlpha = 1;
    fxParticles = next;
    if (fxParticles.length) {
        fxAnimId = requestAnimationFrame(fxFrame);
    } else {
        fxAnimId = null;
        ctx.clearRect(0, 0, W, H);
    }
}

function finishMatching(target) {
    // Chuyển sang Bước 3: Hiện thẻ người nhận và Khung nhập lời chúc
    document.getElementById('stepShuffleTarget').classList.add('hidden');
    renderWishWritingStep(target);
}

// Hiển thị bước viết lời chúc
function renderWishWritingStep(target) {
    const stepWish = document.getElementById('stepWriteWish');
    stepWish.classList.remove('hidden');
    stepWish.classList.add('animate-card-pop');

    // Đổ thông tin người nhận vào thẻ
    document.getElementById('targetName').innerText = target.name;
    document.getElementById('targetMssv').innerText = target.mssv;
    
    const targetDeptBadge = document.getElementById('targetDeptBadge');
    targetDeptBadge.innerText = `Ban ${target.dept}`;
    targetDeptBadge.className = target.dept === 'Sự kiện' ? 'badge-dept-event' : 'badge-dept-media';

    // Tạo avatar chữ cái
    const initials = target.name.split(' ').map(w => w[0]).slice(-2).join('');
    document.getElementById('targetAvatarText').innerText = initials;

    // Hiển thị tên người gửi (công khai tên thật, không ẩn danh)
    const senderRealNameEl = document.getElementById('senderRealNameDisplay');
    if (senderRealNameEl && AppState.currentSender) {
        senderRealNameEl.innerText = AppState.currentSender.name;
    }

    // Reset khung nhập
    const wishInput = document.getElementById('wishContentInput');
    wishInput.value = '';
    updateWordCount();
    wishInput.focus();

    // Scroll nhẹ đến khu vực viết
    stepWish.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Đếm số từ / chữ (tách theo khoảng trắng)
function countWords(text) {
    if (!text) return 0;
    const trimmed = text.trim();
    if (!trimmed) return 0;
    return trimmed.split(/\s+/).filter(w => w.length > 0).length;
}

// Cập nhật số chữ (không giới hạn tối thiểu/tối đa, chỉ cần không để trống)
function updateWordCount() {
    const textarea = document.getElementById('wishContentInput');
    const badge = document.getElementById('wordCountBadge');
    const btn = document.getElementById('btnSubmitWish');
    if (!textarea) return;

    const wordCount = countWords(textarea.value);
    const hasContent = wordCount > 0;

    if (badge) {
        badge.innerHTML = `<strong>${wordCount} chữ</strong>`;
        badge.className = hasContent
            ? "text-xs font-bold font-mono px-2.5 py-1 rounded-lg border-2 border-emerald-600 bg-emerald-50 text-emerald-900 w-fit"
            : "text-xs font-bold font-mono px-2.5 py-1 rounded-lg border-2 border-amber-400 bg-amber-50 text-amber-900 w-fit";
    }

    if (btn) {
        btn.disabled = !hasContent;
    }
}

// ============================================================================
// BƯỚC 3: GỬI LỜI CHÚC & LƯU VÀO KHO DỮ LIỆU
// ============================================================================
async function handleSubmitWish() {
    const wishContent = document.getElementById('wishContentInput').value.trim();
    const wordCount = countWords(wishContent);

    if (wordCount === 0) {
        alert('Bạn chưa viết lời chúc nào cả. Hãy viết vài dòng gửi đồng đội nhé 💛');
        return;
    }

    // Kiểm tra lại quy định 1 thành viên chỉ gửi 1 lời chúc
    if (AppState.wishes.some(w => w.sender_mssv === AppState.currentSender.mssv)) {
        alert('Bạn đã gửi lời chúc cho một thành viên rồi! Mỗi bạn chỉ gửi 1 lời chúc duy nhất nhé.');
        return;
    }

    // Tên hiển thị luôn là tên thật của thành viên (không ẩn danh)
    const senderDisplay = AppState.currentSender.name;

    const newWish = {
        id: 'wish_' + Date.now(),
        timestamp: new Date().toLocaleString('vi-VN', {
            hour: '2-digit', minute: '2-digit', second: '2-digit',
            day: '2-digit', month: '2-digit', year: 'numeric'
        }),
        receiver_mssv: AppState.currentTarget.mssv,
        receiver_name: AppState.currentTarget.name,
        receiver_dept: AppState.currentTarget.dept,
        sender_mssv: AppState.currentSender.mssv,
        sender_name: AppState.currentSender.name,
        sender_display: senderDisplay,
        wish_content: wishContent,
        status: 'Chưa đăng post'
    };

    // 1. Lưu vào Database LocalStorage (Quản trị viên luôn truy xuất được)
    AppState.wishes.unshift(newWish);
    localStorage.setItem(STORAGE_KEYS.WISHES, JSON.stringify(AppState.wishes));

    // 2. Gửi đồng bộ lên Google Sheets (Nếu đã cấu hình URL Apps Script)
    if (AppState.googleScriptUrl) {
        sendWishToGoogleSheets(newWish);
    }

    // 3. Hiệu ứng ăn mừng rực rỡ
    playSound('fanfare');
    triggerCelebrationConfetti();

    // 4. Chuyển sang màn hình thành công
    document.getElementById('stepWriteWish').classList.add('hidden');
    renderSuccessStep(newWish);
}

// Gửi ngầm tới Google Apps Script Web App
function sendWishToGoogleSheets(wish) {
    try {
        const payload = {
            timestamp: wish.timestamp,
            receiver_mssv: wish.receiver_mssv,
            receiver_name: wish.receiver_name,
            receiver_dept: wish.receiver_dept,
            sender_mssv: wish.sender_mssv,
            sender_name: wish.sender_name,
            sender_display: wish.sender_display,
            wish_content: wish.wish_content,
            status: wish.status
        };

        // Gửi qua Fetch POST (mode no-cors để tránh chặn CORS từ trình duyệt)
        fetch(AppState.googleScriptUrl, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        }).then(() => {
            console.log('Đã gửi thành công lên Google Sheet!');
        }).catch(err => {
            console.warn('Gửi lên Google Sheet gặp lỗi (dữ liệu vẫn lưu an toàn trên máy):', err);
        });
    } catch (e) {
        console.warn('Lỗi gọi API Google Sheets:', e);
    }
}

// Màn hình hoàn tất
function renderSuccessStep(wish) {
    const stepSuccess = document.getElementById('stepSuccess');
    stepSuccess.classList.remove('hidden');
    stepSuccess.classList.add('animate-card-pop');

    document.getElementById('successReceiverName').innerText = wish.receiver_name;
    document.getElementById('successWishPreview').innerText = `"${wish.wish_content}"`;
    document.getElementById('successSenderPreview').innerText = `— Gửi bởi: ${wish.sender_display}`;

    stepSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
    updateDashboardStats();
}

// Bắt đầu lại
function handleResetForNextWish() {
    playSound('click');
    document.getElementById('stepSuccess').classList.add('hidden');
    document.getElementById('stepWriteWish').classList.add('hidden');
    document.getElementById('stepShuffleTarget').classList.add('hidden');
    
    const input = document.getElementById('senderMssvInput');
    input.value = '';
    AppState.currentSender = null;
    AppState.currentTarget = null;
    
    document.getElementById('senderFeedbackBox').classList.add('hidden');
    document.getElementById('btnStartRandom').disabled = true;

    document.getElementById('stepInputMssv').classList.remove('hidden');
    document.getElementById('stepInputMssv').classList.add('animate-card-pop');
    input.focus();
}

// ============================================================================
// QUẢN TRỊ VIÊN (ADMIN DASHBOARD) - BẢO MẬT BẰNG MÃ PIN
// ============================================================================
function openAdminModal() {
    const modal = document.getElementById('adminModal');
    modal.classList.remove('hidden');
    
    // Nếu chưa xác thực thì hiện khung nhập PIN
    if (!AppState.adminAuthenticated) {
        document.getElementById('adminAuthSection').classList.remove('hidden');
        document.getElementById('adminDashboardSection').classList.add('hidden');
        const pinInput = document.getElementById('adminPinInput');
        pinInput.value = '';
        pinInput.focus();
    } else {
        document.getElementById('adminAuthSection').classList.add('hidden');
        document.getElementById('adminDashboardSection').classList.remove('hidden');
        renderAdminWishesTable();
        updateDashboardStats();
    }
}

function closeAdminModal() {
    playSound('click');
    document.getElementById('adminModal').classList.add('hidden');
}

function handleAdminPinVerification() {
    const inputPin = document.getElementById('adminPinInput').value.trim();
    if (inputPin === AppState.adminPin) {
        playSound('fanfare');
        AppState.adminAuthenticated = true;
        document.getElementById('adminAuthSection').classList.add('hidden');
        document.getElementById('adminDashboardSection').classList.remove('hidden');
        renderAdminWishesTable();
        updateDashboardStats();
    } else {
        playSound('click');
        alert('Mã PIN quản trị viên không chính xác! Vui lòng thử lại.');
        document.getElementById('adminPinInput').value = '';
        document.getElementById('adminPinInput').focus();
    }
}

function switchAdminTab(tabId) {
    document.querySelectorAll('.admin-tab-btn').forEach(b => {
        if (b.getAttribute('data-tab') === tabId) {
            b.classList.add('bg-lemon', 'font-black', 'border-black');
            b.classList.remove('bg-white', 'font-semibold');
        } else {
            b.classList.remove('bg-lemon', 'font-black');
            b.classList.add('bg-white', 'font-semibold');
        }
    });

    document.querySelectorAll('.admin-tab-content').forEach(content => {
        if (content.id === `tabContent-${tabId}`) {
            content.classList.remove('hidden');
        } else {
            content.classList.add('hidden');
        }
    });

    if (tabId === 'wishes') {
        renderAdminWishesTable();
    } else if (tabId === 'members') {
        renderMemberListTable();
    }
}

// Hiển thị danh sách Lời chúc trong Dashboard
function renderAdminWishesTable() {
    const container = document.getElementById('adminWishesTableBody');
    if (!container) return;

    const searchTerm = (document.getElementById('adminSearchInput')?.value || '').toLowerCase().trim();
    const statusFilter = document.getElementById('adminStatusFilter')?.value || 'all';

    let filtered = AppState.wishes.filter(w => {
        const matchSearch = w.receiver_name.toLowerCase().includes(searchTerm) ||
                            w.receiver_mssv.includes(searchTerm) ||
                            w.sender_name.toLowerCase().includes(searchTerm) ||
                            w.wish_content.toLowerCase().includes(searchTerm);
        
        const matchStatus = statusFilter === 'all' || w.status === statusFilter;
        return matchSearch && matchStatus;
    });

    if (filtered.length === 0) {
        container.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-8 text-zinc-500 font-medium">
                    <div class="text-2xl mb-2">📬</div>
                    Chưa có lời chúc nào phù hợp với bộ lọc tìm kiếm.
                </td>
            </tr>
        `;
        return;
    }

    container.innerHTML = filtered.map((w, index) => {
        const isPosted = w.status === 'Đã đăng post';
        return `
            <tr class="border-b border-zinc-200 hover:bg-yellow-50/50 transition">
                <td class="p-3 text-xs text-zinc-500 whitespace-nowrap">${w.timestamp}</td>
                <td class="p-3">
                    <div class="font-bold text-zinc-900">${w.receiver_name}</div>
                    <div class="text-xs text-zinc-500">MSSV: ${w.receiver_mssv} (${w.receiver_dept})</div>
                </td>
                <td class="p-3">
                    <div class="font-semibold text-zinc-800">${w.sender_display}</div>
                    <div class="text-xs text-zinc-400">Thật: ${w.sender_name} (${w.sender_mssv})</div>
                </td>
                <td class="p-3">
                    <div class="text-sm text-zinc-800 max-w-xs break-words bg-yellow-50/80 p-2 rounded-lg border border-yellow-200">
                        "${w.wish_content}"
                    </div>
                </td>
                <td class="p-3 text-center">
                    <span class="inline-block px-2.5 py-1 text-xs font-bold rounded-full border ${
                        isPosted 
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-400' 
                        : 'bg-amber-100 text-amber-800 border-amber-400'
                    }">
                        ${w.status}
                    </span>
                </td>
                <td class="p-3 text-center">
                    <div class="flex items-center justify-center gap-1.5">
                        <button onclick="toggleWishStatus('${w.id}')" title="Đổi trạng thái đã đăng" class="p-1.5 px-2 bg-white hover:bg-zinc-100 border border-zinc-300 rounded text-xs font-bold">
                            <i class="fa-solid ${isPosted ? 'fa-rotate-left text-amber-600' : 'fa-check text-emerald-600'}"></i>
                        </button>
                        <button onclick="copyPostCaption('${w.id}')" title="Sao chép Caption đăng Fanpage" class="p-1.5 px-2 bg-lemon hover:bg-lemon-bright border border-black rounded text-xs font-bold">
                            <i class="fa-regular fa-copy"></i> Copy
                        </button>
                        <button onclick="deleteWish('${w.id}')" title="Xóa lời chúc này" class="p-1.5 px-2 bg-white hover:bg-rose-50 border border-rose-300 rounded text-xs text-rose-600">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// Cập nhật thống kê trên thanh Dashboard
function updateDashboardStats() {
    const totalWishes = AppState.wishes.length;
    const totalMembers = AppState.members.length;

    // Đếm số thành viên đã nhận được ít nhất 1 lời chúc
    const receiversSet = new Set(AppState.wishes.map(w => w.receiver_mssv));
    const receivedCount = receiversSet.size;
    const remainingCount = Math.max(0, totalMembers - receivedCount);

    const elTotal = document.getElementById('statTotalWishes');
    if (elTotal) elTotal.innerText = totalWishes;

    const elReceived = document.getElementById('statReceivedMembers');
    if (elReceived) elReceived.innerText = `${receivedCount}/${totalMembers}`;

    const elRemaining = document.getElementById('statRemainingMembers');
    if (elRemaining) elRemaining.innerText = remainingCount;
}

// Đổi trạng thái lời chúc (Đã đăng / Chưa đăng)
window.toggleWishStatus = function(wishId) {
    const item = AppState.wishes.find(w => w.id === wishId);
    if (!item) return;
    playSound('click');
    item.status = item.status === 'Đã đăng post' ? 'Chưa đăng post' : 'Đã đăng post';
    localStorage.setItem(STORAGE_KEYS.WISHES, JSON.stringify(AppState.wishes));
    renderAdminWishesTable();
};

// Xóa lời chúc
window.deleteWish = function(wishId) {
    if (!confirm('Bạn có chắc chắn muốn xóa lời chúc này không?')) return;
    playSound('click');
    AppState.wishes = AppState.wishes.filter(w => w.id !== wishId);
    localStorage.setItem(STORAGE_KEYS.WISHES, JSON.stringify(AppState.wishes));
    renderAdminWishesTable();
    updateDashboardStats();
};

// Tạo caption chuẩn Fanpage Đội Event - UIT và copy vào Clipboard
window.copyPostCaption = function(wishId) {
    const item = AppState.wishes.find(w => w.id === wishId);
    if (!item) return;

    const caption = `🎂 [HAPPY BIRTHDAY TO ${item.receiver_name.toUpperCase()} - ${item.receiver_dept.toUpperCase()}] 🎉\n\n` +
        `Ngày hôm nay là một ngày thật đặc biệt! Đại gia đình Đội Event - UIT xin gửi những lời chúc ấm áp và rực rỡ nhất đến bạn ${item.receiver_name} (${item.receiver_mssv})! 💛✨\n\n` +
        `💌 LỜI NHẮN NHỦ THÂN THƯƠNG TỪ ${item.sender_display.toUpperCase()}:\n` +
        `"${item.wish_content}"\n\n` +
        `Chúc bạn thêm một tuổi mới luôn tràn đầy năng lượng, hoàn thành xuất sắc mọi mục tiêu và luôn cháy hết mình cùng Đội Event nhé! 🔥💛\n\n` +
        `-----------------------------------------\n` +
        `ĐỘI SỰ KIỆN - TRƯỜNG ĐH CÔNG NGHỆ THÔNG TIN - ĐHQG-HCM\n` +
        `📍 Fanpage: Đội Event - UIT\n` +
        `#DoiEventUIT #EventUIT #HappyBirthday #SinhNhatThanhVien #TuoiTreEvent`;

    navigator.clipboard.writeText(caption).then(() => {
        playSound('click');
        alert(`✅ Đã sao chép Caption đăng bài cho ${item.receiver_name} vào Clipboard!\nBạn chỉ cần dán (Ctrl+V) vào bài viết trên Fanpage Facebook nhé!`);
    }).catch(err => {
        alert('Không thể tự động sao chép. Bạn hãy copy thủ công từ bảng nhé!');
    });
};

// ============================================================================
// XUẤT DỮ LIỆU EXCEL / CSV CHUẨN TIẾNG VIỆT UTF-8
// ============================================================================
function exportWishesToCsv() {
    if (AppState.wishes.length === 0) {
        alert('Chưa có lời chúc nào để xuất file!');
        return;
    }
    playSound('click');

    const headers = [
        "ID",
        "Thời Gian Gửi",
        "MSSV Người Nhận",
        "Họ Tên Người Nhận",
        "Phân Ban Người Nhận",
        "MSSV Người Gửi",
        "Họ Tên Người Gửi",
        "Tên Hiển Thị (Ẩn Danh)",
        "Nội Dung Lời Chúc",
        "Trạng Thái Đăng Post"
    ];

    const rows = AppState.wishes.map((w, index) => [
        index + 1,
        `"${w.timestamp}"`,
        `"\t${w.receiver_mssv}"`, // Thêm tab để Excel không biến số thành định dạng khoa học
        `"${w.receiver_name}"`,
        `"${w.receiver_dept}"`,
        `"\t${w.sender_mssv}"`,
        `"${w.sender_name}"`,
        `"${w.sender_display}"`,
        `"${w.wish_content.replace(/"/g, '""')}"`,
        `"${w.status}"`
    ]);

    // Thêm UTF-8 BOM (\uFEFF) để Excel hiển thị đúng tiếng Việt có dấu
    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(e => e.join(","))].join("\r\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `LOI_CHUC_SINH_NHAT_EVENT_UIT_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// ============================================================================
// CÀI ĐẶT & KẾT NỐI GOOGLE APPS SCRIPT WEBHOOK
// ============================================================================
function handleSaveGoogleUrl() {
    const url = document.getElementById('settingGoogleUrl').value.trim();
    AppState.googleScriptUrl = url;
    localStorage.setItem(STORAGE_KEYS.GOOGLE_URL, url);
    playSound('click');
    alert('✅ Đã lưu cấu hình Google Apps Script Web App thành công!');
}

async function handleTestGoogleConnection() {
    const url = document.getElementById('settingGoogleUrl').value.trim();
    if (!url) {
        alert('Vui lòng nhập URL Google Apps Script Web App trước khi kiểm tra!');
        return;
    }

    const testBtn = document.getElementById('btnTestGoogleUrl');
    const originalText = testBtn.innerHTML;
    testBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang test...';
    testBtn.disabled = true;

    try {
        const response = await fetch(url, { method: 'GET' });
        const data = await response.json();
        playSound('fanfare');
        alert(`🎉 KẾT NỐI GOOGLE SHEETS THÀNH CÔNG!\nPhản hồi từ Google: ${data.service || data.club || data.status}`);
    } catch (err) {
        playSound('click');
        alert(`⚠️ Không thể kết nối trực tiếp bằng GET (có thể do quyền Web App chưa mở 'Anyone' hoặc đang bị CORS). Bạn vẫn có thể thử gửi một lời chúc để kiểm tra việc ghi dữ liệu vào Sheet nhé!\n\nChi tiết: ${err.message}`);
    } finally {
        testBtn.innerHTML = originalText;
        testBtn.disabled = false;
    }
}

function handleChangeAdminPin() {
    const currentPin = prompt('Nhập mã PIN hiện tại:');
    if (currentPin !== AppState.adminPin) {
        alert('Mã PIN hiện tại không đúng!');
        return;
    }

    const newPin = prompt('Nhập mã PIN mới (ít nhất 4 ký tự):');
    if (!newPin || newPin.trim().length < 4) {
        alert('Mã PIN mới quá ngắn hoặc không hợp lệ!');
        return;
    }

    AppState.adminPin = newPin.trim();
    localStorage.setItem(STORAGE_KEYS.ADMIN_PIN, AppState.adminPin);
    playSound('fanfare');
    alert(`✅ Đã đổi mã PIN Admin thành công sang: ${AppState.adminPin}`);
}

// ============================================================================
// QUẢN LÝ DANH SÁCH THÀNH VIÊN TRONG DASHBOARD
// ============================================================================
function renderMemberListTable() {
    const tbody = document.getElementById('adminMemberListTableBody');
    if (!tbody) return;

    const n = AppState.members.length;
    const setCount = (id, v) => { const el = document.getElementById(id); if (el) el.innerText = v; };
    setCount('memberCountTab', n);
    setCount('memberCountCurrent', n);
    setCount('memberCountReset', DEFAULT_MEMBERS.length);

    tbody.innerHTML = AppState.members.map((m, idx) => `
        <tr class="border-b border-zinc-200 hover:bg-zinc-50">
            <td class="p-2 text-center text-xs text-zinc-400">${idx + 1}</td>
            <td class="p-2 font-mono font-bold text-sm text-zinc-900">${m.mssv}</td>
            <td class="p-2 font-semibold text-zinc-800">${m.name}</td>
            <td class="p-2">
                <span class="${m.dept === 'Sự kiện' ? 'badge-dept-event' : 'badge-dept-media'}">
                    ${m.dept}
                </span>
            </td>
            <td class="p-2 text-xs text-zinc-500 font-mono">${m.email || ''}</td>
            <td class="p-2 text-center">
                <button onclick="removeMember('${m.mssv}')" class="text-rose-500 hover:text-rose-700 text-xs px-2 py-1 rounded hover:bg-rose-50">
                    <i class="fa-solid fa-user-minus"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function handleAddNewMember() {
    const mssv = document.getElementById('newMemberMssv').value.trim();
    const name = document.getElementById('newMemberName').value.trim();
    const dept = document.getElementById('newMemberDept').value;
    const email = document.getElementById('newMemberEmail').value.trim() || `${mssv}@gm.uit.edu.vn`;

    if (!mssv || !name) {
        alert('Vui lòng nhập đầy đủ MSSV và Họ Tên thành viên!');
        return;
    }

    if (AppState.members.some(m => m.mssv === mssv)) {
        alert(`MSSV ${mssv} đã tồn tại trong danh sách!`);
        return;
    }

    AppState.members.push({ stt: AppState.members.length + 1, mssv, name, dept, email });
    saveMemberList(AppState.members);
    playSound('click');

    // Reset form
    document.getElementById('newMemberMssv').value = '';
    document.getElementById('newMemberName').value = '';
    document.getElementById('newMemberEmail').value = '';

    renderMemberListTable();
    updateDashboardStats();
    alert(`✅ Đã thêm thành viên ${name} (${mssv}) vào danh sách!`);
}

window.removeMember = function(mssv) {
    if (!confirm(`Bạn có chắc muốn xóa thành viên có MSSV ${mssv} khỏi danh sách?`)) return;
    playSound('click');
    AppState.members = AppState.members.filter(m => m.mssv !== mssv);
    saveMemberList(AppState.members);
    renderMemberListTable();
    updateDashboardStats();
};

function handleResetDefaultMembers() {
    if (!confirm(`Bạn có muốn khôi phục lại danh sách ${DEFAULT_MEMBERS.length} thành viên gốc của Đội Event 2026 không?`)) return;
    playSound('click');
    localStorage.removeItem(MEMBERS_STORAGE_KEY);
    AppState.members = getMemberList();
    renderMemberListTable();
    updateDashboardStats();
    alert('✅ Đã khôi phục danh sách thành viên gốc thành công!');
}

// ============================================================================
// CANVAS CONFETTI HIỆU ỨNG PHÁO GIẤY VÀNG CHANH ĂN MỪNG
// ============================================================================
let confettiCanvas = null;
let confettiCtx = null;
let confettiParticles = [];
let confettiAnimId = null;

function setupCanvasConfetti() {
    confettiCanvas = document.getElementById('confettiCanvas');
    if (!confettiCanvas) return;
    confettiCtx = confettiCanvas.getContext('2d');
    resizeConfettiCanvas();
    window.addEventListener('resize', resizeConfettiCanvas);
}

function resizeConfettiCanvas() {
    if (!confettiCanvas) return;
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
}

function triggerCelebrationConfetti() {
    if (!confettiCanvas || !confettiCtx) return;
    confettiParticles = [];

    const colors = ['#F7FE45', '#EFFE38', '#1B5E20', '#2E7D32', '#FACC15', '#FFFFFF', '#0284C7'];
    const count = 140;

    for (let i = 0; i < count; i++) {
        confettiParticles.push({
            x: window.innerWidth * 0.5 + (Math.random() - 0.5) * 200,
            y: window.innerHeight * 0.5,
            w: Math.random() * 12 + 6,
            h: Math.random() * 8 + 4,
            color: colors[Math.floor(Math.random() * colors.length)],
            vx: (Math.random() - 0.5) * 22,
            vy: (Math.random() - 1) * 18 - 4,
            rotation: Math.random() * 360,
            rotSpeed: (Math.random() - 0.5) * 12,
            gravity: 0.35,
            opacity: 1
        });
    }

    if (confettiAnimId) cancelAnimationFrame(confettiAnimId);
    animateConfetti();
}

function animateConfetti() {
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    let alive = false;

    confettiParticles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.rotation += p.rotSpeed;
        p.opacity -= 0.007;

        if (p.opacity > 0 && p.y < confettiCanvas.height) {
            alive = true;
            confettiCtx.save();
            confettiCtx.translate(p.x, p.y);
            confettiCtx.rotate((p.rotation * Math.PI) / 180);
            confettiCtx.globalAlpha = Math.max(0, p.opacity);
            confettiCtx.fillStyle = p.color;
            confettiCtx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
            confettiCtx.restore();
        }
    });

    if (alive) {
        confettiAnimId = requestAnimationFrame(animateConfetti);
    } else {
        confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    }
}