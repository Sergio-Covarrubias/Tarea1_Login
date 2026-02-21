document.addEventListener("DOMContentLoaded", function () {

    const form = document.getElementById("register-form");
    const errorMessage = document.getElementById("register-error");

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        const email = document.getElementById("register-email").value.trim();
        const password = document.getElementById("register-password").value.trim();
        const confirmPassword = document.getElementById("register-confirm-password").value.trim();

        if (!email || !password || !confirmPassword) {
            errorMessage.textContent = "All fields are required";
            return;
        }

        if (password !== confirmPassword) {
            errorMessage.textContent = "Passwords do not match";
            return;
        }

        const newUser = { email, password };

        // Crear sesión automáticamente
        localStorage.setItem("user", JSON.stringify(newUser));

        console.log("Registered user:", newUser);

        window.location.href = "dashboard.html";
    });

});
