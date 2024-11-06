const dueDate = new Date('1975-04-09T20:10:00'); // Specify the initial date in a valid format

// Add 1 year
dueDate.setFullYear(dueDate.getFullYear() + 1);

console.log(dueDate.toDateString() + ' ' + dueDate.toTimeString());
