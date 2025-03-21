// DOM Elements
const taskForm = document.getElementById('task-form');
const taskTitle = document.getElementById('task-title');
const taskDescription = document.getElementById('task-description');
const submitBtn = document.getElementById('submit-btn');
const cancelBtn = document.getElementById('cancel-btn');
const taskList = document.getElementById('task-list');
const taskTemplate = document.getElementById('task-template');
const tasksCount = document.getElementById('tasks-count');
const clearCompletedBtn = document.getElementById('clear-completed');
const allTasksBtn = document.getElementById('all-tasks');
const activeTasksBtn = document.getElementById('active-tasks');
const completedTasksBtn = document.getElementById('completed-tasks');

// API endpoints
const API_URL = '/api/tasks';

// App state
let tasks = [];
let currentFilter = 'all';
let editingTaskId = null;

// Event Listeners
document.addEventListener('DOMContentLoaded', fetchTasks);

taskForm.addEventListener('submit', function(e) {
  e.preventDefault();
  if (editingTaskId) {
    updateTask(editingTaskId);
  } else {
    createTask();
  }
});

cancelBtn.addEventListener('click', resetForm);

clearCompletedBtn.addEventListener('click', clearCompletedTasks);

// Filter buttons
allTasksBtn.addEventListener('click', () => setFilter('all'));
activeTasksBtn.addEventListener('click', () => setFilter('active'));
completedTasksBtn.addEventListener('click', () => setFilter('completed'));

// CRUD Functions
async function fetchTasks() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Failed to fetch tasks');
    
    tasks = await response.json();
    renderTasks();
  } catch (error) {
    console.error('Error fetching tasks:', error);
    showNotification('Failed to load tasks', 'error');
  }
}

async function createTask() {
  const title = taskTitle.value.trim();
  const description = taskDescription.value.trim();
  
  if (!title) return;
  
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title, description })
    });
    
    if (!response.ok) throw new Error('Failed to create task');
    
    const newTask = await response.json();
    tasks.unshift(newTask);
    renderTasks();
    resetForm();
  } catch (error) {
    console.error('Error creating task:', error);
    showNotification('Failed to create task', 'error');
  }
}

async function updateTask(id) {
  const title = taskTitle.value.trim();
  const description = taskDescription.value.trim();
  
  if (!title) return;
  
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title,
        description,
        completed: tasks.find(task => task.id === parseInt(id)).completed
      })
    });
    
    if (!response.ok) throw new Error('Failed to update task');
    
    const updatedTask = await response.json();
    
    tasks = tasks.map(task => 
      task.id === parseInt(id) ? updatedTask : task
    );
    
    renderTasks();
    resetForm();
  } catch (error) {
    console.error('Error updating task:', error);
    showNotification('Failed to update task', 'error');
  }
}

async function toggleTaskStatus(id, completed) {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ completed })
    });
    
    if (!response.ok) throw new Error('Failed to update task status');
    
    const updatedTask = await response.json();
    
    tasks = tasks.map(task => 
      task.id === parseInt(id) ? updatedTask : task
    );
    
    renderTasks();
  } catch (error) {
    console.error('Error updating task status:', error);
    showNotification('Failed to update task status', 'error');
  }
}

async function deleteTask(id) {
  if (!confirm('Are you sure you want to delete this task?')) return;
  
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) throw new Error('Failed to delete task');
    
    tasks = tasks.filter(task => task.id !== parseInt(id));
    renderTasks();
  } catch (error) {
    console.error('Error deleting task:', error);
    showNotification('Failed to delete task', 'error');
  }
}

async function clearCompletedTasks() {
  const completedTasks = tasks.filter(task => task.completed);
  
  if (completedTasks.length === 0) return;
  
  if (!confirm('Are you sure you want to clear all completed tasks?')) return;
  
  try {
    // We need to handle each delete operation as a separate promise
    const deletePromises = completedTasks.map(task => 
      fetch(`${API_URL}/${task.id}`, { method: 'DELETE' })
    );
    
    await Promise.all(deletePromises);
    
    tasks = tasks.filter(task => !task.completed);
    renderTasks();
  } catch (error) {
    console.error('Error clearing completed tasks:', error);
    showNotification('Failed to clear completed tasks', 'error');
  }
}

// UI Functions
function renderTasks() {
  taskList.innerHTML = '';
  
  let filteredTasks = tasks;
  
  if (currentFilter === 'active') {
    filteredTasks = tasks.filter(task => !task.completed);
  } else if (currentFilter === 'completed') {
    filteredTasks = tasks.filter(task => task.completed);
  }
  
  if (filteredTasks.length === 0) {
    const emptyMessage = document.createElement('li');
    emptyMessage.className = 'task-item empty-message';
    emptyMessage.textContent = 'No tasks found';
    taskList.appendChild(emptyMessage);
  } else {
    filteredTasks.forEach(task => {
      const taskElement = createTaskElement(task);
      taskList.appendChild(taskElement);
    });
  }
  
  updateTasksCount();
  updateClearCompletedButton();
}

function createTaskElement(task) {
  const taskClone = document.importNode(taskTemplate.content, true);
  const taskItem = taskClone.querySelector('.task-item');
  
  taskItem.dataset.id = task.id;
  
  if (task.completed) {
    taskItem.classList.add('completed');
  }
  
  const checkbox = taskItem.querySelector('.task-checkbox');
  checkbox.checked = task.completed;
  checkbox.addEventListener('change', function() {
    toggleTaskStatus(task.id, this.checked);
  });
  
  const taskTitleElement = taskItem.querySelector('.task-title');
  taskTitleElement.textContent = task.title;
  
  const taskDescriptionElement = taskItem.querySelector('.task-description');
  taskDescriptionElement.textContent = task.description || '';
  
  const editBtn = taskItem.querySelector('.edit-btn');
  editBtn.addEventListener('click', () => {
    setEditMode(task);
  });
  
  const deleteBtn = taskItem.querySelector('.delete-btn');
  deleteBtn.addEventListener('click', () => {
    deleteTask(task.id);
  });
  
  return taskItem;
}

function setEditMode(task) {
  editingTaskId = task.id;
  taskTitle.value = task.title;
  taskDescription.value = task.description || '';
  submitBtn.textContent = 'Update Task';
  cancelBtn.classList.remove('hidden');
  taskTitle.focus();
  
  // Scroll to form
  taskForm.scrollIntoView({ behavior: 'smooth' });
}

function resetForm() {
  editingTaskId = null;
  taskForm.reset();
  submitBtn.textContent = 'Add Task';
  cancelBtn.classList.add('hidden');
}

function setFilter(filter) {
  currentFilter = filter;
  
  // Update active button
  [allTasksBtn, activeTasksBtn, completedTasksBtn].forEach(btn => {
    btn.classList.remove('active');
  });
  
  if (filter === 'all') {
    allTasksBtn.classList.add('active');
  } else if (filter === 'active') {
    activeTasksBtn.classList.add('active');
  } else if (filter === 'completed') {
    completedTasksBtn.classList.add('active');
  }
  
  renderTasks();
}

function updateTasksCount() {
  const activeTasks = tasks.filter(task => !task.completed).length;
  const totalTasks = tasks.length;
  
  tasksCount.textContent = `${activeTasks} active / ${totalTasks} total`;
}

function updateClearCompletedButton() {
  const hasCompletedTasks = tasks.some(task => task.completed);
  
  if (hasCompletedTasks) {
    clearCompletedBtn.classList.remove('hidden');
  } else {
    clearCompletedBtn.classList.add('hidden');
  }
}

function showNotification(message, type = 'info') {
  // You can implement a notification system here
  console.log(`${type.toUpperCase()}: ${message}`);
  alert(message);
}