"use strict";

(() => {
    if (Store.redirectIfLoggedIn()) return;

    const COLOR_ERROR = "#d6456f";
    const COLOR_OK = "#2f8f5b";

    const show = (el, text, isError = true) => {
        if (!el) return;
        el.textContent = text;
        el.style.color = isError ? COLOR_ERROR : COLOR_OK;
    };

    const setBusy = (form, busy) => {
        const btn = form.querySelector('button[type="submit"]');
        if (btn) btn.disabled = busy;
    };

    const registerForm = document.getElementById("registerForm");
    if (registerForm) {
        const msg = document.getElementById("registerMessage");

        registerForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            show(msg, "");

            const nama = document.getElementById("registerName").value.trim();
            const username = document.getElementById("registerUsername").value.trim();
            const password = document.getElementById("registerPassword").value;

            if (nama.length < 2) return show(msg, "Nama minimal 2 karakter.");
            if (!/^[a-zA-Z0-9_]{3,20}$/.test(username))
                return show(msg, "Username 3-20 karakter: huruf, angka, atau garis bawah (_).");
            if (password.length < 4) return show(msg, "Password minimal 4 karakter.");

            setBusy(registerForm, true);
            const result = await Store.register({ nama, username, password });
            if (!result.ok) {
                show(msg, result.error);
                setBusy(registerForm, false);
                return;
            }
            show(msg, "Akun berhasil dibuat! Mengarahkan ke halaman login...", false);
            setTimeout(() => { location.href = "login.html"; }, 1000);
        });
    }

    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        const msg = document.getElementById("loginMessage");

        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            show(msg, "");

            const username = document.getElementById("loginUsername").value.trim();
            const password = document.getElementById("loginPassword").value;

            if (!username || !password) return show(msg, "Username dan password wajib diisi.");

            setBusy(loginForm, true);
            const result = await Store.login(username, password);
            if (!result.ok) {
                show(msg, result.error);
                setBusy(loginForm, false);
                return;
            }
            show(msg, "Login berhasil! Masuk ke dashboard...", false);
            location.href = "dashboard.html";
        });
    }
})();
