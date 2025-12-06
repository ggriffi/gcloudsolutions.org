// /js/calendar-init.js

window.addEventListener("load", function () {
    var target = document.getElementById("gcloud-appointment-btn");
    if (!target) return;
    if (!window.calendar || !calendar.schedulingButton) return;

    calendar.schedulingButton.load({
        url: "https://calendar.google.com/calendar/appointments/schedules/AcZssZ1LsjbH9GulIIVJDUZPn6rlDJt8tlHFZEQm7TIbOePXF4YfpdSx28gKT0329VqQ21gA1iXCgb7X?gv=true",
        color: "#039BE5",
        label: "Book an appointment",
        target: target,
    });
});
