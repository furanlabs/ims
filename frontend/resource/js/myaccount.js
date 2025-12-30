import { API_URL } from './config.js';

// --- Cookie helpers ---
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

function deleteCookie(name) {
    document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
}

// --- Token validation ---
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
            deleteCookie("access_token");
            window.location.href = "../../index.html";
            return null;
        }

        const data = await response.json();
        return data.user;

    } catch (err) {
        deleteCookie("access_token");
        window.location.href = "../../index.html";
        return null;
    }
}

// --- Main DOM logic ---
document.addEventListener("DOMContentLoaded", async () => {
    const token = getCookie("access_token");
    const userProfile = await validateToken();
    if (!userProfile) return;

    const idSpan = document.getElementById("profile-id");
    const usernameInput = document.getElementById("profile-username");
    const emailInput = document.getElementById("profile-email");
    const imgInput = document.getElementById("profile-img-link");
    const imgTag = document.getElementById("profile-img");
    const messageDiv = document.getElementById("message");
    const saveBtn = document.getElementById("saveBtn");
    const updateImgBtn = document.getElementById("updateImgBtn");
    const logoutBtn = document.getElementById("logoutBtn");

    // Populate fields
    idSpan.innerText = userProfile.id;
    usernameInput.value = userProfile.username;
    emailInput.value = userProfile.email;
    imgInput.value = userProfile.img_link || "";
    imgTag.src = userProfile.img_link || "";

    // Live image preview
    imgInput.addEventListener("input", () => {
        imgTag.src = imgInput.value || "";
    });

    // --- Logout ---
    logoutBtn.addEventListener("click", () => {
        deleteCookie("access_token");
        window.location.href = "../../index.html";
    });

    // --- Update username/email ---
    saveBtn.addEventListener("click", async () => {
        const updatedUsername = usernameInput.value.trim();
        const updatedEmail = emailInput.value.trim();

        if (!updatedUsername || !updatedEmail) {
            messageDiv.innerText = "Username and email cannot be empty.";
            messageDiv.style.color = "red";
            return;
        }

        try {
            const response = await fetch(API_URL + "/users/me", {
                method: "PATCH",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username: updatedUsername,
                    email: updatedEmail
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                messageDiv.innerText = errorData.detail || "Failed to update profile.";
                messageDiv.style.color = "red";
                return;
            }

            messageDiv.innerText = "Profile updated successfully!";
            messageDiv.style.color = "green";

        } catch (err) {
            messageDiv.innerText = "Network error: " + err.message;
            messageDiv.style.color = "red";
        }
    });

    // --- Update image separately ---
    updateImgBtn.addEventListener("click", async () => {
        const updatedImgLink = imgInput.value.trim();
        if (!updatedImgLink) {
            messageDiv.innerText = "Image link cannot be empty.";
            messageDiv.style.color = "red";
            return;
        }

        try {
            const response = await fetch(API_URL + "/users/me/img", {
                method: "PATCH",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ img_link: updatedImgLink })
            });

            if (!response.ok) {
                const errorData = await response.json();
                messageDiv.innerText = errorData.detail || "Failed to update image.";
                messageDiv.style.color = "red";
                return;
            }

            messageDiv.innerText = "Profile image updated!";
            messageDiv.style.color = "green";
            imgTag.src = updatedImgLink;

        } catch (err) {
            messageDiv.innerText = "Network error: " + err.message;
            messageDiv.style.color = "red";
        }
    });
});
