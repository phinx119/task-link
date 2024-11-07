let apiUrl = 'http://localhost:5000/api';

$(document).ready(function () {
    if (preferences.userId !== 0) {
        manageSystem();
    } else {
        login();
    }
    
    function manageSystem() {
        manageUser();
        manageTaskList();
        manageTask();
    }    
    
    $(this).on('click', function () {
        console.log(new Date());
    });
});

// Error handling
function handleAjaxError(xhr) {
    //console.error(xhr.responseText);
    swal('Error', `${xhr.responseText}`, 'error');
}

// Fade effect when show tasks
function showDivisionsWithDelay() {
    const delay = 100;

    $('.card').each(function(index) {
        const card = $(this);
        setTimeout(function() {
            card.css('opacity', 0.7);
        }, (index + 1) * delay);
    });
}