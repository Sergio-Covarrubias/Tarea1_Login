document.addEventListener("DOMContentLoaded", function () {

    const isLoggedIn = localStorage.getItem("user") !== null;

    const headerHTML = `
        <header class="page-header">
            <div style="display:flex; justify-content:space-between; align-items:center; max-width:800px; margin:0 auto;">
                <p>Exercise App</p>
                ${isLoggedIn ? '<button id="logout-btn" style="width:auto; padding:0.3rem 0.8rem;">Logout</button>' : ''}
            </div>
        </header>
    `;

    const footerHTML = `
        <footer class="page-footer">
            <p>© 2026 Exercise App</p>
        </footer>
    `;

    document.body.insertAdjacentHTML("afterbegin", headerHTML);
    document.body.insertAdjacentHTML("beforeend", footerHTML);

    if (isLoggedIn) {
        const logoutBtn = document.getElementById("logout-btn");
        logoutBtn.addEventListener("click", function () {
            localStorage.removeItem("user");
            window.location.href = "index.html";
        });
    }

});
