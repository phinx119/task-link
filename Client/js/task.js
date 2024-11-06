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
    let sendingData = {
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
        addNewTask(sendingData);
    });
}

// Display task ------------------------------------------------------------------------------------------------------
//  ██████  ███████ ████████
// ██       ██         ██
// ██   ███ █████      ██
// ██    ██ ██         ██
//  ██████  ███████    ██

// Check if a date is today
const isToday = (dateString) => {
    const today = new Date();
    const date = new Date(dateString);
    return date.toDateString() === today.toDateString();
};

// Display tasks and set data into task card
function displayTasks(html, receivedData) {
    //console.log(receivedData);

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
    
    // Set html
    $('#task-container').html(html);

    // Set fade animation
    showDivisionsWithDelay();
}

// Display task by time unit (day, week, month, all time)
function displayTasksByTimeUnit(timeUnit, timeUnitUrl) {
    // Set header title
    $('#header_title').html(timeUnit);
    
    // Set variable
    let tasksHtml = '';

    // Call API to get tasks by time unit
    $.ajax({
        async: true,
        type: 'GET',
        url: `${apiUrl}Tasks/${preferences.userId}/${timeUnitUrl}`,
        dataType: 'json',
        success: function (receivedData) {
            //console.log(receivedData);

            // Display task if response ok
            displayTasks(tasksHtml, receivedData);
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
    
    // Set variable
    let tasksHtml = '';

    // Call api to get tasks
    $.ajax({
        async: true,
        type: 'GET',
        url: `${apiUrl}Tasks/ListId/${listId}`,
        dataType: 'json',
        success: function (receivedData) {
            //console.log(receivedData);

            // Display task if response ok
            displayTasks(tasksHtml, receivedData);
        },
        error: function (xhr) {
            //console.error(xhr.responseText);

            swal('Error', `${xhr.responseText}`, 'error');
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
    // Set header title
    $('#header_title').html('Result');
    
    // Set variable
    let searchText = $('#search').val().trim().toLowerCase();
    let tasksHtml = '';
    let count = 0;

    // Call api to search task
    $.ajax({
        async: true,
        type: 'GET',
        url: `${apiUrl}Tasks`,
        dataType: 'json',
        success: function (receivedData) {
            //console.log(receivedData);

            $.each(receivedData, function (index, task) {
                if (task.title.toLowerCase().includes(searchText.toLowerCase())) {
                    count++; // Increase number of task
                    // Parse due date to date type
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
            
            // Check if not found
            if (count === 0) {
                swal('Info', 'No task found', 'info');
            }

            // Clear search bar
            $('#search').val('');
            
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
        url: `${apiUrl}TaskLists/${preferences.userId}`,
        dataType: 'json',
        success: function (receivedData) {
            //console.log(receivedData);

            if (receivedData == null || receivedData.length === 0) {
                swal('Info', 'No task list found', 'info');
            } else {
                $.each(receivedData, function (index, taskList) {
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
        url: `${apiUrl}Repeats`,
        dataType: 'json',
        success: function (receivedData) {
            //console.log(receivedData);

            if (receivedData == null || receivedData.length === 0) {
                swal('Info', 'No repeat option found', 'info');
            } else {
                $.each(receivedData, function (index, repeat) {
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

// Format current date and time to set input value
let currentDateTime = new Date();
currentDateTime.setHours(currentDateTime.getHours() + 7);
let formattedCurrentDateTime = currentDateTime.toISOString().slice(0, 16);

// Create new task -----------------------------------------------------------------------------------------------------
// ██████   ██████  ███████ ████████
// ██   ██ ██    ██ ██         ██
// ██████  ██    ██ ███████    ██
// ██      ██    ██      ██    ██
// ██       ██████  ███████    ██

function addNewTask(sendingData) {
    // Load and set selected to option
    loadListOption(sendingData.listId == null ? 1 : sendingData.listId);
    loadRepeatOption(sendingData.repeatId == null ? 1 : sendingData.repeatId);

    // Display create new task dialog with delay
    setTimeout(function () {
        swal({
            title: 'Create new task',
            content: {
                element: 'div',
                attributes: {
                    innerHTML: `
                        <div class="form__group field">
                            <input type="text" class="form__field" placeholder="Title" id="swal-input-title" value="${sendingData.title}" required>
                            <label for="swal-input-title" class="form__label">Title</label>
                        </div>
                        <div class="form__group field">
                            <input type="text" class="form__field" placeholder="Note" id="swal-input-note" value="${sendingData.note}">
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
                                    <option value="Low" ${sendingData.priority === 'Low' ? 'selected' : ''}>Low</option>
                                    <option value="Medium" ${sendingData.priority === 'Medium' ? 'selected' : ''}>Medium</option>
                                    <option value="High" ${sendingData.priority === 'High' ? 'selected' : ''}>High</option>
                                </select>
                                <label for="swal-input-priority" class="form__label">Priority</label>
                            </div>          
                        </div>
                        <div class="form__group field">
                            <input type="datetime-local" class="form__field" placeholder="Due Date" id="swal-input-due-date" value="${sendingData.dueDate == null ? formattedCurrentDateTime : sendingData.dueDate}" required>
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
                const dueDate = document.getElementById('swal-input-due-date').value;
                const repeat = document.getElementById('swal-input-repeat').value;

                // Validate input
                if (title && list && priority && dueDate && repeat) {
                    // Call API to create new task
                    let sendingData = {
                        listId: list,
                        title: title,
                        note: note,
                        dueDate: dueDate,
                        repeatId: repeat,
                        priority: priority,
                        status: 'Pending',
                    };
                    $.ajax({
                        async: true,
                        type: 'POST',
                        url: `${apiUrl}Tasks`,
                        contentType: 'application/json',
                        data: JSON.stringify(sendingData),
                        success: function (receivedData) {
                            //console.log(receivedData);

                            // Reload tasks if response ok
                            displayTasksByTimeUnit('All tasks', 'all');
                            swal('Success', 'Create task successful', 'success');
                        },
                        error: function (xhr) {
                            //console.error(xhr.responseText);

                            swal('Error', `${xhr.responseText}`, 'error').then(() => {
                                // Reopen the create dialog if response error
                                addNewTask(sendingData);
                            });
                        }
                    });
                } else {
                    swal('Error', 'Input cannot be empty', 'error').then(() => {
                        // Reopen the create dialog if validation fails
                        addNewTask(sendingData)
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
        url: `${apiUrl}Tasks/TaskId/${taskId}`,
        dataType: 'json',
        success: function (receivedData) {
            //console.log(receivedData);

            // Load and set selected to option
            loadListOption(receivedData.listId);
            loadRepeatOption(receivedData.repeatId);

            // Display update task dialog with delay
            setTimeout(function () {
                swal({
                    title: 'Update task',
                    content: {
                        element: 'div',
                        attributes: {
                            innerHTML: `
                                <div class="form__group field">
                                    <input type="text" class="form__field" placeholder="Title" id="swal-input-title" value="${receivedData.title}" required>
                                    <label for="swal-input-title" class="form__label">Title</label>
                                </div>
                                <div class="form__group field">
                                    <input type="text" class="form__field" placeholder="Note" id="swal-input-note" value="${receivedData.note}">
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
                                            <option value="Low" ${receivedData.priority === 'Low' ? 'selected' : ''}>Low</option>
                                            <option value="Medium" ${receivedData.priority === 'Medium' ? 'selected' : ''}>Medium</option>
                                            <option value="High" ${receivedData.priority === 'High' ? 'selected' : ''}>High</option>
                                        </select>
                                        <label for="swal-input-priority" class="form__label">Priority</label>
                                    </div>          
                                </div>
                                <div class="form__group field">
                                    <input type="datetime-local" class="form__field" placeholder="Due Date" id="swal-input-due-date" value="${receivedData.dueDate}" required>
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
                        const dueDate = document.getElementById('swal-input-due-date').value;
                        const repeat = document.getElementById('swal-input-repeat').value;

                        // Validate input
                        if (title && list && priority && dueDate && repeat) {
                            // Set input value into sending data
                            let sendingData = {
                                listId: list,
                                title: title,
                                note: note,
                                dueDate: dueDate,
                                repeatId: repeat,
                                priority: priority,
                                status: receivedData.status,
                            };

                            // Call API to update task
                            $.ajax({
                                async: true,
                                type: 'PUT',
                                url: `${apiUrl}Tasks/${receivedData.taskId}`,
                                contentType: 'application/json',
                                data: JSON.stringify(sendingData),
                                success: function (receivedData) {
                                    //console.log(receivedData);

                                    // Reload tasks if response ok
                                    displayTasksByTimeUnit('All tasks', 'all');
                                    swal('Success', 'Update task successful', 'success').then(() => {
                                        // Reopen the update dialog
                                        updateTask(taskId);
                                    });
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
                url: `${apiUrl}Tasks/${taskId}`,
                contentType: 'application/json',
                success: function (receivedData) {
                    //console.log(receivedData);

                    // Reload tasks if response ok
                    displayTasksByTimeUnit('All tasks', 'all');
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