// This file contains JavaScript code for client-side functionality, including user registration, login, and bicycle rental interactions.

document.addEventListener("DOMContentLoaded", () => {
    const signupForm = document.getElementById("signupForm");
    const loginForm = document.getElementById("loginForm");
    const rentForm = document.getElementById("rentForm");

    if (signupForm) {
        signupForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const email = signupForm.email.value.trim();
            const password = signupForm.password.value;

            try {
                await registerUser(email, password);
                alert("Registration successful! You can now log in.");
                window.location.href = "login.html";
            } catch (err) {
                alert("Registration failed: " + err.message);
            }
        });
    }

    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const email = loginForm.email.value.trim();
            const password = loginForm.password.value;

            try {
                await loginUser(email, password);
                window.location.href = "profile.html";
            } catch (err) {
                alert("Login failed: " + err.message);
            }
        });
    }

    if (rentForm) {
        rentForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const bikeId = rentForm.bikeId.value;
            const userId = getCurrentUserId(); // Assume this function retrieves the current user's ID

            try {
                await rentBike(userId, bikeId);
                alert("Bike rented successfully!");
                window.location.href = "bikes.html"; // Redirect to bikes page or rental confirmation
            } catch (err) {
                alert("Rental failed: " + err.message);
            }
        });
    }
});

// Function to register a user
async function registerUser(email, password) {
    // Call to Firebase or your backend to register the user
}

// Function to log in a user
async function loginUser(email, password) {
    // Call to Firebase or your backend to log in the user
}

// Function to rent a bike
async function rentBike(userId, bikeId) {
    // Call to your backend to process the bike rental
}

// Function to get the current user's ID
function getCurrentUserId() {
    // Logic to retrieve the current user's ID
}