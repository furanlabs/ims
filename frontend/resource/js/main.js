import { API_URL } from './config.js';

// Helper function to read a cookie by name
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

// Check if user is already authenticated
async function checkAuth() {
    const token = getCookie("access_token");
    if (!token) return false;

    try {
        const response = await fetch(API_URL + "/auth/me", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        return response.ok; // true if token is valid
    } catch (err) {
        return false;
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    // If already logged in, redirect to myaccount page
    const isAuth = await checkAuth();
    if (isAuth) {
        window.location.href = "/frontend/resource/html/myaccount.html"; // <-- redirect
        return;
    }

    let isLogin = true;

    const toggleForm = document.getElementById('toggleForm');
    const formTitle = document.getElementById('form-title');
    const submitBtn = document.getElementById('submitBtn');
    const errorDiv = document.getElementById('error');
    const successDiv = document.getElementById('success');
    const usernameInput = document.getElementById('username');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password_hash');

    toggleForm.addEventListener('click', () => {
        isLogin = !isLogin;
        formTitle.innerText = isLogin ? "Login" : "Register";
        submitBtn.innerText = isLogin ? "Login" : "Register";
        toggleForm.innerText = isLogin
            ? "Don't have an account? Register"
            : "Already have an account? Login";

        usernameInput.style.display = isLogin ? "none" : "block";

        errorDiv.innerText = "";
        successDiv.innerText = "";
    });

    submitBtn.addEventListener('click', async () => {
        const username = usernameInput.value.trim();
        const email = emailInput.value.trim();
        const password_hash = passwordInput.value.trim();

        errorDiv.innerText = "";
        successDiv.innerText = "";

        if (!email || !password_hash || (!isLogin && !username)) {
            errorDiv.innerText = "Please fill in all fields.";
            return;
        }

        const endpoint = isLogin ? "/auth/login" : "/auth/register";

        const payload = isLogin
            ? { email, password_hash }
            : { username, email, password_hash };

        try {
            const response = await fetch(API_URL + endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (response.ok) {
                if (data.access_token) {
                    // Store token in a cookie
                    document.cookie = `access_token=${data.access_token}; path=/; Secure; SameSite=Strict`;
                    successDiv.innerText = isLogin ? "Login successful!" : "Registration successful! You can now log in.";

                    // Redirect to myaccount after successful login
                    if (isLogin) {
                        window.location.href = "/frontend/resource/html/myaccount.html";
                    }
                } else {
                    successDiv.innerText = data.message || "Success!";
                }
            } else {
                errorDiv.innerText = data.detail || data.message || "Something went wrong.";
            }
        } catch (err) {
            errorDiv.innerText = "Network error: " + err.message;
        }

        // Clear input fields
        usernameInput.value = "";
        emailInput.value = "";
        passwordInput.value = "";
    });
});
