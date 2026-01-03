// Sign Up Handler
const signupForm = document.getElementById('signupForm');
if (signupForm) {
    signupForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const fullname = document.getElementById('fullname').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const message = document.getElementById('message');

        // Validate passwords match
        if (password !== confirmPassword) {
            message.style.color = 'red';
            message.textContent = 'Passwords do not match!';
            return;
        }

        // Get existing users from localStorage
        let users = JSON.parse(localStorage.getItem('users')) || [];

        // Check if email already exists
        if (users.some(user => user.email === email)) {
            message.style.color = 'red';
            message.textContent = 'Email already registered!';
            return;
        }

        // Create new user object
        const newUser = {
            id: Date.now(),
            fullname: fullname,
            email: email,
            phone: phone,
            password: password
        };

        // Add user to array
        users.push(newUser);

        // Save to localStorage
        localStorage.setItem('users', JSON.stringify(users));

        message.style.color = 'green';
        message.textContent = 'Account created successfully! Redirecting to login...';

        // Redirect after 2 seconds
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
    });
}

// Login Handler
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const message = document.getElementById('message');

        // Get users from localStorage
        let users = JSON.parse(localStorage.getItem('users')) || [];

        // Find user with matching email and password
        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            // Save current logged-in user
            localStorage.setItem('currentUser', JSON.stringify(user));
            message.style.color = 'green';
            message.textContent = 'Login successful! Redirecting...';

            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        } else {
            message.style.color = 'red';
            message.textContent = 'Invalid email or password!';
        }
    });
}

// Display user info if logged in
window.addEventListener('DOMContentLoaded', function() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser) {
        const userDisplay = document.getElementById('userDisplay');
        if (userDisplay) {
            userDisplay.textContent = `Welcome, ${currentUser.fullname}!`;
        }
    }
});

// Logout function
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}