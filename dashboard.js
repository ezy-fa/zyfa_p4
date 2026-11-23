"use strict";

(() => {
    if (!Store.requireLogin()) return;

    const user = Store.currentUser();
    const stats = Store.getStats(user.username);
    const set = (id, v) => {
        const el = document.getElementById(id);
        if (el) el.textContent = v;
    };

    set("playerName", user.nama.split(" ")[0] || user.username);
    set("highScore", stats.best);
    set("totalFruits", stats.fruits);
    set("gamesPlayed", stats.played);

    const logout = document.getElementById("logoutButton");
    if (logout) {
        logout.addEventListener("click", () => {
            Store.logout();
            location.href = "login.html";
        });
    }
})();
