// Inject the calendar booking button into header element
(function () {
    function tryInit(attemptsLeft) {
        const target = document.getElementById("header-booking-btn");

        if (!target) {
            console.warn("Calendar: header target not found");
            return;
        }

        if (
            window.calendar &&
            calendar.schedulingButton &&
            typeof calendar.schedulingButton.load === "function"
        ) {
            calendar.schedulingButton.load({
                url: "https://calendar.google.com/calendar/appointments/schedules/AcZssZ1LsjbH9GulIIVJDUZPn6rlDJt8tlHFZEQm7TIbOePXF4YfpdSx28gKT0329VqQ21gA1iXCgb7X?gv=true",
                color: "#039BE5",
                label: "Book",
                target: target,
            });
            return;
        }

        if (attemptsLeft > 0) {
            setTimeout(() => tryInit(attemptsLeft - 1), 200);
        }
    }

    document.addEventListener("DOMContentLoaded", () => tryInit(20));
})();
