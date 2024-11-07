let apiUrl = 'http://localhost:5000/api/';

function showDivisionsWithDelay() {
    const delay = 100;

    $('.card').each(function(index) {
        const card = $(this);
        setTimeout(function() {
            card.css('opacity', 0.7);
        }, (index + 1) * delay);
    });
}

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
});

