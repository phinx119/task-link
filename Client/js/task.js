// Manage task ---------------------------------------------------------------------------------------------------------
function manageTask() {
    // Display task
    displayTasksByTimeUnit('All tasks', 'all');

    // Search task
    $('#search').on('keypress', function (e) {
        if (e.which === 13) {
            searchTask();
            console.log("Enter key pressed in the input field");
        }
    });


    // Add new task
    $('#add-new-task').on('click', function (e) {
        addNewTask();
    })
}

let taskUrl = 'http://localhost:5000/api/Tasks/';

// Show task ------------------------------------------------------------------------------------------------------
//  ██████  ███████ ████████
// ██       ██         ██
// ██   ███ █████      ██
// ██    ██ ██         ██
//  ██████  ███████    ██

const taskContainer = document.getElementById('');

// Check if a date is today
const isToday = (dateString) => {
    const today = new Date();
    const date = new Date(dateString);
    return date.toDateString() === today.toDateString();
};

function displayTasks(html, receivedData) {
    console.log(receivedData);
    if (receivedData == null || receivedData.length === 0) {
        swal('Info', 'No task found', 'info');
    } else {
        $.each(receivedData, function (index, task) {
            const dueDate = new Date(task.dueDate)

            html += `                
            <div class="card align" data-task-id="${task.taskId}">
                <input type="checkbox" name="task" id="${task.taskId}">
                <div>
                    <span>${task.title}</span>
                    <p id="taskDate" class="date ${isToday(task.dueDate) ? 'today' : ''}">
                        ${isToday(task.dueDate) ? 'Today' : '<i class="bx bx-calendar-alt"></i> ' + dueDate.toDateString()} - ${dueDate.toTimeString()}
                    </p>
                </div>
                <i class="bx bx-info-circle" onclick="updateTask(${task.taskId})"></i>
                <i class="bx bx-trash-alt" onclick="deleteTask(${task.taskId})"></i>
            </div>
        `;
        });
    }
    $('#task-container').html(html);

    showDivisionsWithDelay();
}

// Display task by time unit
function displayTasksByTimeUnit(timeUnit, url) {
    $('#header_title').text(timeUnit);
    let tasksHtml = '';

    // Call api to get tasks
    $.ajax({
        async: true,
        type: 'GET',
        url: taskUrl + `${preferences.userId}/${url}`,
        dataType: 'json',
        success: function (receivedData) {
            displayTasks(tasksHtml, receivedData);
        },
        error: function (err) {
            console.log(err);
            swal('Error', `${err.responseText}`, 'error');
        }
    });
}

// Display task by task list
function displayTasksByTaskList(listId, listName) {
    $('#header_title').text(listName);
    let tasksHtml = '';
    
    // Call api to get tasks
    $.ajax({
        async: true,
        type: 'GET',
        url: taskUrl + `${listId}`,
        dataType: 'json',
        success: function (receivedData) {
            displayTasks(tasksHtml, receivedData);
        },
        error: function (err) {
            console.log(err);
            swal('Error', `${err.responseText}`, 'error');
        }
    });
}

// Search task ---------------------------------------------------------------------------------------------------------
// ███████ ███████  █████  ██████   ██████ ██   ██
// ██      ██      ██   ██ ██   ██ ██      ██   ██
// ███████ █████   ███████ ██████  ██      ███████
//      ██ ██      ██   ██ ██   ██ ██      ██   ██
// ███████ ███████ ██   ██ ██   ██  ██████ ██   ██

function searchTask() {
    const searchInput = document.getElementById('search');
    const searchText = searchInput.value.trim().toLowerCase();
    let tasksHtml = '';

    // Call api to search task
    $.ajax({
        async: true,
        type: 'GET',
        url: taskUrl,
        dataType: 'json',
        success: function (receivedData) {
            console.log(receivedData);
            let count = 0;
            $.each(receivedData, function (index, task) {
                if (task.title.toLowerCase().includes(searchText.toLowerCase())) {
                    count++;
                    const dueDate = new Date(task.dueDate)
                    tasksHtml += `                
                        <div class="card align" data-task-id="${task.taskId}">
                            <input type="checkbox" name="task" id="${task.taskId}">
                            <div>
                                <span>${task.title}</span>
                                <p id="taskDate" class="date ${isToday(task.dueDate) ? 'today' : ''}">
                                    ${isToday(task.dueDate) ? 'Today' : '<i class="bx bx-calendar-alt"></i> ' + dueDate.toDateString()} - ${dueDate.toTimeString()}
                                </p>
                            </div>
                            <i class="bx bx-info-circle" onclick="updateTask(${task.taskId})"></i>
                            <i class="bx bx-trash-alt" onclick="deleteTask(${task.taskId})"></i>
                        </div>
                    `;
                }
            });
            if (count === 0) {
                swal('Info', 'No task found', 'info');
            }
            searchInput.value = '';
            $('#task-container').html(tasksHtml);

            showDivisionsWithDelay();
        },
        error: function (err) {
            console.log(err);
            swal('Error', `${err.responseText}`, 'error');
        }
    });
}

// ---------------------------------------------------------------------------------------------------------------------

let currentDateTime = new Date();
currentDateTime.setHours(currentDateTime.getHours() + 7);
let formattedCurrentDateTime = currentDateTime.toISOString().slice(0, 16);

// Load list to option input
let listOption = '<option>My List</option>'

// Load list to repeat input
let repeatOption = '<option>Never</option>'

// Create new task -----------------------------------------------------------------------------------------------------
// ██████   ██████  ███████ ████████
// ██   ██ ██    ██ ██         ██
// ██████  ██    ██ ███████    ██
// ██      ██    ██      ██    ██
// ██       ██████  ███████    ██

function addNewTask() {
    swal({
        title: 'Create new task',
        content: {
            element: 'div',
            attributes: {
                innerHTML: `
                    <div class='form__group field'>
                        <input type='text' class='form__field' placeholder='Title' id='swal-input-title' required=''>
                        <label for='swal-input-title' class='form__label'>Title</label>
                    </div>
                    <div class='form__group field'>
                        <input type='text' class='form__field' placeholder='Note' id='swal-input-note'>
                        <label for='swal-input-note' class='form__label'>Note</label>
                    </div>
                    <div style='display: flex; width: 95%'>
                        <div class='form__group field'>
                            <select class='form__field' id='swal-input-list'>
                                ${listOption}
                            </select>
                            <label for='swal-input-list' class='form__label'>List</label>
                        </div>
                        <div class='form__group field'>
                            <select class='form__field' id='swal-input-priority'>
                                <option value='Low'>Low</option>
                                <option value='Medium'>Medium</option>
                                <option value='High'>High</option>
                            </select>
                            <label for='swal-input-priority' class='form__label'>Priority</label>
                        </div>          
                    </div>
                    <div class='form__group field'>
                        <input type='datetime-local' class='form__field' placeholder='Due Date' id='swal-input-duedate' value='${formattedCurrentDateTime}'>
                        <label for='swal-input-duedate' class='form__label'>Due Date</label>
                    </div>
                    <div class='form__group field'>
                        <select class='form__field' id='swal-input-repeat'>
                        ${repeatOption}
                        </select>
                        <label for='swal-input-repeat' class='form__label'>List</label>
                    </div>
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
            const title = document.getElementById('swal-input-title').value;
            const note = document.getElementById('swal-input-note').value;
            const list = document.getElementById('swal-input-list').value;
            const priority = document.getElementById('swal-input-priority').value;
            const duedate = document.getElementById('swal-input-duedate').value;
            const repeat = document.getElementById('swal-input-repeat').value;

            if (title && note && list && priority && duedate && repeat) {
                // Call API to login

                swal('Success', 'Create task successful', 'success');
            } else {
                swal('Error', 'Input cannot be empty', 'error').then(() => {
                    // Reopen the login dialog if validation fails
                    addNewTask()
                });
            }
        }
    });
};

// Update task ---------------------------------------------------------------------------------------------------------
// ██████  ██    ██ ████████
// ██   ██ ██    ██    ██
// ██████  ██    ██    ██
// ██      ██    ██    ██
// ██       ██████     ██

function updateTask(taskId) {
    swal({
        title: 'Update task',
        content: {
            element: 'div',
            attributes: {
                innerHTML: `
                    <div class='form__group field'>
                        <input type='text' class='form__field' placeholder='Title' id='swal-input-title' required=''>
                        <label for='swal-input-title' class='form__label'>Title</label>
                    </div>
                    <div class='form__group field'>
                        <input type='text' class='form__field' placeholder='Note' id='swal-input-note'>
                        <label for='swal-input-note' class='form__label'>Note</label>
                    </div>
                    <div style='display: flex; width: 95%'>
                        <div class='form__group field'>
                            <select class='form__field' id='swal-input-list'>
                                ${listOption}
                            </select>
                            <label for='swal-input-list' class='form__label'>List</label>
                        </div>
                        <div class='form__group field'>
                            <select class='form__field' id='swal-input-priority'>
                                <option value='Low'>Low</option>
                                <option value='Medium'>Medium</option>
                                <option value='High'>High</option>
                            </select>
                            <label for='swal-input-priority' class='form__label'>Priority</label>
                        </div>          
                    </div>
                    <div class='form__group field'>
                        <input type='datetime-local' class='form__field' placeholder='Due Date' id='swal-input-duedate' value='${formattedCurrentDateTime}'>
                        <label for='swal-input-duedate' class='form__label'>Due Date</label>
                    </div>
                    <div class='form__group field'>
                        <select class='form__field' id='swal-input-repeat'>
                        ${repeatOption}
                        </select>
                        <label for='swal-input-repeat' class='form__label'>List</label>
                    </div>
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
            const title = document.getElementById('swal-input-title').value;
            const note = document.getElementById('swal-input-note').value;
            const list = document.getElementById('swal-input-list').value;
            const priority = document.getElementById('swal-input-priority').value;
            const duedate = document.getElementById('swal-input-duedate').value;
            const repeat = document.getElementById('swal-input-repeat').value;

            if (title && note && list && priority && duedate && repeat) {
                // Call API to login

                swal('Success', 'Create task successful', 'success');
            } else {
                swal('Error', 'Input cannot be empty', 'error').then(() => {
                    // Reopen the login dialog if validation fails
                    updateTask(taskId);
                });
            }
        }
    });
};

// Attach event listener to the parent container
function updateTaskStatus() {
    // Handle checkbox change
    if (event.target.type === 'checkbox' && event.target.name === 'task') {
        const taskId = event.target.id;
        const task = tasks.find((task) => task.id.toString() === taskId);
        if (task) {
            task.completed = event.target.checked;
            localStorage.setItem(task.id, JSON.stringify(task));
            const marker = event.target.nextElementSibling;
            if (marker.classList.contains('marker')) {
                marker.classList.toggle('done', task.completed);
            }
        }
    }

    // Handle update icon click
    if (event.target.classList.contains('bx-info-circle')) {
        const taskId = event.target.closest('.card').dataset.taskId;
        updateTask(taskId);
    }

    if (event.target.classList.contains('date')) {
        const taskId = event.target.closest('.card').dataset.taskId;
        const task = tasks.find((task) => task.id.toString() === taskId);

        if (task) {
            // Trigger the date picker
            document.getElementById('hiddenDatePicker').showPicker();

            // Listen for changes in the date picker
            document.getElementById('hiddenDatePicker').addEventListener('change', function () {
                const selectedDate = this.value;

                // Ask for confirmation before updating the date
                swal({
                    title: 'Are you sure?',
                    text: `Update the due date from ${task.date} to ${selectedDate}.`,
                    icon: 'info',
                    buttons: ['Cancel', 'Yes'],
                }).then((willChangeDate) => {
                    if (willChangeDate) {
                        // Update the date in local storage
                        task.date = selectedDate;
                        localStorage.setItem(taskId, JSON.stringify(task));

                        // Refresh the display
                        displayTasks(currentSection);
                    } else {
                        // Reset the date picker if the user cancels
                        document.getElementById('hiddenDatePicker').value = '';
                    }
                });
            });
        }
    }
}

// Delete task ---------------------------------------------------------------------------------------------------------
// ██████  ███████ ██      ███████ ████████ ███████
// ██   ██ ██      ██      ██         ██    ██
// ██   ██ █████   ██      █████      ██    █████
// ██   ██ ██      ██      ██         ██    ██
// ██████  ███████ ███████ ███████    ██    ███████

function deleteTask(taskId) {
    if (event.target.classList.contains('bx-trash-alt')) {
        const taskId = event.target.closest('.card').dataset.taskId;
        swal({
            title: 'Delete current task?',
            text: 'Once deleted, you will not be able to recover this task!',
            icon: 'warning',
            buttons: true,
            dangerMode: true,
        }).then((willDelete) => {
            if (willDelete) {
                localStorage.removeItem(taskId);
                event.target.closest('.card').remove();
                swal('Poof! Your task has been deleted!', {
                    icon: 'success',
                });
            }
        });
    }
}

// Responsive ----------------------------------------------------------------------------------------------------------
const burgerIcon = document.getElementById('burgerIcon');
const containerLeft = document.getElementById('containerLeft');

var toggleMenu = () => {
    containerLeft.classList.toggle('v-class');
    burgerIcon.classList.toggle('cross');
};

burgerIcon.addEventListener('click', toggleMenu);

document.body.addEventListener('click', (event) => {
    const target = event.target;

    // Check if the clicked element is not inside the containerLeft
    if (!containerLeft.contains(target) && !burgerIcon.contains(target)) {
        containerLeft.classList.remove('v-class');
        burgerIcon.classList.remove('cross');
    }
});
// ---------------------------------------------------------------------------------------------------------------------