// Manage task ---------------------------------------------------------------------------------------------------------
function manageTask() {
    // Display task
    displayTasksByTimeUnit('All tasks', 'all');

    // Handle search task by title
    $('#search').on('keypress', function (e) {
        if (e.which === 13) {
            searchTask();
        }
    });

    // Create sample sending data to create new task
    let requestBody = {
        listId: null,
        title: '',
        note: '',
        dueDate: null,
        repeatId: null,
        priority: null,
        status: null,
    };

    // Handle create new task
    $('#add-new-task').on('click', function () {
        addNewTask(requestBody);
    });
}

let taskLists = {};

function getTaskListList() {
    // Call API to get user by id
    $.getJSON(`${apiUrl}/TaskLists/${preferences.userId}`, function (response) {
        //console.log(response);

        taskLists = {};
        $.each(response, function (index, taskList) {
            taskLists[taskList.listId] = taskList.listName;
        });        
    }).fail(function (xhr) {
        //console.error(xhr.responseText);
        swal('Error', `${xhr.responseText}`, 'error').then(() => {
            // Reopen the login dialog if validation fails
            getTaskListList()
        });
    });
}

let repeats = {};

function getRepeatList() {
    // Call API to get user by id
    $.getJSON(`${apiUrl}/Repeats`, function (response) {
        //console.log(response);

        repeats = {};
        $.each(response, function (index, repeat) {
            repeats[repeat.repeatId] = repeat.repeatName;
        });
    }).fail(function (xhr) {
        //console.error(xhr.responseText);
        swal('Error', `${xhr.responseText}`, 'error').then(() => {
            // Reopen the login dialog if validation fails
            getRepeatList();
        });
    });
}

// Display task ------------------------------------------------------------------------------------------------------
//  ██████  ███████ ████████
// ██       ██         ██
// ██   ███ █████      ██
// ██    ██ ██         ██
//  ██████  ███████    ██

// Check if a date is today
function isToday(dateString) {
    const today = new Date();
    const date = new Date(dateString);
    return date.toDateString() === today.toDateString();
}

// Check if a date is today
function isTooLate(dateString) {
    const today = new Date();
    const date = new Date(dateString);
    return date < today;
}

function formatDate(date) {
    const options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        weekday: 'short'
    };
    const formattedDate = isToday(date) ? 'Today' : new Intl.DateTimeFormat('en-GB', options).format(date).replace(',', '');
    const formattedTime = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;

    return `${formattedDate} - ${formattedTime}`;
}

function displayPriority(priority) {
    if (priority === 'Low') return '!';
    if (priority === 'Medium') return '!!';
    if (priority === 'High') return '!!!';
}

// Display tasks and set data into task card
function displayTasks(html, response) {
    //console.log(response);

    if (response == null || response.length === 0) {
        swal('Info', 'No task found', 'info');
    } else {
        $.each(response, function (index, task) {
            const dueDate = new Date(task.dueDate)

            if (isTooLate(dueDate)) {
                preferences.checkTime = 0;
                resetStreak();
                animationUpdateStreak()
            }
            
            html += `                
                <div class="card align">
                    <input type="checkbox" name="task" onclick="updateTaskDueDate(${task.taskId})">
                    <div>
                        <span><span class="priority">${displayPriority(task.priority)}</span> ${task.title}</span>
                        <p id="taskDate" class="date ${isToday(task.dueDate) ? 'today' : ''} ${isTooLate(task.dueDate) ? 'too-late' : ''}">                        
                            <i class="bx bx-calendar-alt"></i> ${taskLists[task.listId]} - ${formatDate(dueDate)}, ${repeats[task.repeatId]}
                        </p>
                    </div>
                    <i class="bx bx-info-circle" onclick="updateTask(${task.taskId})"></i>
                    <i class="bx bx-trash-alt" onclick="deleteTask(${task.taskId})"></i>
                </div>
            `;
        });
    }

    // Set html
    $('#task-container').html(html);

    // Set fade animation
    showDivisionsWithDelay();
}

// Display task by time unit (day, week, month, all time)
function displayTasksByTimeUnit(timeUnit, timeUnitUrl) {
    // Set header title
    $('#header_title').html(timeUnit);
    $('#additional-info').html(timeUnitUrl);

    // Clear search bar
    $('#search').val('');

    // Set variable
    let tasksHtml = '';

    // Call API to get tasks by time unit
    $.ajax({
        async: true,
        type: 'GET',
        url: `${apiUrl}/Tasks/${preferences.userId}/${timeUnitUrl}`,
        dataType: 'json',
        success: function (response) {
            //console.log(response);

            // Display task if response ok
            displayTasks(tasksHtml, response);
        },
        error: function (xhr) {
            //console.error(xhr.responseText);

            swal('Error', `${xhr.responseText}`, 'error');
        }
    });
}

// Display task by task list
function displayTasksByTaskList(listId, listName) {
    // Set header title
    $('#header_title').html(listName);
    $('#additional-info').html(listId);

    // Clear search bar
    $('#search').val('');

    // Set variable
    let tasksHtml = '';

    // Call api to get tasks
    $.ajax({
        async: true,
        type: 'GET',
        url: `${apiUrl}/Tasks/ListId/${listId}`,
        dataType: 'json',
        success: function (response) {
            //console.log(response);

            // Display task if response ok
            displayTasks(tasksHtml, response);
        },
        error: function (xhr) {
            //console.error(xhr.responseText);

            swal('Error', `${xhr.responseText}`, 'error');
        }
    });
}

// Reload task list after modify
function reloadTaskList() {
    const listName = $('#header_title').html();
    const additionalInfo = $('#additional-info').html();

    if (listName === 'Result') {
        const searchInput = $('#search').val().trim().toLowerCase();
        searchTask(searchInput);
    } else if (listName === 'Today' || listName === 'This week' || listName === 'This month' || listName === 'All tasks') {
        displayTasksByTimeUnit(listName, additionalInfo);
    } else {
        displayTasksByTaskList(additionalInfo, listName);
    }

}

// Search task ---------------------------------------------------------------------------------------------------------
// ███████ ███████  █████  ██████   ██████ ██   ██
// ██      ██      ██   ██ ██   ██ ██      ██   ██
// ███████ █████   ███████ ██████  ██      ███████
//      ██ ██      ██   ██ ██   ██ ██      ██   ██
// ███████ ███████ ██   ██ ██   ██  ██████ ██   ██

function searchTask(searchInput) {
    // Set header title
    $('#header_title').html('Result');

    // Set variable
    let searchText = !searchInput ? $('#search').val().trim().toLowerCase() : searchInput;
    let tasksHtml = '';
    let count = 0;

    // Call api to search task
    $.ajax({
        async: true,
        type: 'GET',
        url: `${apiUrl}/Tasks`,
        dataType: 'json',
        success: function (response) {
            //console.log(response);

            $.each(response, function (index, task) {
                if (task.title.toLowerCase().includes(searchText.toLowerCase())) {
                    count++; // Increase number of task
                    // Parse due date to date type
                    const dueDate = new Date(task.dueDate)

                    tasksHtml += `                
                        <div class="card align">
                            <input type="checkbox" name="task" onclick="updateTaskDueDate(${task.taskId})">
                            <div>
                                <span>${task.title}</span>
                                <p id="taskDate" class="date ${isToday(task.dueDate) ? 'today' : ''}" ${isTooLate(task.dueDate) ? 'too-late' : ''}">
                                    ${isToday(task.dueDate) ? 'Today' : '<i class="bx bx-calendar-alt"></i> ' + dueDate.toDateString()} - ${dueDate.toTimeString()}
                                </p>
                            </div>
                            <i class="bx bx-info-circle" onclick="updateTask(${task.taskId})"></i>
                            <i class="bx bx-trash-alt" onclick="deleteTask(${task.taskId})"></i>
                        </div>
                    `;
                }
            });

            // Check if not found
            if (count === 0) {
                swal('Info', 'No task found', 'info');
            }

            // Set html
            $('#task-container').html(tasksHtml);

            // Set fade animation
            showDivisionsWithDelay();
        },
        error: function (xhr) {
            //console.error(xhr.responseText);

            swal('Error', `${xhr.responseText}`, 'error');
        }
    });
}

// ---------------------------------------------------------------------------------------------------------------------

// Load list to option input
let listOption;

function loadListOption(listId) {
    // Set to empty
    listOption = '';

    // Call API to get task lists and set to option tab
    $.ajax({
        async: true,
        type: 'GET',
        url: `${apiUrl}/TaskLists/${preferences.userId}`,
        dataType: 'json',
        success: function (response) {
            //console.log(response);

            if (response == null || response.length === 0) {
                swal('Info', 'No task list found', 'info');
            } else {
                $.each(response, function (index, taskList) {
                    listOption += `<option value="${taskList.listId}" ${taskList.listId === listId ? 'selected' : ''}>${taskList.listName}</option>`;
                });
            }
        },
        error: function (xhr) {
            //console.error(xhr.responseText);

            swal('Error', `${xhr.responseText}`, 'error');
        }
    });
}

// Load list to repeat input
let repeatOption;

function loadRepeatOption(repeatId) {
    // Set to empty
    repeatOption = '';

    // Call API to get repeat list and set to option tab
    $.ajax({
        async: true,
        type: 'GET',
        url: `${apiUrl}/Repeats`,
        dataType: 'json',
        success: function (response) {
            //console.log(response);

            if (response == null || response.length === 0) {
                swal('Info', 'No repeat option found', 'info');
            } else {
                $.each(response, function (index, repeat) {
                    repeatOption += `<option value="${repeat.repeatId}" ${repeat.repeatId === repeatId ? 'selected' : ''}>${repeat.repeatName}</option>`;
                });
            }
        },
        error: function (xhr) {
            //console.error(xhr.responseText);

            swal('Error', `${xhr.responseText}`, 'error');
        }
    });
}

// Get status base on due date
function getStatus(dueDateString) {
    // Set status ('Pending', 'In Progress', 'Completed') base on due date
    const currentDateTime = new Date();
    let dueDate = new Date(dueDateString);
    return dueDate < currentDateTime ? 'Pending' : 'In Progress';
}

// Create new task -----------------------------------------------------------------------------------------------------
// ██████   ██████  ███████ ████████
// ██   ██ ██    ██ ██         ██
// ██████  ██    ██ ███████    ██
// ██      ██    ██      ██    ██
// ██       ██████  ███████    ██

function addNewTask(requestBody) {
    // Format current date and time to set input value
    const currentDateTime = new Date();
    currentDateTime.setHours(currentDateTime.getHours() + 7);
    let formattedCurrentDateTime = currentDateTime.toISOString().slice(0, 16);

    let listId = 1;
    let additionalInfo = $('#additional-info').html();
    if (!isNaN(additionalInfo)) {
        listId = parseInt(additionalInfo, 10);
    }

    // Load and set selected to option
    loadListOption(requestBody.listId == null ? listId : requestBody.listId);
    loadRepeatOption(requestBody.repeatId == null ? 1 : requestBody.repeatId);

    // Display create new task dialog with delay
    setTimeout(function () {
        swal({
            title: 'Create new task',
            content: {
                element: 'div',
                attributes: {
                    innerHTML: `
                        <div class="form__group field">
                            <input type="text" class="form__field" placeholder="Title" id="swal-input-title" value="${requestBody.title}" required>
                            <label for="swal-input-title" class="form__label">Title</label>
                        </div>
                        <div class="form__group field">
                            <input type="text" class="form__field" placeholder="Note" id="swal-input-note" value="${requestBody.note}">
                            <label for="swal-input-note" class="form__label">Note</label>
                        </div>
                        <div style="display: flex; width: 95%">
                            <div class="form__group field">
                                <select class="form__field" id="swal-input-list">
                                    ${listOption}
                                </select>
                                <label for="swal-input-list" class="form__label">List</label>
                            </div>
                            <div class="form__group field">
                                <select class="form__field" id="swal-input-priority">
                                    <option value="Low" ${requestBody.priority === 'Low' ? 'selected' : ''}>Low</option>
                                    <option value="Medium" ${requestBody.priority === 'Medium' ? 'selected' : ''}>Medium</option>
                                    <option value="High" ${requestBody.priority === 'High' ? 'selected' : ''}>High</option>
                                </select>
                                <label for="swal-input-priority" class="form__label">Priority</label>
                            </div>          
                        </div>
                        <div class="form__group field">
                            <input type="datetime-local" class="form__field" placeholder="Due Date" id="swal-input-due-date" value="${requestBody.dueDate == null ? formattedCurrentDateTime : requestBody.dueDate}" required>
                            <label for="swal-input-due-date" class="form__label">Due Date</label>
                        </div>
                        <div class="form__group field">
                            <select class="form__field" id="swal-input-repeat">
                            ${repeatOption}
                            </select>
                            <label for="swal-input-repeat" class="form__label">List</label>
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
                // Get input value
                const title = document.getElementById('swal-input-title').value;
                const note = document.getElementById('swal-input-note').value;
                const list = document.getElementById('swal-input-list').value;
                const priority = document.getElementById('swal-input-priority').value;
                const dueDateString = document.getElementById('swal-input-due-date').value;
                const repeat = document.getElementById('swal-input-repeat').value;

                // Validate input
                if (title && list && priority && dueDateString && repeat) {
                    // Call API to create new task
                    let requestBody = {
                        listId: list,
                        title: title,
                        note: note,
                        dueDate: dueDateString,
                        repeatId: repeat,
                        priority: priority,
                        status: getStatus(dueDateString),
                    };
                    $.ajax({
                        async: true,
                        type: 'POST',
                        url: `${apiUrl}/Tasks`,
                        contentType: 'application/json',
                        data: JSON.stringify(requestBody),
                        success: function (response) {
                            //console.log(response);

                            // Reload tasks if response ok
                            reloadTaskList();
                            swal('Success', 'Create task successful', 'success');
                        },
                        error: function (xhr) {
                            //console.error(xhr.responseText);

                            swal('Error', `${xhr.responseText}`, 'error').then(() => {
                                // Reopen the create dialog if response error
                                addNewTask(requestBody);
                            });
                        }
                    });
                } else {
                    swal('Error', 'Input cannot be empty', 'error').then(() => {
                        // Reopen the create dialog if validation fails
                        addNewTask(requestBody)
                    });
                }
            }
        });
    }, 100);
}

// Update task ---------------------------------------------------------------------------------------------------------
// ██████  ██    ██ ████████
// ██   ██ ██    ██    ██
// ██████  ██    ██    ██
// ██      ██    ██    ██
// ██       ██████     ██

function updateTask(taskId) {
    // Call API to get task by id
    $.ajax({
        async: true,
        type: 'GET',
        url: `${apiUrl}/Tasks/TaskId/${taskId}`,
        dataType: 'json',
        success: function (response) {
            //console.log(response);

            // Load and set selected to option
            loadListOption(response.listId);
            loadRepeatOption(response.repeatId);

            // Display update task dialog with delay
            setTimeout(function () {
                swal({
                    title: 'Update task',
                    content: {
                        element: 'div',
                        attributes: {
                            innerHTML: `
                                <div class="form__group field">
                                    <input type="text" class="form__field" placeholder="Title" id="swal-input-title" value="${response.title}" required>
                                    <label for="swal-input-title" class="form__label">Title</label>
                                </div>
                                <div class="form__group field">
                                    <input type="text" class="form__field" placeholder="Note" id="swal-input-note" value="${response.note}">
                                    <label for="swal-input-note" class="form__label">Note</label>
                                </div>
                                <div style="display: flex; width: 95%">
                                    <div class="form__group field">
                                        <select class="form__field" id="swal-input-list">
                                            ${listOption}
                                        </select>
                                        <label for="swal-input-list" class="form__label">List</label>
                                    </div>
                                    <div class="form__group field">
                                        <select class="form__field" id="swal-input-priority">
                                            <option value="Low" ${response.priority === 'Low' ? 'selected' : ''}>Low</option>
                                            <option value="Medium" ${response.priority === 'Medium' ? 'selected' : ''}>Medium</option>
                                            <option value="High" ${response.priority === 'High' ? 'selected' : ''}>High</option>
                                        </select>
                                        <label for="swal-input-priority" class="form__label">Priority</label>
                                    </div>          
                                </div>
                                <div class="form__group field">
                                    <input type="datetime-local" class="form__field" placeholder="Due Date" id="swal-input-due-date" value="${response.dueDate}" required>
                                    <label for="swal-input-due-date" class="form__label">Due Date</label>
                                </div>
                                <div class="form__group field">
                                    <select class="form__field" id="swal-input-repeat">
                                    ${repeatOption}
                                    </select>
                                    <label for="swal-input-repeat" class="form__label">List</label>
                                </div>
                            `,
                        },
                    },
                    buttons: {
                        cancel: 'Cancel',
                        confirm: 'Save',
                    },
                    closeOnClickOutside: true,
                }).then((result) => {
                    if (result && result.dismiss !== 'cancel') {
                        // Get input value
                        const title = document.getElementById('swal-input-title').value;
                        const note = document.getElementById('swal-input-note').value;
                        const list = document.getElementById('swal-input-list').value;
                        const priority = document.getElementById('swal-input-priority').value;
                        const dueDateString = document.getElementById('swal-input-due-date').value;
                        const repeat = document.getElementById('swal-input-repeat').value;

                        // Validate input
                        if (title && list && priority && dueDateString && repeat) {
                            // Set input value into sending data
                            let requestBody = {
                                listId: list,
                                title: title,
                                note: note,
                                dueDate: dueDateString,
                                repeatId: repeat,
                                priority: priority,
                                status: getStatus(dueDateString),
                            };

                            // Call API to update task
                            $.ajax({
                                async: true,
                                type: 'PUT',
                                url: `${apiUrl}/Tasks/${response.taskId}`,
                                contentType: 'application/json',
                                data: JSON.stringify(requestBody),
                                success: function (response) {
                                    //console.log(response);

                                    // Reload tasks if response ok
                                    reloadTaskList();
                                    swal('Success', 'Update task successful', 'success');
                                },
                                error: function (xhr) {
                                    //console.error(xhr.responseText);

                                    swal('Error', `${xhr.responseText}`, 'error').then(() => {
                                        // Reopen the update dialog if response error
                                        updateTask(taskId);
                                    });
                                }
                            });
                        } else {
                            swal('Error', 'Input cannot be empty', 'error').then(() => {
                                // Reopen the update dialog if validation fails
                                updateTask(taskId);
                            });
                        }
                    }
                });
            }, 100);
        },
        error: function (xhr) {
            //console.error(xhr.responseText);

            swal('Error', `${xhr.responseText}`, 'error');
        }
    });
}

// Update status due date and status when click the checkbox
function updateTaskDueDate(taskId) {
    // Call API to get task by id
    $.ajax({
        async: true,
        type: 'GET',
        url: `${apiUrl}/Tasks/TaskId/${taskId}`,
        dataType: 'json',
        success: function (response) {
            //console.log(response);

            // Set variable
            let taskId = response.taskId;
            let currentDate = new Date();

            // Set new due date base on repeat type
            let dueDate = new Date(response.dueDate);
            let newDueDate = new Date(response.dueDate);
            newDueDate.setHours(currentDate.getHours() + 7); // Set it to GMT+7

            // Call API to set new due date
            $.ajax({
                async: true,
                type: 'GET',
                url: `${apiUrl}/Repeats/${response.repeatId}`,
                contentType: 'application/json',
                success: function (response) {
                    //console.log(response);

                    // Update due date to the next closest future occurrence base on repeat time unit
                    do {
                        switch (response.unit) {
                            case 'Day':
                                newDueDate.setDate(newDueDate.getDate() + response.duration);
                                break;
                            case 'Month':
                                newDueDate.setMonth(newDueDate.getMonth() + response.duration);
                                break;
                            case 'Year':
                                newDueDate.setFullYear(newDueDate.getFullYear() + response.duration);
                                break;
                        }
                    } while (newDueDate <= currentDate)

                    // Call API to update task due date
                    $.ajax({
                        async: true,
                        type: 'PUT',
                        url: `${apiUrl}/Tasks/DueDate/${taskId}?newDueDate=${newDueDate.toISOString().slice(0, 16)}`,
                        contentType: 'application/json',
                        success: function (response) {
                            //console.log(response);

                            if (preferences.checkTime === 0 && dueDate.getDate() === currentDate.getDate()) {
                                // Call API to update check time
                                $.ajax({
                                    async: true,
                                    type: 'PUT',
                                    url: `${apiUrl}/Users/CheckTime/${preferences.userId}`,
                                    contentType: 'application/json',
                                    success: function (response) {
                                        //console.log(response);

                                        preferences.checkTime = 1;

                                        // Call API to update streak
                                        $.ajax({
                                            async: true,
                                            type: 'PUT',
                                            url: `${apiUrl}/Users/UpdateStreak/${preferences.userId}`,
                                            contentType: 'application/json',
                                            success: function (response) {
                                                //console.log(response);

                                                // Set data to local storage and display them
                                                setUserPreferences(response.userId, response.username, response.email, response.checkTime, response.streak);
                                                displayProfileData();

                                                animationUpdateStreak()

                                                // Reload tasks if response ok
                                                reloadTaskList();
                                                swal('Success', `Update streak - ${preferences.checkTime}`, 'success');
                                            },
                                            error: function (xhr) {
                                                //console.error(xhr.responseText);

                                                swal('Error', `${xhr.responseText}`, 'error');
                                            }
                                        });
                                    },
                                    error: function (xhr) {
                                        //console.error(xhr.responseText);

                                        swal('Error', `${xhr.responseText}`, 'error');
                                    }
                                });
                            } else {
                                // Reload tasks if response ok
                                reloadTaskList();
                                swal('Success', `Not update streak - ${preferences.checkTime}`, 'success');
                            }
                        },
                        error: function (xhr) {
                            //console.error(xhr.responseText);

                            swal('Error', `${xhr.responseText}`, 'error');
                        }
                    });
                },
                error: function (xhr) {
                    //console.error(xhr.responseText);

                    swal('Error', `${xhr.responseText}`, 'error');
                }
            });
        },
        error: function (xhr) {
            //console.error(xhr.responseText);

            swal('Error', `${xhr.responseText}`, 'error');
        }
    });
}

// Delete task ---------------------------------------------------------------------------------------------------------
// ██████  ███████ ██      ███████ ████████ ███████
// ██   ██ ██      ██      ██         ██    ██
// ██   ██ █████   ██      █████      ██    █████
// ██   ██ ██      ██      ██         ██    ██
// ██████  ███████ ███████ ███████    ██    ███████

function deleteTask(taskId) {
    // Display delete dialog
    swal({
        title: 'Delete current task?',
        text: 'Once deleted, you will not be able to recover this task!',
        icon: 'warning',
        buttons: true,
        dangerMode: true,
    }).then((willDelete) => {
        if (willDelete) {
            // Call API to delete task
            $.ajax({
                async: true,
                type: 'DELETE',
                url: `${apiUrl}/Tasks/${taskId}`,
                contentType: 'application/json',
                success: function (response) {
                    //console.log(response);

                    // Reload tasks if response ok
                    reloadTaskList();
                    swal('Success', 'Delete list successfully.', 'success');
                },
                error: function (xhr) {
                    //console.error(xhr.responseText);

                    swal('Error', `${xhr.responseText}`, 'error');
                }
            });
        }
    });
}

// Responsive - Button -------------------------------------------------------------------------------------------------
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