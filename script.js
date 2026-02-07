import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getDatabase, ref, update } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyCFn1buQn-olqvQkMh4H_imSih_-vRlHVo",
    authDomain: "test-2a198.firebaseapp.com",
    databaseURL: "https://test-2a198-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "test-2a198",
    storageBucket: "test-2a198.firebasestorage.app",
    messagingSenderId: "217248632641",
    appId: "1:217248632641:web:187fbfd729e75967b15bc0"
};

// 初始化 Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);
let currentUser = null;

// 取得畫面上的元素
const emailInput = document.getElementById('email');
const passInput = document.getElementById('password');
const btnLogin = document.getElementById('btnLogin');
const btnStart = document.getElementById('btnStart');
const btnStop = document.getElementById('btnStop');
const statusDiv = document.getElementById('status');
const loginArea = document.getElementById('login-area');
const controlArea = document.getElementById('control-area');
const userDisplay = document.getElementById('user-display');

// 1. 處理登入按鈕
btnLogin.addEventListener('click', async () => {
    const email = emailInput.value;
    const pass = passInput.value;

    if(!email || !pass) {
        statusDiv.innerText = "❌ 請輸入帳號密碼";
        return;
    }

    statusDiv.innerText = "⏳ 處理中...";

    try {
        // 先嘗試登入，失敗則自動註冊
        await signInWithEmailAndPassword(auth, email, pass)
            .catch(err => {
                if(err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
                    return createUserWithEmailAndPassword(auth, email, pass);
                }
                throw err;
            });

        statusDiv.innerText = "✅ 登入成功！";
        statusDiv.style.color = "green";
    } catch (error) {
        statusDiv.innerText = "❌ 錯誤: " + error.message;
        statusDiv.style.color = "red";
    }
});

// 2. 監聽登入狀態 (自動切換畫面)
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        loginArea.classList.add('hidden');
        controlArea.classList.remove('hidden');
        userDisplay.innerText = user.email;
        statusDiv.innerText = "準備就緒";
    } else {
        currentUser = null;
        loginArea.classList.remove('hidden');
        controlArea.classList.add('hidden');
    }
});

// 3. 發送指令
const sendCommand = (cmd) => {
    if (!currentUser) return;

    const speed = document.getElementById('speed').value;
    const updates = {};

    // 寫入資料到 users/{uid}
    updates['/users/' + currentUser.uid] = {
        command: cmd,
        speed: parseInt(speed),
        timestamp: Date.now()
    };

    update(ref(db), updates)
        .then(() => {
            statusDiv.innerText = `✅ 請稍後`;
            statusDiv.style.color = "green";
        })
        .catch(error => {
            statusDiv.innerText = "❌ 發送失敗: " + error.message;
            statusDiv.style.color = "red";
        });
};

// 綁定按鈕
btnStart.addEventListener('click', () => sendCommand('START'));
btnStop.addEventListener('click', () => sendCommand('STOP'));