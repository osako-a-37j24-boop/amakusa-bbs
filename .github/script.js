// ==========================================
// 1. データ定義
// ==========================================
const clubs = [
    // 運動部
    { name: "野球部", icon: "fa-solid fa-baseball-bat-ball", pass: "tech", type: "sports" },
    { name: "サッカー部", icon: "fa-solid fa-futbol", pass: "tech", type: "sports" },
    { name: "陸上競技部", icon: "fa-solid fa-person-running", pass: "tech", type: "sports" },
    { name: "ソフトテニス部", icon: "fa-solid fa-circle-dot", pass: "tech", type: "sports" },
    { name: "卓球部", icon: "fa-solid fa-table-tennis-paddle-ball", pass: "tech", type: "sports" },
    { name: "弓道部", icon: "fa-solid fa-bullseye", pass: "tech", type: "sports" },
    { name: "バレーボール部", icon: "fa-solid fa-volleyball", pass: "tech", type: "sports" },
    { name: "バスケットボール部", icon: "fa-solid fa-basketball", pass: "tech", type: "sports" },
    { name: "ハンドボール部", icon: "fa-solid fa-hand-dots", pass: "tech", type: "sports" },
    { name: "ソフトボール部", icon: "fa-solid fa-baseball", pass: "tech", type: "sports" },
    { name: "バドミントン部", icon: "fa-solid fa-feather-pointed", pass: "tech", type: "sports" },
    { name: "水泳部", icon: "fa-solid fa-person-swimming", pass: "tech", type: "sports" },
    { name: "ボクシング部", icon: "fa-solid fa-hand-fist", pass: "tech", type: "sports" },

    // 文化部
    { name: "CG", icon: "fa-solid fa-laptop-code", pass: "tech", type: "culture" },
    { name: "電子工作部", icon: "fa-solid fa-microchip", pass: "tech", type: "culture" },
    { name: "吹奏楽部", icon: "fa-solid fa-music", pass: "tech", type: "culture" },
    { name: "芸術倶楽部", icon: "fa-solid fa-palette", pass: "tech", type: "culture" },
    { name: "機械倶楽部", icon: "fa-solid fa-gear", pass: "tech", type: "culture" },
    { name: "建設倶楽部", icon: "fa-solid fa-hammer", pass: "tech", type: "culture" },
    { name: "ゲーム制作部", icon: "fa-solid fa-laptop-code", pass: "tech", type: "culture" },
    { name: "インターアクトクラブ", icon: "fa-solid fa-earth-asia", pass: "tech", type: "culture" },
    { name: "食物同好会", icon: "fa-solid fa-utensils", pass: "tech", type: "culture" }
];

let appState = {
    isAdmin: false,
    inAdminDashboard: false, 
    currentClub: "",
    currentTab: "public", 
    currentSubSection: "timeline", 
    attachedImage: null,
    activeInternalClub: "",
    data: {},
    reports: [], 
    clubPasswords: {},
    schedules: {},
    polls: {}
};

let activityChartInstance = null;
let speechRecognitionInstance = null;
let isRecordingVoice = false;

try {
    appState.data = JSON.parse(localStorage.getItem('amakusa_v6_data')) || {};
    appState.reports = JSON.parse(localStorage.getItem('amakusa_v6_reports')) || {};
    appState.clubPasswords = JSON.parse(localStorage.getItem('amakusa_v6_passwords')) || {};
    appState.schedules = JSON.parse(localStorage.getItem('amakusa_v6_scheds')) || {};
    appState.polls = JSON.parse(localStorage.getItem('amakusa_v6_polls')) || {};
    if (!Array.isArray(appState.reports)) appState.reports = [];
    if (localStorage.getItem('amakusa_v6_dark') === 'true') document.body.classList.add('dark-theme');
} catch(e) { console.error(e); }

function init() {
    clubs.forEach(c => {
        if (!appState.data[c.name]) appState.data[c.name] = { public: [], internal: [] };
        if (!appState.clubPasswords[c.name]) appState.clubPasswords[c.name] = c.pass;
        if (!appState.schedules[c.name]) appState.schedules[c.name] = [];
    });
    goHome();
    initSpeechRecognition();
}

// 二択のカテゴリー選択
function selectCategory(type) {
    document.getElementById('categorySelectionPage').classList.add('hidden');
    document.getElementById('clubSelectionPage').classList.remove('hidden');
    
    const title = type === 'sports' ? '運動部を選択してください' : '文化部を選択してください';
    document.getElementById('clubCategoryTitle').innerText = title;
    
    renderClubs(type);
}

// 該当タイプの部活一覧を描画
function renderClubs(type) {
    const grid = document.getElementById('clubGrid');
    if (!grid) return;
    
    const filteredClubs = clubs.filter(c => c.type === type);
    grid.innerHTML = filteredClubs.map(c => `
        <div class="club-card" onclick="openBBS('${c.name}')">
            <i class="${c.icon}"></i>
            <h3>${c.name}</h3>
        </div>
    `).join('');
}

// 二択画面へ戻る
function backToCategory() {
    document.getElementById('clubSelectionPage').classList.add('hidden');
    document.getElementById('categorySelectionPage').classList.remove('hidden');
}

function handleSearchInput() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;
    const val = searchInput.value.trim();

    if (val === '#admin' || val === '#adminlogin') {
        searchInput.value = '';
        if (!appState.isAdmin) {
            loginAdminModal();
        } else {
            switchToAdminDashboard();
        }
        return;
    }
    renderPosts();
}

function toggleAdmin() {
    if (appState.isAdmin) {
        switchToAdminDashboard();
    } else {
        loginAdminModal();
    }
}

function loginAdminModal() {
    const pass = prompt("【管理者認証】管理者パスワードを入力してください:");
    if (pass === "admin") { 
        appState.isAdmin = true; 
        document.getElementById('adminMenuArea').classList.remove('hidden');
        document.getElementById('authStatus').innerHTML = `<i class="fa-solid fa-user-shield"></i> 管理者モード`;
        alert("管理者モードでログインしました。");
        switchToAdminDashboard(); 
    } else if (pass !== null) {
        alert("パスワードが違います。");
    }
}

function logoutAdmin() {
    if (confirm("管理者モードをログアウトしますか？")) {
        appState.isAdmin = false;
        appState.inAdminDashboard = false;
        document.getElementById('adminMenuArea').classList.add('hidden');
        document.getElementById('authStatus').innerHTML = `<i class="fa-solid fa-user"></i> 一般ユーザー`;
        document.getElementById('mainNavbar').classList.remove('admin-mode-navbar');
        alert("管理者モードからログアウトしました。");
        goHome();
    }
}

// 音声入力
function initSpeechRecognition() {
    window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!window.SpeechRecognition) return;
    
    speechRecognitionInstance = new window.SpeechRecognition();
    speechRecognitionInstance.lang = 'ja-JP';
    speechRecognitionInstance.interimResults = false;
    speechRecognitionInstance.continuous = false;

    speechRecognitionInstance.onresult = function(event) {
        const voiceText = event.results[0][0].transcript;
        const msgField = document.getElementById('userMsg');
        if (msgField && voiceText) {
            msgField.value = msgField.value ? msgField.value + " " + voiceText : voiceText;
        }
    };

    speechRecognitionInstance.onend = function() {
        isRecordingVoice = false;
        const micBtn = document.getElementById('micBtn');
        if (micBtn) micBtn.classList.remove('recording');
    };

    speechRecognitionInstance.onerror = function(e) {
        console.error("音声入力エラー: ", e);
        isRecordingVoice = false;
        const micBtn = document.getElementById('micBtn');
        if (micBtn) micBtn.classList.remove('recording');
    };
}

function toggleVoiceInput() {
    if (!speechRecognitionInstance) {
        alert("お使いのブラウザは音声入力に対応していません。");
        return;
    }
    const micBtn = document.getElementById('micBtn');
    if (!isRecordingVoice) {
        try {
            speechRecognitionInstance.start();
            isRecordingVoice = true;
            if (micBtn) micBtn.classList.add('recording');
        } catch (e) { console.error(e); }
    } else {
        speechRecognitionInstance.stop();
    }
}

// タブ・セクション制御
function switchTab(t) {
    if (t === 'internal' && appState.activeInternalClub !== appState.currentClub) {
        if (appState.isAdmin) {
            appState.activeInternalClub = appState.currentClub;
        } else {
            const userPass = prompt(`【${appState.currentClub}】部内連絡パスワードを入力してください。`);
            if (userPass === appState.clubPasswords[appState.currentClub]) {
                appState.activeInternalClub = appState.currentClub;
            } else {
                if (userPass !== null) alert("パスワードが違います。");
                t = 'public';
            }
        }
    }
    appState.currentTab = t;
    document.getElementById('tab-public').className = t === 'public' ? 'tab active' : 'tab';
    document.getElementById('tab-internal').className = t === 'internal' ? 'tab active' : 'tab';
    
    const subNavbar = document.getElementById('internalSubNavbar');
    if (t === 'internal') {
        subNavbar.classList.remove('hidden');
    } else {
        subNavbar.classList.add('hidden');
        appState.currentSubSection = 'timeline';
    }
    switchSubSection(appState.currentSubSection);
}

function switchSubSection(sect) {
    appState.currentSubSection = sect;
    document.querySelectorAll('.sub-nav-btn').forEach(btn => btn.classList.remove('active'));
    const targetedBtn = document.getElementById(`subBtn-${sect}`);
    if (targetedBtn) targetedBtn.classList.add('active');
    
    document.querySelectorAll('.sub-section').forEach(el => el.classList.add('hidden'));
    
    if (sect === 'timeline') {
        document.getElementById('sect-timeline').classList.remove('hidden');
        renderPosts();
    } else if (sect === 'calendar') {
        document.getElementById('sect-calendar').classList.remove('hidden');
        renderSchedule();
    } else if (sect === 'poll') {
        document.getElementById('sect-poll').classList.remove('hidden');
        renderPoll();
    }
}

function openBBS(name) {
    appState.currentClub = name;
    document.getElementById('clubTitle').innerText = name;
    document.getElementById('categorySelectionPage').classList.add('hidden');
    document.getElementById('clubSelectionPage').classList.add('hidden');
    document.getElementById('bbsPage').classList.remove('hidden');
    document.getElementById('searchToolbar').classList.remove('hidden');
    document.getElementById('adminDashboardPage').classList.add('hidden');
    switchTab('public');
}

function adminDirectJump(name, targetTab) {
    appState.currentClub = name;
    if (targetTab === 'internal') { appState.activeInternalClub = name; }
    document.getElementById('clubTitle').innerText = name;
    document.getElementById('categorySelectionPage').classList.add('hidden');
    document.getElementById('clubSelectionPage').classList.add('hidden');
    document.getElementById('bbsPage').classList.remove('hidden');
    document.getElementById('searchToolbar').classList.remove('hidden');
    document.getElementById('adminDashboardPage').classList.add('hidden');
    switchTab(targetTab);
}

function goHome() {
    appState.currentClub = "";
    appState.inAdminDashboard = false;
    document.getElementById('categorySelectionPage').classList.remove('hidden');
    document.getElementById('clubSelectionPage').classList.add('hidden');
    document.getElementById('bbsPage').classList.add('hidden');
    document.getElementById('adminDashboardPage').classList.add('hidden');
    document.getElementById('searchToolbar').classList.add('hidden');
    if (!appState.isAdmin) {
        document.getElementById('mainNavbar').classList.remove('admin-mode-navbar');
    }
    if (isRecordingVoice && speechRecognitionInstance) { speechRecognitionInstance.stop(); }
}

// 掲示板画像＆投稿ロジック
function handleImagePreview() {
    const file = document.getElementById('imageInput').files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        appState.attachedImage = e.target.result;
        document.getElementById('imagePreview').src = appState.attachedImage;
        document.getElementById('imagePreviewContainer').classList.remove('hidden');
        document.getElementById('dropzoneLabel').classList.add('hidden');
    };
    reader.readAsDataURL(file);
}

function removeImage() {
    appState.attachedImage = null;
    document.getElementById('imageInput').value = "";
    document.getElementById('imagePreviewContainer').classList.add('hidden');
    document.getElementById('dropzoneLabel').classList.remove('hidden');
}

function parseMarkdown(str) {
    let escaped = escapeHTML(str);
    escaped = escaped.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    return escaped.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
}

function renderPosts() {
    const win = document.getElementById('postWindow');
    const gallery = document.getElementById('galleryWindow');
    if (!win) return;
    
    let posts = appState.data[appState.currentClub][appState.currentTab] || [];
    
    const searchWord = document.getElementById('searchInput').value.trim().toLowerCase();
    const selectedTag = document.getElementById('filterTag').value;
    if (searchWord) posts = posts.filter(p => p.text.toLowerCase().includes(searchWord));
    if (selectedTag) posts = posts.filter(p => p.tag === selectedTag);
    if (document.getElementById('filterImgCheck').checked) posts = posts.filter(p => p.img);

    if (gallery) {
        const imagePosts = posts.filter(p => p.img);
        if (imagePosts.length === 0) {
            gallery.innerHTML = '<p style="font-size:0.85rem; color:#94a3b8; text-align:center; grid-column: span 2; padding: 20px 0;">まだ写真はありません</p>';
        } else {
            gallery.innerHTML = imagePosts.slice().reverse().map(p => `
                <img src="${p.img}" class="gallery-item" onclick="openLightbox('${p.img}')" title="${escapeHTML(p.name)}さんの投稿">
            `).join('');
        }
    }

    if (posts.length === 0) {
        win.innerHTML = '<p style="text-align:center; padding:20px; color:#94a3b8;">投稿がありません。</p>';
        return;
    }

    win.innerHTML = posts.map(p => {
        const repliesHTML = (p.replies || []).map(r => `
            <div class="reply-item"><strong>↳ ${escapeHTML(r.name)}</strong>: <div>${escapeHTML(r.text)}</div></div>
        `).join('');

        const photoBadge = p.img ? `<span style="color: var(--primary); font-size: 0.75rem;"><i class="fa-solid fa-image"></i> 写真あり</span>` : '';
        const textContent = p.text ? parseMarkdown(p.text) : `<span style="color:#94a3b8; font-style:italic;">(写真のみの投稿)</span>`;

        return `
            <div class="post">
                <div class="p-meta">
                    <span class="p-num">No.${p.num}</span>
                    <span class="p-tag">${p.tag || '【総合】'}</span>
                    <span class="p-name">${escapeHTML(p.name)}</span>
                    ${photoBadge}
                </div>
                <div class="p-text">${textContent}</div>
                <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:8px;">
                    <button class="btn btn-primary" style="font-size:0.75rem; padding:4px 8px;" onclick="openReplyModal(${p.id})">返信</button>
                    <button class="btn btn-report" onclick="reportPost('${appState.currentClub}', '${appState.currentTab}', ${p.id})">通報</button>
                    ${appState.isAdmin ? `<button class="btn btn-del" onclick="deletePostById('${appState.currentClub}', '${appState.currentTab}', ${p.id})">削除</button>` : ''}
                </div>
                ${repliesHTML ? `<div class="replies-container">${repliesHTML}</div>` : ''}
            </div>
        `;
    }).join('');
}

function postMessage() {
    const name = document.getElementById('userName').value.trim() || "名無しさん";
    const text = document.getElementById('userMsg').value.trim();
    if (!text && !appState.attachedImage) return;
    
    const posts = appState.data[appState.currentClub][appState.currentTab];
    posts.push({
        id: Date.now(),
        num: posts.length + 1,
        name: name,
        tag: document.getElementById('postTag').value,
        text: text,
        img: appState.attachedImage,
        replies: []
    });
    save(); 
    removeImage();
    document.getElementById('userMsg').value = "";
    renderPosts();
}

function openReplyModal(postId) {
    const posts = appState.data[appState.currentClub][appState.currentTab];
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    document.getElementById('replyTargetPostId').value = postId;
    document.getElementById('replyTargetPreview').innerText = `${post.name}: ${post.text.substring(0, 30)}...`;
    openModal('replyModal');
}

function submitReply() {
    const postId = parseInt(document.getElementById('replyTargetPostId').value);
    const name = document.getElementById('replyName').value.trim() || "名無しさん";
    const text = document.getElementById('replyMsg').value.trim();
    if (!text) return;

    const posts = appState.data[appState.currentClub][appState.currentTab];
    const post = posts.find(p => p.id === postId);
    if (post) {
        if (!post.replies) post.replies = [];
        post.replies.push({ name, text, date: new Date().toLocaleString('ja-JP') });
        save(); closeModal('replyModal'); renderPosts();
        document.getElementById('replyMsg').value = "";
    }
}

// スケジュール・アンケート
function renderSchedule() {
    const list = document.getElementById('scheduleList');
    const sorted = (appState.schedules[appState.currentClub] || []).sort((a,b) => new Date(a.date) - new Date(b.date));
    list.innerHTML = sorted.length ? sorted.map(s => `
        <div class="schedule-large-item">
            <div><strong>${s.date}</strong> - ${escapeHTML(s.text)}</div>
            ${appState.isAdmin ? `<button class="btn btn-del" onclick="deleteSchedule('${s.id}')">削除</button>` : ''}
        </div>
    `).join('') : '<p style="text-align:center; color:#94a3b8;">予定はありません。</p>';
}

function addSchedule() {
    const date = document.getElementById('schedDate').value;
    const text = document.getElementById('schedText').value.trim();
    if(!date || !text) return;
    appState.schedules[appState.currentClub].push({ id: Date.now().toString(), date, text });
    save(); renderSchedule(); 
    document.getElementById('schedDate').value = "";
    document.getElementById('schedText').value = "";
}

function deleteSchedule(id) {
    appState.schedules[appState.currentClub] = appState.schedules[appState.currentClub].filter(s => s.id !== id);
    save(); renderSchedule();
}

function renderPoll() {
    const area = document.getElementById('activePollArea');
    const poll = appState.polls[appState.currentClub];
    if(!poll) { area.innerHTML = '<p style="text-align:center; color:#94a3b8;">現在アンケートはありません。</p>'; return; }
    
    const isExpired = poll.deadline && new Date() > new Date(poll.deadline);
    const hasVoted = (poll.votedUsers || []).includes(appState.currentClub + "_voted");
    
    let statusText = "";
    if (isExpired) {
        statusText = `<span style="color:var(--danger); font-weight:bold;">[受付終了]</span>`;
    } else if (poll.deadline) {
        const dl = new Date(poll.deadline);
        statusText = `<span style="color:#64748b; font-size:0.8rem;">(締切: ${dl.getMonth()+1}/${dl.getDate()} ${String(dl.getHours()).padStart(2, '0')}:${String(dl.getMinutes()).padStart(2, '0')})</span>`;
    }

    area.innerHTML = `<div class="poll-large-box">
        <h4>Q. ${escapeHTML(poll.question)} ${statusText}</h4>` + 
        poll.options.map((opt, idx) => {
            const disabled = (isExpired || hasVoted) ? "disabled style='opacity:0.6; cursor:not-allowed;'" : "";
            return `
                <div class="poll-option-row">
                    <button class="poll-vote-btn" ${disabled} onclick="votePoll(${idx})">
                        <span>${escapeHTML(opt)}</span>
                        <span>${poll.votes[idx]}票</span>
                    </button>
                </div>
            `;
        }).join('') + 
        (hasVoted ? `<p style="font-size:0.8rem; color:#059669; margin-top:5px;">※すでに投票済みです。</p>` : '') +
        (appState.isAdmin ? `<button class="btn btn-del" style="width:100%; margin-top:10px;" onclick="deletePoll()">強制終了</button>` : '') + 
    `</div>`;
}

function createPoll() {
    const q = document.getElementById('pollQuestion').value.trim();
    const o1 = document.getElementById('pollOpt1').value.trim();
    const o2 = document.getElementById('pollOpt2').value.trim();
    const deadlineVal = document.getElementById('pollDeadline').value;
    if(!q || !o1 || !o2) return;
    
    appState.polls[appState.currentClub] = { 
        question: q, 
        options: [o1, o2], 
        votes: [0, 0], 
        votedUsers: [],
        deadline: deadlineVal ? deadlineVal : null
    };
    save(); renderPoll(); closeModal('createPollModal');
    document.getElementById('pollQuestion').value = "";
    document.getElementById('pollOpt1').value = "";
    document.getElementById('pollOpt2').value = "";
    document.getElementById('pollDeadline').value = "";
}

function votePoll(idx) {
    const poll = appState.polls[appState.currentClub];
    if (!poll) return;

    if (poll.deadline && new Date() > new Date(poll.deadline)) {
        alert("このアンケートは既に締め切られています。");
        return;
    }

    if (!poll.votedUsers) poll.votedUsers = [];
    const voteKey = appState.currentClub + "_voted";
    
    if (poll.votedUsers.includes(voteKey)) {
        alert("アンケートには1回しか投票できません。");
        return;
    }

    poll.votes[idx]++;
    poll.votedUsers.push(voteKey);
    save(); renderPoll();
}

function deletePoll() { delete appState.polls[appState.currentClub]; save(); renderPoll(); }

// ライトボックス
function openLightbox(imgSrc) {
    const lightbox = document.getElementById('imageLightbox');
    const lightboxImg = document.getElementById('lightboxTargetImg');
    const downloadBtn = document.getElementById('lightboxDownloadBtn');
    if(lightbox && lightboxImg) { 
        lightboxImg.src = imgSrc; 
        if (downloadBtn) { downloadBtn.href = imgSrc; }
        lightbox.classList.remove('hidden'); 
    }
}

function closeLightbox() {
    const lightbox = document.getElementById('imageLightbox');
    if(lightbox) lightbox.classList.add('hidden');
}

// 管理機能・共通関数
function switchToAdminDashboard() {
    appState.inAdminDashboard = true;
    document.getElementById('categorySelectionPage').classList.add('hidden');
    document.getElementById('clubSelectionPage').classList.add('hidden');
    document.getElementById('bbsPage').classList.add('hidden');
    document.getElementById('searchToolbar').classList.add('hidden');
    document.getElementById('adminDashboardPage').classList.remove('hidden');
    document.getElementById('mainNavbar').classList.add('admin-mode-navbar');
    calculateStats(); renderDashboardReports(); renderAdminClubControl(); renderActivityChart();
}

function exitAdminDashboard() { goHome(); }

function calculateStats() {
    const unhandledReports = Array.isArray(appState.reports) ? appState.reports.filter(r => r.status === "未処理").length : 0;
    document.getElementById('stat-reports').innerText = unhandledReports;
    
    let total = 0;
    Object.keys(appState.data).forEach(k => { total += (appState.data[k].public || []).length + (appState.data[k].internal || []).length; });
    document.getElementById('stat-posts').innerText = total;
    document.getElementById('stat-clubs').innerText = clubs.length;
}

function renderActivityChart() {
    const ctxChart = document.getElementById('activityChart').getContext('2d');
    if (activityChartInstance) activityChartInstance.destroy();
    activityChartInstance = new Chart(ctxChart, {
        type: 'bar',
        data: {
            labels: clubs.map(c => c.name),
            datasets: [{ label: '投稿総数', data: clubs.map(c => (appState.data[c.name]?.public || []).length + (appState.data[c.name]?.internal || []).length), backgroundColor: 'rgba(0, 121, 107, 0.6)' }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

function renderDashboardReports() {
    const list = document.getElementById('dashReportList');
    if (!list) return;
    if (!Array.isArray(appState.reports) || appState.reports.length === 0) { list.innerHTML = '<p style="text-align:center; padding:10px;">通報はありません。</p>'; return; }
    list.innerHTML = appState.reports.map(r => `
        <div style="background:var(--bg); padding:10px; margin-bottom:5px; border-radius:6px; border:1px solid var(--border); font-size:0.85rem;">
            <small>${r.club} [${r.status}]</small>
            <div><strong>${escapeHTML(r.postData.name)}</strong>: ${escapeHTML(r.postData.text)}</div>
            ${r.status === '未処理' ? `
                <div style="display:flex; gap:5px; margin-top:5px;">
                    <button class="btn btn-del" onclick="handleReport(${r.id}, 'delete')">強制削除</button>
                    <button class="btn btn-admin" style="font-size:0.75rem;" onclick="handleReport(${r.id}, 'ignore')">放置（保留）</button>
                </div>
            ` : ''}
        </div>
    `).join('');
}

function handleReport(reportId, action) {
    const rep = appState.reports.find(r => r.id === reportId);
    if(rep) {
        if (action === 'delete') {
            const p = appState.data[rep.club][rep.tab];
            const idx = p.findIndex(x => x.id === rep.postId);
            if(idx !== -1) p.splice(idx, 1);
            rep.status = "削除済";
        } else if (action === 'ignore') {
            rep.status = "保留・放置";
        }
    }
    save(); switchToAdminDashboard();
}

function renderAdminClubControl() {
    document.getElementById('adminClubControlGrid').innerHTML = clubs.map(c => {
        const currentPwd = appState.clubPasswords[c.name] || c.pass;
        return `
            <div class="admin-control-card">
                <div class="admin-club-info"><strong>${c.name}</strong></div>
                <div class="admin-club-pwd-box">
                    <span>パス:</span>
                    <input type="text" id="pwdInput-${c.name}" value="${currentPwd}" onchange="updateClubPassword('${c.name}', this.value)">
                </div>
                <div class="admin-club-btns">
                    <button class="btn btn-admin" style="padding:4px 8px; font-size:0.75rem;" onclick="adminDirectJump('${c.name}', 'public')"><i class="fa-solid fa-globe"></i> 公開BBS</button>
                    <button class="btn btn-primary" style="padding:4px 8px; font-size:0.75rem;" onclick="adminDirectJump('${c.name}', 'internal')"><i class="fa-solid fa-lock"></i> 部内BBS</button>
                </div>
            </div>
        `;
    }).join('');
}

function updateClubPassword(clubName, newPwd) {
    if(!newPwd.trim()) { alert("パスワードを空にすることはできません。"); renderAdminClubControl(); return; }
    appState.clubPasswords[clubName] = newPwd.trim(); save();
    const input = document.getElementById(`pwdInput-${clubName}`);
    if (input) { input.style.borderColor = "#059669"; setTimeout(() => input.style.borderColor = "", 1000); }
}

function reportPost(club, tab, id) {
    const post = appState.data[club][tab].find(p => p.id === id);
    if (!post) return;
    if (!Array.isArray(appState.reports)) appState.reports = [];
    appState.reports.push({ id: Date.now(), club, tab, postId: id, postData: post, status: "未処理" });
    save(); alert("通報が完了しました。");
}

function deletePostById(club, tab, id) {
    const p = appState.data[club][tab];
    const idx = p.findIndex(x => x.id === id);
    if(idx !== -1) { p.splice(idx, 1); save(); renderPosts(); }
}

function backFromBBS() { if (appState.isAdmin) { switchToAdminDashboard(); } else { goHome(); } }
function logoutInternal() { appState.activeInternalClub = ""; switchTab('public'); }
function openModal(id) { document.getElementById(id).classList.remove('hidden'); }
function closeModal(id) { document.getElementById(id).classList.add('hidden'); }
function toggleMenu() { 
    const menu = document.getElementById('sideMenu');
    const overlay = document.getElementById('menuOverlay');
    if (menu && overlay) { menu.classList.toggle('open'); overlay.classList.toggle('open'); }
}
function toggleDarkMode() { const d = document.body.classList.toggle('dark-theme'); localStorage.setItem('amakusa_v6_dark', d); }
function escapeHTML(s) { return s ? s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;") : ""; }

function save() {
    localStorage.setItem('amakusa_v6_data', JSON.stringify(appState.data));
    localStorage.setItem('amakusa_v6_reports', JSON.stringify(appState.reports));
    localStorage.setItem('amakusa_v6_passwords', JSON.stringify(appState.clubPasswords));
    localStorage.setItem('amakusa_v6_scheds', JSON.stringify(appState.schedules));
    localStorage.setItem('amakusa_v6_polls', JSON.stringify(appState.polls));
}

document.addEventListener("DOMContentLoaded", init);
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// メモ画像から抽出した設定情報
const firebaseConfig = {
  apiKey: "AIzaSyC_BJEdpECSK9Lq-1CqZrDBfLDZOtDkVFY",
  authDomain: "amakusa-bbs.firebaseapp.com",
  projectId: "amakusa-bbs",
  storageBucket: "amakusa-bbs.firebasestorage.app",
  messagingSenderId: "447439064622",
  appId: "1:447439064622:web:52d3676f4b10ce753999bf"
};

// Firebase初期化
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const postsCollection = collection(db, "posts");

// DOM要素取得
const postForm = document.getElementById("post-form");
const nameInput = document.getElementById("name-input");
const contentInput = document.getElementById("content-input");
const postsContainer = document.getElementById("posts-container");

// リアルタイムで投稿データを自動取得・表示
const q = query(postsCollection, orderBy("createdAt", "desc"));
onSnapshot(q, (snapshot) => {
  postsContainer.innerHTML = "";

  if (snapshot.empty) {
    postsContainer.innerHTML = '<p class="empty-msg">まだ投稿がありません。最初のメッセージを投稿してみましょう！</p>';
    return;
  }

  snapshot.forEach((doc) => {
    const data = doc.data();
    const dateStr = data.createdAt 
      ? new Date(data.createdAt.toDate()).toLocaleString("ja-JP") 
      : "送信中...";

    const postElement = document.createElement("div");
    postElement.className = "post-card";
    postElement.innerHTML = `
      <div class="post-header">
        <span class="post-name">${escapeHTML(data.name || "名無し")}</span>
        <span class="post-date">${dateStr}</span>
      </div>
      <div class="post-content">${escapeHTML(data.content || "")}</div>
    `;
    postsContainer.appendChild(postElement);
  });
});

// 投稿送信処理
postForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = nameInput.value.trim() || "名無し";
  const content = contentInput.value.trim();

  if (!content) return;

  try {
    await addDoc(postsCollection, {
      name: name,
      content: content,
      createdAt: serverTimestamp()
    });

    contentInput.value = "";
  } catch (error) {
    console.error("投稿エラー:", error);
    alert("投稿の送信に失敗しました。時間をおいて再度お試しください。");
  }
});

// XSS対策（エスケープ処理）
function escapeHTML(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}