// DOM Elements - Auth
const authContainer = document.getElementById('auth-container');
const dashboardContainer = document.getElementById('dashboard-container');
const authForm = document.getElementById('auth-form');
const authTitle = document.getElementById('auth-title');
const authSubtitle = document.getElementById('auth-subtitle');
const nameGroup = document.getElementById('name-group');
const authSubmitBtn = document.getElementById('auth-submit-btn');
const toggleAuthLink = document.getElementById('toggle-auth');
const toggleMsg = document.getElementById('toggle-msg');
const logoutBtn = document.getElementById('logout-btn');
const welcomeUser = document.getElementById('welcome-user');

// DOM Elements - Tasks
const taskForm = document.getElementById('task-form');
const formHeading = document.getElementById('form-heading');
const editTaskIdInput = document.getElementById('edit-task-id');
const taskTitleInput = document.getElementById('task-title');
const taskPriorityInput = document.getElementById('task-priority');
const taskDescInput = document.getElementById('task-desc');
const taskDueInput = document.getElementById('task-due');
const saveTaskBtn = document.getElementById('save-task-btn');
const cancelEditBtn = document.getElementById('cancel-edit-btn');
const taskListEl = document.getElementById('task-list');
const searchInput = document.getElementById('search-input');
const filterBtns = document.querySelectorAll('.filter-btn');

// State Variables
let isRegisterMode = false;
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let currentFilter = 'all';

// Initialize App
function init() {
  if (currentUser) {
    showDashboard();
  } else {
    showAuth();
  }
}

// Toggle Login / Register Mode
toggleAuthLink.addEventListener('click', (e) => {
  e.preventDefault();
  isRegisterMode = !isRegisterMode;
  if (isRegisterMode) {
    authTitle.textContent = 'Create an Account';
    authSubtitle.textContent = 'Register to start organizing your tasks';
    nameGroup.style.display = 'block';
    document.getElementById('username').required = true;
    authSubmitBtn.textContent = 'Register';
    toggleMsg.textContent = 'Already have an account?';
    toggleAuthLink.textContent = 'Login here';
  } else {
    authTitle.textContent = 'Login to Task Manager';
    authSubtitle.textContent = 'Manage your daily tasks efficiently';
    nameGroup.style.display = 'none';
    document.getElementById('username').required = false;
    authSubmitBtn.textContent = 'Login';
    toggleMsg.textContent = "Don't have an account?";
    toggleAuthLink.textContent = 'Register here';
  }
});

// Handle Authentication (Login & Register)
authForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  const users = JSON.parse(localStorage.getItem('users')) || [];

  if (isRegisterMode) {
    const name = document.getElementById('username').value.trim();
    const userExists = users.some(u => u.email === email);
    if (userExists) {
      alert('Email already registered! Please login.');
      return;
    }
    const newUser = { name, email, password };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    currentUser = newUser;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    authForm.reset();
    showDashboard();
  } else {
    const validUser = users.find(u => u.email === email && u.password === password);
    if (!validUser) {
      alert('Invalid email or password! If you are new, please register first.');
      return;
    }
    currentUser = validUser;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    authForm.reset();
    showDashboard();
  }
});

// Logout
logoutBtn.addEventListener('click', () => {
  currentUser = null;
  localStorage.removeItem('currentUser');
  showAuth();
});

function showAuth() {
  authContainer.style.display = 'block';
  dashboardContainer.style.display = 'none';
}

function showDashboard() {
  authContainer.style.display = 'none';
  dashboardContainer.style.display = 'block';
  welcomeUser.textContent = `Welcome, ${currentUser.name}!`;
  renderTasks();
}

// Get User-Specific Tasks from LocalStorage
function getUserTasks() {
  const allTasks = JSON.parse(localStorage.getItem('tasks')) || {};
  return allTasks[currentUser.email] || [];
}

function saveUserTasks(tasks) {
  const allTasks = JSON.parse(localStorage.getItem('tasks')) || {};
  allTasks[currentUser.email] = tasks;
  localStorage.setItem('tasks', JSON.stringify(allTasks));
  renderTasks();
}

// Create or Update Task
taskForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const tasks = getUserTasks();
  const editId = editTaskIdInput.value;

  const taskData = {
    id: editId ? Number(editId) : Date.now(),
    title: taskTitleInput.value.trim(),
    priority: taskPriorityInput.value,
    description: taskDescInput.value.trim(),
    dueDate: taskDueInput.value,
    completed: editId ? tasks.find(t => t.id === Number(editId)).completed : false
  };

  if (editId) {
    const index = tasks.findIndex(t => t.id === Number(editId));
    tasks[index] = taskData;
    resetForm();
  } else {
    tasks.unshift(taskData);
    taskForm.reset();
  }

  saveUserTasks(tasks);
});

// Reset Edit Mode
cancelEditBtn.addEventListener('click', resetForm);

function resetForm() {
  editTaskIdInput.value = '';
  formHeading.textContent = 'Add New Task';
  saveTaskBtn.textContent = 'Add Task';
  cancelEditBtn.style.display = 'none';
  taskForm.reset();
}

// Toggle Complete Status
window.toggleComplete = function(id) {
  const tasks = getUserTasks();
  const task = tasks.find(t => t.id === id);
  if (task) {
    task.completed = !task.completed;
    saveUserTasks(tasks);
  }
};

// Edit Task
window.editTask = function(id) {
  const tasks = getUserTasks();
  const task = tasks.find(t => t.id === id);
  if (task) {
    editTaskIdInput.value = task.id;
    taskTitleInput.value = task.title;
    taskPriorityInput.value = task.priority;
    taskDescInput.value = task.description;
    taskDueInput.value = task.dueDate;
    formHeading.textContent = 'Update Task';
    saveTaskBtn.textContent = 'Update Task';
    cancelEditBtn.style.display = 'inline-block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

// Delete Task
window.deleteTask = function(id) {
  if (confirm('Are you sure you want to delete this task?')) {
    const tasks = getUserTasks().filter(t => t.id !== id);
    saveUserTasks(tasks);
  }
};

// Filter & Search Listeners
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    renderTasks();
  });
});

searchInput.addEventListener('input', renderTasks);

// Render Tasks to UI
function renderTasks() {
  const tasks = getUserTasks();
  const searchTerm = searchInput.value.toLowerCase();

  // Update Stats
  document.getElementById('total-tasks').textContent = tasks.length;
  document.getElementById('completed-tasks').textContent = tasks.filter(t => t.completed).length;
  document.getElementById('pending-tasks').textContent = tasks.filter(t => !t.completed).length;

  // Apply Filter & Search
  const filteredTasks = tasks.filter(task => {
    const matchesFilter =
      currentFilter === 'all' ||
      (currentFilter === 'completed' && task.completed) ||
      (currentFilter === 'pending' && !task.completed);

    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm) ||
      task.description.toLowerCase().includes(searchTerm);

    return matchesFilter && matchesSearch;
  });

  taskListEl.innerHTML = '';

  if (filteredTasks.length === 0) {
    taskListEl.innerHTML = '<p style="text-align:center; color:#64748b; padding:20px;">No tasks found.</p>';
    return;
  }

  filteredTasks.forEach(task => {
    const card = document.createElement('div');
    card.className = `task-card ${task.completed ? 'completed' : ''}`;
    card.innerHTML = `
      <div class="task-info">
        <div class="task-header-row">
          <span class="task-title">${task.title}</span>
          <span class="badge ${task.priority}">${task.priority}</span>
        </div>
        ${task.description ? `<p class="task-desc">${task.description}</p>` : ''}
        <span class="task-date">Due: ${task.dueDate}</span>
      </div>
      <div class="task-actions">
        <button class="action-btn complete-btn" onclick="toggleComplete(${task.id})">
          ${task.completed ? 'Undo' : 'Complete'}
        </button>
        <button class="action-btn edit-btn" onclick="editTask(${task.id})">Edit</button>
        <button class="action-btn delete-btn" onclick="deleteTask(${task.id})">Delete</button>
      </div>
    `;
    taskListEl.appendChild(card);
  });
}

// Start Application
init();
  
