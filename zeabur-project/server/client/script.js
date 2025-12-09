const API_BASE = '/api'; // Relative path works because frontend is served by backend

// Check Auth State on Load
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('auth_token');
    const navLogin = document.getElementById('nav-login');

    if (navLogin) {
        if (token) {
            navLogin.textContent = '已登录';
            navLogin.href = '#';
            navLogin.onclick = (e) => {
                e.preventDefault();
                if (confirm('要退出登录吗？')) {
                    localStorage.removeItem('auth_token');
                    window.location.reload();
                }
            };
        } else {
            navLogin.href = 'login.html';
        }
    }

    // Load Logs if on Dashboard page
    const logList = document.getElementById('log-list');
    if (logList) {
        fetchLogs();
        // Poll every 5 seconds
        setInterval(fetchLogs, 5000);
    }

    // Handle Login Form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
});

async function fetchLogs() {
    const logList = document.getElementById('log-list');
    try {
        const response = await fetch(`${API_BASE}/logs`);
        const result = await response.json();

        if (result.success) {
            logList.innerHTML = '';
            if (result.data.length === 0) {
                logList.innerHTML = '<div class="log-item">暂无数据记录</div>';
                return;
            }

            result.data.forEach(log => {
                const div = document.createElement('div');
                div.className = 'log-item';
                div.innerHTML = `
                    <span>[${log.device_id}] ${log.log_message}</span>
                    <span class="log-time">${new Date(log.created_at).toLocaleTimeString()}</span>
                `;
                logList.appendChild(div);
            });
        }
    } catch (err) {
        console.error('Fetch logs error:', err);
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const phone = document.getElementById('phone').value;
    const code = document.getElementById('code').value;
    const submitBtn = e.target.querySelector('button[type="submit"]');

    if (!phone || !code) {
        alert('请填写完整信息');
        return;
    }

    const originalText = submitBtn.textContent;
    submitBtn.textContent = '登录中...';
    submitBtn.disabled = true;

    try {
        const response = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone, code })
        });

        const result = await response.json();

        if (result.success) {
            localStorage.setItem('auth_token', result.token);
            alert('登录成功！');
            window.location.href = 'index.html';
        } else {
            alert('登录失败: ' + result.message);
        }
    } catch (err) {
        alert('网络错误，请稍后重试');
        console.error(err);
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}
