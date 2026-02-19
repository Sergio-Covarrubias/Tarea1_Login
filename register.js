const registerForm = document.getElementById("register-form");
const errorMessage = document.getElementById("register-error");

registerForm.addEventListener("submit", function (event) {
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

    errorMessage.textContent = "";

    console.log("New User Registered:");
    console.log({
        email: email,
        password: password
    });
});
