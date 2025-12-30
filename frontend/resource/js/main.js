let isLogin = true;
const toggleForm = document.getElementById('toggleForm');
const formTitle = document.getElementById('form-title');
const submitBtn = document.getElementById('submitBtn');
const errorDiv = document.getElementById('error');
const successDiv = document.getElementById('success');

// Simulate a simple user database
let users = [];

toggleForm.addEventListener('click', () => {
    isLogin = !isLogin;
    if(isLogin){
        formTitle.innerText = "Login";
        submitBtn.innerText = "Login";
        toggleForm.innerText = "Don't have an account? Register";
        errorDiv.innerText = "";
        successDiv.innerText = "";
    } else {
        formTitle.innerText = "Register";
        submitBtn.innerText = "Register";
        toggleForm.innerText = "Already have an account? Login";
        errorDiv.innerText = "";
        successDiv.innerText = "";
    }
});

submitBtn.addEventListener('click', () => {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    errorDiv.innerText = "";
    successDiv.innerText = "";

    if(username === "" || password === ""){
        errorDiv.innerText = "Please fill in all fields.";
        return;
    }

    if(isLogin){
        // Login logic
        const user = users.find(u => u.username === username && u.password === password);
        if(user){
            successDiv.innerText = `Welcome back, ${username}!`;
        } else {
            errorDiv.innerText = "Invalid username or password.";
        }
    } else {
        // Register logic
        const userExists = users.some(u => u.username === username);
        if(userExists){
            errorDiv.innerText = "Username already taken.";
        } else {
            users.push({username, password});
            successDiv.innerText = "Registration successful! You can now login.";
            isLogin = true;
            formTitle.innerText = "Login";
            submitBtn.innerText = "Login";
            toggleForm.innerText = "Don't have an account? Register";
        }
    }

    // Clear input fields
    document.getElementById('username').value = "";
    document.getElementById('password').value = "";
});
