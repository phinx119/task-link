// Manage user ---------------------------------------------------------------------------------------------------------
// Get user preferences from local storage
function getUserPreferences() {
    const storedPreferences = localStorage.getItem('userPreferences');
    const defaultPreferences = {
        userId: 0,
        username: 'John Doe',
        email: 'john@gmail.com',
        streak: 0
    };

    return storedPreferences ? JSON.parse(storedPreferences) : defaultPreferences;
}

// Set user preferences in localStorage
function setUserPreferences(userId, username, email, streak) {
    const preferences = {userId, username, email, streak};
    localStorage.setItem('userPreferences', JSON.stringify(preferences));
}

// Display user profile data
function displayProfileData() {
    const preferences = getUserPreferences();
    
    $('#username').text(preferences.username);
    $('#email').text(preferences.email);
}

// Check if user preferences are already set
const preferences = getUserPreferences();

// Call the function to display profile data
displayProfileData();

// Login ---------------------------------------------------------------------------------------------------------------
// ██       ██████   ██████  ██ ███    ██
// ██      ██    ██ ██       ██ ████   ██
// ██      ██    ██ ██   ███ ██ ██ ██  ██
// ██      ██    ██ ██    ██ ██ ██  ██ ██
// ███████  ██████   ██████  ██ ██   ████ 

function login() {
    // Display login dialog
    swal({
        title: 'Login',
        content: {
            element: 'div',
            attributes: {
                innerHTML: `
                    <div class="form__group field">
                        <input type="text" class="form__field" placeholder="Username" id="swal-input-username" required>
                        <label for="swal-input-username" class="form__label">Username</label>
                    </div>
                    <div class="form__group field">
                        <input type="password" class="form__field" placeholder="Password" id="swal-input-password" required>
                        <label for="swal-input-password" class="form__label">Password</label>
                    </div>
                    <br>
                    <b id="btn-register">Register</b>
                `,
            },
        },
        buttons: {
            cancel: 'Cancel',
            confirm: 'Save',
        },
        closeOnClickOutside: false,
    }).then((result) => {
        if (result && result.dismiss !== 'cancel') {
            // Get input value
            const username = document.getElementById('swal-input-username').value;
            const password = document.getElementById('swal-input-password').value;
            
            // Validate input
            if (username && password) {
                // Call API to login
                $.ajax({
                    url: `${apiUrl}Users/Login?username=${username}&password=${password}`,
                    type: 'GET',
                    contentType: 'application/json; charset=utf-8',
                    dataType: 'json',
                    success: function (result) {
                        //console.log(result);

                        // Set data to local storage and display them
                        setUserPreferences(result.userId, result.username, result.email, result.streak);
                        displayProfileData();

                        swal('Success', 'Login successful', 'success').then(() => {
                            window.location.reload();
                        });
                    },
                    error: function (xhr) {
                        //console.error(xhr.responseText);

                        swal('Error', `${xhr.responseText}`, 'error').then(() => {
                            // Reopen the login dialog if validation fails
                            login();
                        });
                    }
                });
            } else {
                swal('Error', 'Username and Password cannot be empty', 'error').then(() => {
                    // Reopen the login dialog if validation fails
                    login();
                });
            }
        }
    });
}

// Logout --------------------------------------------------------------------------------------------------------------
// ██       ██████   ██████   ██████  ██    ██ ████████
// ██      ██    ██ ██       ██    ██ ██    ██    ██
// ██      ██    ██ ██   ███ ██    ██ ██    ██    ██
// ██      ██    ██ ██    ██ ██    ██ ██    ██    ██
// ███████  ██████   ██████   ██████   ██████     ██    

function logout() {
    // Display logout dialog
    swal({
        title: 'Are you sure?',
        icon: 'warning',
        buttons: ['Cancel', 'Logout'],
        dangerMode: true,
    }).then((willLogout) => {
        if (willLogout) {
            // User clicked 'Logout'
            // Remove user preferences from local storage
            localStorage.removeItem('userPreferences');

            // Refresh the current page
            window.location.reload();
        }
    });
}
// ---------------------------------------------------------------------------------------------------------------------