function isLoggedIn() {
    return localStorage.getItem("user") !== null;
}

function requireAuth() {
    if (!isLoggedIn()) {
        window.location.href = "index.html";
    }
}

function redirectIfLoggedIn() {
    if (isLoggedIn()) {
        window.location.href = "dashboard.html";
    }
}

function loginUser(user) {
    localStorage.setItem("user", JSON.stringify(user));
}

function logoutUser() {
    localStorage.removeItem("user");
    window.location.href = "index.html";
}
