import { API_URL } from './config.js';

// Helper to read a cookie
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

// Helper to delete a cookie
function deleteCookie(name) {
    document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
}

// Redirect to index.html if token is invalid or missing
async function validateToken() {
    const token = getCookie("access_token");
    if (!token) {
        window.location.href = "../../index.html";
        return null;
    }

    try {
        const response = await fetch(API_URL + "/auth/me", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            deleteCookie("access_token"); // clear invalid token
            window.location.href = "../../index.html";
            return null;
        }

        const data = await response.json();
        return data.user;

    } catch (err) {
        deleteCookie("access_token"); // clear on network error
        window.location.href = "../../index.html";
        return null;
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    const userProfile = await validateToken();
    if (!userProfile) return; // redirect has already happened

    // Update the DOM with the user info
    document.getElementById("profile-id").innerText = userProfile.id;
    document.getElementById("profile-username").innerText = userProfile.username;
    document.getElementById("profile-email").innerText = userProfile.email;

    // Logout button
    const logoutBtn = document.getElementById("logoutBtn");
    logoutBtn.addEventListener("click", () => {
        deleteCookie("access_token");
        window.location.href = "../../index.html";
    });
});
