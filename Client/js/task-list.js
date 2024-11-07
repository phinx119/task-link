// Manage task list ----------------------------------------------------------------------------------------------------
function manageTaskList() {
    // Display list of task list
    displayTaskList();

    // Handle add new list
    $('#add-new-list').on('click', function () {
        addNewTaskList();
    })
}

// Display task list ---------------------------------------------------------------------------------------------------
//  ██████  ███████ ████████
// ██       ██         ██
// ██   ███ █████      ██
// ██    ██ ██         ██
//  ██████  ███████    ██

function displayTaskList() {
    // Set variable
    let taskListsHtml = '';

    // Call api to get task by user id
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
                    taskListsHtml += `                
                        <li>
                            <a href="#" onclick="displayTasksByTaskList(${taskList.listId}, '${taskList.listName}')">
                                <i class="bx bx-task"></i>
                                <span>${taskList.listName}</span>
                            </a>
                            <div>
                                <a>
                                    <i class="bx bx-info-circle" onclick="updateTaskList(${taskList.listId}, '${taskList.listName}')"></i>
                                    <i class="bx bx-trash-alt" onclick="deleteTaskList(${taskList.listId})"></i>
                                </a>
                            </div> 
                        </li>
                    `;
                });
            }

            // Set html
            $('#list-by-name').html(taskListsHtml);
        },
        error: function (xhr) {
            //console.error(xhr.responseText);

            swal('Error', `${xhr.responseText}`, 'error');
        }
    });
}

// Create new list -----------------------------------------------------------------------------------------------------
// ██████   ██████  ███████ ████████
// ██   ██ ██    ██ ██         ██
// ██████  ██    ██ ███████    ██
// ██      ██    ██      ██    ██
// ██       ██████  ███████    ██

function addNewTaskList() {
    // Display create new task list dialog
    swal({
        title: 'Create new task list',
        content: {
            element: 'div',
            attributes: {
                innerHTML: `
                    <div class="form__group field">
                        <input type="text" class="form__field" placeholder="List Name" id="swal-input-list-name" required>
                        <label for="swal-input-list-name" class="form__label">List Name</label>
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
            const listName = document.getElementById('swal-input-list-name').value;

            // Validate input
            if (listName && listName !== '') {
                // Call API to create new task list
                $.ajax({
                    async: true,
                    type: 'POST',
                    url: `${apiUrl}TaskLists/${preferences.userId}?listName=${listName}`,
                    contentType: 'application/json',
                    success: function (receivedData) {
                        //console.log(receivedData);

                        // Reload task list if response ok
                        displayTaskList();
                        swal('Success', 'Create new list successfully.', 'success');
                    },
                    error: function (xhr) {
                        //console.error(xhr.responseText);

                        swal('Error', `${xhr.responseText}`, 'error').then(() => {
                            // Reopen the create dialog if response error
                            addNewTaskList();
                        });
                    }
                });
            } else {
                swal('Error', 'List name cannot be empty', 'error').then(() => {
                    // Reopen the create dialog if validation fails
                    addNewTaskList();
                });
            }
        }
    });
}

// Update list name ----------------------------------------------------------------------------------------------------
// ██████  ██    ██ ████████
// ██   ██ ██    ██    ██
// ██████  ██    ██    ██
// ██      ██    ██    ██
// ██       ██████     ██

function updateTaskList(listId, listName) {
    // Display update task list dialog
    swal({
        title: 'Update task list',
        content: {
            element: 'div',
            attributes: {
                innerHTML: `
                    <div class="form__group field">
                        <input type="text" class="form__field" placeholder="List Name" id="swal-input-list-name" value="${listName}" required>
                        <label for="swal-input-list-name" class="form__label">List Name</label>
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
            const listName = document.getElementById('swal-input-list-name').value;

            // Validate input
            if (listName && listName !== '') {
                // Call API to update list
                $.ajax({
                    async: true,
                    type: 'PUT',
                    url: `${apiUrl}TaskLists/${preferences.userId}/${listId}?listName=${listName}`,
                    contentType: 'application/json',
                    success: function (receivedData) {
                        //console.log(receivedData);

                        // Reload task list if response ok
                        displayTaskList();
                        swal('Success', 'Update list successfully.', 'success');
                    },
                    error: function (xhr) {
                        //console.error(xhr.responseText);

                        swal('Error', `${xhr.responseText}`, 'error').then(() => {
                            // Reopen the update dialog if response error
                            updateTaskList(listId, listName);
                        });
                    }
                });
            } else {
                swal('Error', 'List name cannot be empty', 'error').then(() => {
                    // Reopen the update dialog if validation fails
                    updateTaskList(listId, listName);
                });
            }
        }
    });
}

// Delete task list ----------------------------------------------------------------------------------------------------
// ██████  ███████ ██      ███████ ████████ ███████
// ██   ██ ██      ██      ██         ██    ██
// ██   ██ █████   ██      █████      ██    █████
// ██   ██ ██      ██      ██         ██    ██
// ██████  ███████ ███████ ███████    ██    ███████

function deleteTaskList(listId) {
    // Display delete task list dialog
    swal({
        title: 'Delete all data?',
        text: 'Once deleted, you will not be able to recover this data!',
        icon: 'warning',
        buttons: true,
        dangerMode: true,
    }).then((willDelete) => {
        if (willDelete) {
            // Call API to delete list
            $.ajax({
                async: true,
                type: 'DELETE',
                url: `${apiUrl}TaskLists/${preferences.userId}/${listId}`,
                contentType: 'application/json',
                success: function (receivedData) {
                    //console.log(receivedData);

                    // Reload task list if response ok
                    displayTaskList();
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

// ---------------------------------------------------------------------------------------------------------------------