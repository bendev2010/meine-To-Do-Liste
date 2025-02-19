document.addEventListener('DOMContentLoaded', () => {
    const taskForm = document.getElementById('task-form');
    const taskList = document.getElementById('tasks');
    const completedList = document.getElementById('completed');
    const toggleCompletedButton = document.getElementById('toggle-completed-tasks');
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let showCompleted = false;

    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const taskName = document.getElementById('task-name').value;
        const dueDate = new Date(document.getElementById('due-date').value);
        const importance = document.getElementById('importance').value;

        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        const formattedDate = dueDate.toLocaleDateString('en-US', options);

        const task = {
            name: taskName,
            dueDate: dueDate,
            formattedDate: formattedDate,
            importance: importance,
            completed: false
        };

        tasks.push(task);
        tasks.sort((a, b) => {
            const priorityOrder = { high: 1, medium: 2, low: 3 };
            if (priorityOrder[a.importance] !== priorityOrder[b.importance]) {
                return priorityOrder[a.importance] - priorityOrder[b.importance];
            }
            return a.dueDate - b.dueDate;
        });

        localStorage.setItem('tasks', JSON.stringify(tasks));
        renderTasks();
        renderCalendar();
        taskForm.reset();
    });

    toggleCompletedButton.addEventListener('click', () => {
        showCompleted = !showCompleted;
        completedList.classList.toggle('hidden', !showCompleted);
        toggleCompletedButton.textContent = showCompleted ? 'Hide Completed Tasks' : 'Show Completed Tasks';
    });

    function renderTasks() {
        taskList.innerHTML = '';
        completedList.innerHTML = '';
        tasks.forEach((task, index) => {
            const taskItem = document.createElement('li');
            taskItem.classList.add(task.importance);
            if (task.completed) {
                taskItem.classList.add('completed');
            }

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = task.completed;
            checkbox.addEventListener('change', () => {
                task.completed = checkbox.checked;
                localStorage.setItem('tasks', JSON.stringify(tasks));
                renderTasks();
                renderCalendar();
            });

            const taskTitle = document.createElement('span');
            taskTitle.classList.add('task-title');
            taskTitle.textContent = task.name;

            const taskDueDate = document.createElement('span');
            taskDueDate.classList.add('task-due-date');
            taskDueDate.textContent = ` - Due: ${task.formattedDate}`;

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.addEventListener('click', () => {
                tasks.splice(index, 1);
                localStorage.setItem('tasks', JSON.stringify(tasks));
                renderTasks();
                renderCalendar();
            });

            taskItem.appendChild(checkbox);
            taskItem.appendChild(taskTitle);
            taskItem.appendChild(taskDueDate);
            taskItem.appendChild(deleteButton);

            if (task.completed) {
                completedList.appendChild(taskItem);
            } else {
                taskList.appendChild(taskItem);
            }
        });
    }

    // Pomodoro Timer
    const timerDisplay = document.getElementById('timer-display');
    const startButton = document.getElementById('start-timer');
    const resetButton = document.getElementById('reset-timer');
    const progressRing = document.getElementById('progress-ring-circle');
    const circumference = 2 * Math.PI * 54;
    let timer;
    let timeLeft = JSON.parse(localStorage.getItem('timeLeft')) || 25 * 60; // 25 minutes in seconds

    function updateTimerDisplay() {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        const offset = circumference - (timeLeft / (25 * 60)) * circumference;
        progressRing.style.strokeDashoffset = offset;
    }

    function startTimer() {
        if (!timer) {
            timer = setInterval(() => {
                if (timeLeft > 0) {
                    timeLeft--;
                    localStorage.setItem('timeLeft', JSON.stringify(timeLeft));
                    updateTimerDisplay();
                } else {
                    clearInterval(timer);
                    timer = null;
                    alert('Time is up!');
                }
            }, 1000);
        }
    }

    function resetTimer() {
        clearInterval(timer);
        timer = null;
        timeLeft = 25 * 60;
        localStorage.setItem('timeLeft', JSON.stringify(timeLeft));
        updateTimerDisplay();
    }

    startButton.addEventListener('click', startTimer);
    resetButton.addEventListener('click', resetTimer);

    updateTimerDisplay();

    // Calendar
    const calendarGrid = document.getElementById('calendar-grid');
    const calendarMonth = document.getElementById('calendar-month');

    function renderCalendar() {
        calendarGrid.innerHTML = '';
        const currentDate = new Date();
        const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
        const monthName = currentDate.toLocaleString('default', { month: 'long' });
        calendarMonth.textContent = monthName;

        for (let day = 1; day <= daysInMonth; day++) {
            const calendarDay = document.createElement('div');
            calendarDay.classList.add('calendar-day');

            const date = document.createElement('div');
            date.classList.add('date');
            date.textContent = day;

            const taskList = document.createElement('ul');
            taskList.classList.add('tasks');

            tasks.forEach(task => {
                const taskDueDate = new Date(task.dueDate);
                if (taskDueDate.getDate() === day && taskDueDate.getMonth() === currentDate.getMonth()) {
                    const taskItem = document.createElement('li');
                    taskItem.textContent = task.name;
                    taskItem.classList.add(task.importance);
                    taskList.appendChild(taskItem);
                }
            });

            calendarDay.appendChild(date);
            calendarDay.appendChild(taskList);
            calendarGrid.appendChild(calendarDay);
        }
    }

    renderTasks();
    renderCalendar();
});