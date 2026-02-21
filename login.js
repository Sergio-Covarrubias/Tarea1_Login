const users = [
    { email: "sergio@example.com", password: "123456" },
    { email: "test@example.com", password: "password" }
];

document.addEventListener("DOMContentLoaded", function () {

    // Redirigir si ya está logueado
    if (localStorage.getItem("user")) {
        window.location.href = "dashboard.html";
    }

    const form = document.getElementById("login-form");
    const errorMessage = document.getElementById("error-message");

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();

        const userFound = users.find(user =>
            user.email === email && user.password === password
        );

        if (userFound) {
            localStorage.setItem("user", JSON.stringify(userFound));
            window.location.href = "dashboard.html";
        } else {
            errorMessage.textContent = "Username or password incorrect";
        }
    });

});
