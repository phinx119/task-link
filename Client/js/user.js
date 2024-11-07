// Manage user ---------------------------------------------------------------------------------------------------------
function manageUser() {
    $.ajax({
        url: `${apiUrl}Users/${preferences.userId}`,
        type: 'GET',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        success: function (result) {
            //console.log(result);

            // Set data to local storage and display them
            setUserPreferences(result.userId, result.username, result.email, result.checkTime, result.streak);
            displayProfileData();
        },
        error: function (xhr) {
            //console.error(xhr.responseText);

            swal('Error', `${xhr.responseText}`, 'error').then(() => {
                // Reopen the login dialog if validation fails
                login();
            });
        }
    });

    // Initial call
    scheduleResetCheckTimeAtMidnight();

    // Call the function to display profile data
    displayProfileData();
}

// Get user preferences from local storage
function getUserPreferences() {
    const storedPreferences = localStorage.getItem('userPreferences');
    const defaultPreferences = {
        userId: 0,
        username: 'John Doe',
        email: 'john@gmail.com',
        checkTime: 0,
        streak: 0
    };

    return storedPreferences ? JSON.parse(storedPreferences) : defaultPreferences;
}

// Set user preferences in localStorage
function setUserPreferences(userId, username, email, checkTime, streak) {
    const preferences = {userId, username, email, checkTime, streak};
    localStorage.setItem('userPreferences', JSON.stringify(preferences));
}

// Display user profile data
function displayProfileData() {
    const preferences = getUserPreferences();

    $('#username').text(preferences.username);
    $('#email').text(preferences.email);
    $('#streak').text(preferences.streak);
    displayStreak(preferences.streak);

}

function displayStreak(streak) {
    // Set color for streak level
    let gradientColor = '#acaaad'

    if (streak >= 300) {
        gradientColor = 'linear-gradient(#9b54ff, #c568ff, #e580f3)'
    } else if (streak >= 100) {
        gradientColor = 'linear-gradient(#f718f7, #fb4dc9, #f275b0)'
    } else if (streak >= 30) {
        gradientColor = 'linear-gradient(#ff4285, #ff5f3e, #fd9247)'
    } else if (streak >= 10) {
        gradientColor = 'linear-gradient(#fd3b05, #ff9412, #f5c33b)'
    } else if (streak >= 3) {
        gradientColor = 'linear-gradient(#ff7f09, #ffab14, #fad029)'
    }

    $('.streak').css({
        'background': gradientColor,
        '-webkit-background-clip': 'text',
        'color': 'transparent'
    });

    $('.bxs-hot').css({
        'background': gradientColor,
        '-webkit-background-clip': 'text',
        'color': 'transparent'
    });
}

function animationIncreaseStreak() {
    $('.bxs-hot').addClass('bx-tada');
    setTimeout(function () {
        $('.bxs-hot').removeClass('bx-tada');
    }, 900);

    $('#streak').addClass('increase');
    setTimeout(function () {
        $('#streak').removeClass('increase');
    }, 500);
}

// Reset Streak
function resetStreak() {
    // Call API to reset streak
    $.ajax({
        async: true,
        type: 'PUT',
        url: `${apiUrl}Users/ResetStreak/${preferences.userId}`,
        contentType: 'application/json',
        success: function (receivedData) {
            console.log(receivedData);

            // Set data to local storage and display them
            setUserPreferences(receivedData.userId, receivedData.username, receivedData.email, receivedData.checkTime, receivedData.streak);
            displayProfileData();
        },
        error: function (xhr) {
            //console.error(xhr.responseText);

            swal('Error', `${xhr.responseText}`, 'error');
        }
    });
}

// Check if user preferences are already set
let preferences = getUserPreferences();

// Calculate time until midnight
function scheduleResetCheckTimeAtMidnight() {
    const now = new Date();
    const nextMidnight = new Date(now);
    nextMidnight.setHours(24, 0, 0, 0);
    const timeUntilMidnight = nextMidnight - now;

    setTimeout(() => {
        resetStreak();
        scheduleResetCheckTimeAtMidnight();
    }, timeUntilMidnight);
}


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
                        setUserPreferences(result.userId, result.username, result.email, result.checkTime, result.streak);
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