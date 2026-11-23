"use strict";

window.Store = (() => {
    const KEY_USERS = "gamehub_users";
    const KEY_SESSION = "gamehub_session";
    const KEY_STATS = "gamehub_stats";

    const read = (key, fallback) => {
        try {
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : fallback;
        } catch (e) {
            return fallback;
        }
    };

    const write = (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            return false;
        }
    };

    const hashPassword = async (username, password) => {
        const text = `gamehub:${username.toLowerCase()}:${password}`;
        if (window.crypto && window.crypto.subtle) {
            const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
            return Array.from(new Uint8Array(buf))
                .map(b => b.toString(16).padStart(2, "0")).join("");
        }
        return "b64:" + btoa(unescape(encodeURIComponent(text)));
    };

    const getUsers = () => read(KEY_USERS, []);

    const findUser = (username) => {
        const target = String(username).trim().toLowerCase();
        return getUsers().find(u => u.username.toLowerCase() === target) || null;
    };

    const register = async ({ nama, username, password }) => {
        if (findUser(username)) {
            return { ok: false, error: "Username sudah dipakai, coba yang lain." };
        }
        const users = getUsers();
        users.push({
            nama: nama.trim(),
            username: username.trim(),
            passwordHash: await hashPassword(username.trim(), password),
            createdAt: new Date().toISOString()
        });
        if (!write(KEY_USERS, users)) {
            return { ok: false, error: "Gagal menyimpan akun. Penyimpanan browser penuh atau diblokir." };
        }
        return { ok: true };
    };

    const login = async (username, password) => {
        const user = findUser(username);
        if (!user) return { ok: false, error: "Username atau password salah." };
        const hash = await hashPassword(user.username, password);
        if (hash !== user.passwordHash) {
            return { ok: false, error: "Username atau password salah." };
        }
        write(KEY_SESSION, user.username);
        return { ok: true };
    };

    const logout = () => {
        try { localStorage.removeItem(KEY_SESSION); } catch (e) {}
    };

    const currentUser = () => {
        const name = read(KEY_SESSION, null);
        return name ? findUser(name) : null;
    };

    const getStats = (username) => {
        const all = read(KEY_STATS, {});
        return all[username.toLowerCase()] || { best: 0, fruits: 0, played: 0 };
    };

    const recordGame = (username, score) => {
        const all = read(KEY_STATS, {});
        const key = username.toLowerCase();
        const s = all[key] || { best: 0, fruits: 0, played: 0 };
        s.best = Math.max(s.best, score);
        s.fruits += Math.floor(score / 10);
        s.played += 1;
        all[key] = s;
        write(KEY_STATS, all);
    };

    const redirectIfLoggedIn = () => {
        if (currentUser()) {
            location.href = "dashboard.html";
            return true;
        }
        return false;
    };

    const requireLogin = () => {
        if (!currentUser()) {
            location.href = "login.html";
            return false;
        }
        return true;
    };

    return { register, login, logout, currentUser, getStats, recordGame, redirectIfLoggedIn, requireLogin };
})();
