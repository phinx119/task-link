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

const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
    }
});

$(document).ready(function () {
    if (preferences.userId !== 0) {
        manageSystem();
    } else {
        login();
    }
    
    function manageSystem() {
        manageTaskList();
        manageTask();
    }    
});

