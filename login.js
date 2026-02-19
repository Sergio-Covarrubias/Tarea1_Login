const users = [
    {
        email: "sergio@example.com",
        password: "123456"
    },
    {
        email: "test@example.com",
        password: "password"
    }
];

const form = document.getElementById("login-form");
const errorMessage = document.getElementById("error-message");

form.addEventListener("submit", function (event) {
    event.preventDefault(); // Para que no se recargue la página

    const emailInput = document.getElementById("email").value.trim();
    const passwordInput = document.getElementById("password").value.trim();

    const userFound = users.find(user =>
        user.email === emailInput && user.password === passwordInput
    );

    if (userFound) {
        window.location.href = "dashboard.html";
    } else {
        errorMessage.textContent = "Username or password incorrect";
    }
});
