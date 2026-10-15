
const form = document.getElementById("task-form");
const titleInput = document.getElementById("task-title");
const categoryInput = document.getElementById("task-category");
const taskList = document.getElementById("task-list");
const emptyMessage = document.getElementById("empty-message");

let tasks = [];

try {
    const savedTasks = JSON.parse(
        localStorage.getItem("taskmaster-tasks") || "[]"
    );

    if (
        Array.isArray(savedTasks) &&
        savedTasks.every(task =>
            task &&
            typeof task.id === "string" &&
            typeof task.title === "string" &&
            typeof task.category === "string" &&
            typeof task.done === "boolean"
    )
    ) {
        tasks = savedTasks;
    }
} catch {
    tasks = [];
}

let currentFilter = "all";

function saveTasks() {
    localStorage.setItem(
        "taskmaster-tasks",
        JSON.stringify(tasks)
    );
}

function updateStats() {
    document.getElementById("total").textContent = tasks.length;

    document.getElementById("remaining").textContent =
        tasks.filter(task => !task.done).length;

    document.getElementById("completed").textContent =
        tasks.filter(task => task.done).length;
}

function renderTasks() {
    taskList.replaceChildren();

    const filteredTasks = tasks.filter(task => {
        if (currentFilter === "pending") return !task.done;
        if (currentFilter === "completed") return task.done;
        return true;
    });

    emptyMessage.hidden = filteredTasks.length > 0;

    filteredTasks.forEach(task => {
        const item = document.createElement("li");
        item.className = "task-item";
        if (task.done) item.classList.add("done");

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = task.done;
        checkbox.setAttribute(
            "aria-label",
            "Terminer la tâche " + task.title
        );

        checkbox.addEventListener("change", () => {
            task.done = checkbox.checked;
            saveTasks();
            renderTasks();
        });

        const info = document.createElement("div");
        info.className = "task-info";

        const title = document.createElement("strong");
        title.textContent = task.title;

        const category = document.createElement("span");
        category.className = "category";
        category.textContent = task.category;

        info.append(title, category);

        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-btn";
        deleteButton.textContent = "Supprimer";
        deleteButton.setAttribute(
            "aria-label",
            "Supprimer la tâche " + task.title
        );

        deleteButton.addEventListener("click", () => {
            tasks = tasks.filter(t => t.id !== task.id);
            saveTasks();
            renderTasks();
        });

        item.append(checkbox, info, deleteButton);
        taskList.appendChild(item);
    });

    updateStats();
}

form.addEventListener("submit", event => {
    event.preventDefault();

    const title = titleInput.value.trim();

    if (!title) return;

    const task = {
        id: crypto.randomUUID(),
        title: title,
        category: categoryInput.value,
        done: false
    };

    tasks.unshift(task);
    saveTasks();
    renderTasks();

    form.reset();
    titleInput.focus();
});

document.querySelectorAll(".filter").forEach(button => {
    button.addEventListener("click", () => {
        currentFilter = button.dataset.filter;

        document.querySelectorAll(".filter").forEach(btn => {
            btn.classList.toggle("active", btn === button);
        });

        renderTasks();
    });
});

renderTasks();
