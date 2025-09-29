const todoForm = document.querySelector('#todo-form');
const todoTextInput = document.querySelector('#todo-text');
const todoItemsList = document.querySelector('#todo-items');
const todoCount = document.querySelector('#todo-count');
const clearCompletedButton = document.querySelector('#clear-completed');
const filterButtons = Array.from(document.querySelectorAll('.filter-button'));
const todoTemplate = document.querySelector('#todo-item-template');

let todos = loadTodos();
let currentFilter = 'all';

todoForm.addEventListener('submit', handleAddTodo);
clearCompletedButton.addEventListener('click', handleClearCompleted);
filterButtons.forEach((button) => {
  button.addEventListener('click', () => handleFilterChange(button.dataset.filter));
});

todoItemsList.addEventListener('click', handleItemAction);
todoItemsList.addEventListener('change', handleToggleCompleted);

render();

function handleAddTodo(event) {
  event.preventDefault();
  const text = todoTextInput.value.trim();

  if (!text) {
    todoTextInput.focus();
    return;
  }

  const newTodo = {
    id: crypto.randomUUID(),
    text,
    completed: false,
    createdAt: new Date().toISOString(),
  };

  todos = [newTodo, ...todos];
  todoTextInput.value = '';
  todoTextInput.focus();
  saveTodos();
  render();
}

function handleItemAction(event) {
  const target = event.target;
  const itemElement = target.closest('.todo-item');

  if (!itemElement) return;
  const id = itemElement.dataset.id;

  if (target.classList.contains('todo-delete')) {
    todos = todos.filter((todo) => todo.id !== id);
    saveTodos();
    render();
  }

  if (target.classList.contains('todo-edit')) {
    enterEditMode(itemElement, id);
  }
}

function handleToggleCompleted(event) {
  const checkbox = event.target;
  if (!checkbox.classList.contains('todo-checkbox')) return;

  const itemElement = checkbox.closest('.todo-item');
  if (!itemElement) return;

  const id = itemElement.dataset.id;
  todos = todos.map((todo) =>
    todo.id === id ? { ...todo, completed: checkbox.checked } : todo
  );

  saveTodos();
  render();
}

function handleClearCompleted() {
  todos = todos.filter((todo) => !todo.completed);
  saveTodos();
  render();
}

function handleFilterChange(filter) {
  currentFilter = filter;
  filterButtons.forEach((button) => {
    button.classList.toggle('is-active', button.dataset.filter === filter);
  });
  render();
}

function enterEditMode(itemElement, id) {
  const todo = todos.find((todo) => todo.id === id);
  if (!todo) return;

  const textSpan = itemElement.querySelector('.todo-text');
  const checkbox = itemElement.querySelector('.todo-checkbox');
  const editButton = itemElement.querySelector('.todo-edit');

  const input = document.createElement('input');
  input.type = 'text';
  input.value = todo.text;
  input.className = 'todo-edit-input';
  input.setAttribute('aria-label', 'Edit todo text');

  const submitEdit = () => {
    const newText = input.value.trim();
    if (!newText) {
      handleDelete(id);
      return;
    }
    todos = todos.map((todoItem) =>
      todoItem.id === id ? { ...todoItem, text: newText } : todoItem
    );
    saveTodos();
    render();
  };

  const cancelEdit = () => {
    render();
  };

  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      submitEdit();
    }
    if (event.key === 'Escape') {
      cancelEdit();
    }
  });

  input.addEventListener('blur', submitEdit, { once: true });

  itemElement.classList.add('editing');
  textSpan.replaceWith(input);
  editButton.disabled = true;
  checkbox.disabled = true;

  input.focus();
  input.select();
}

function handleDelete(id) {
  todos = todos.filter((todo) => todo.id !== id);
  saveTodos();
  render();
}

function render() {
  const filteredTodos = getFilteredTodos();
  todoItemsList.innerHTML = '';

  filteredTodos.forEach((todo) => {
    const item = todoTemplate.content.firstElementChild.cloneNode(true);
    item.dataset.id = todo.id;

    const checkbox = item.querySelector('.todo-checkbox');
    const textSpan = item.querySelector('.todo-text');

    checkbox.checked = todo.completed;
    textSpan.textContent = todo.text;

    if (todo.completed) {
      item.classList.add('completed');
    }

    todoItemsList.appendChild(item);
  });

  const total = todos.length;
  const active = todos.filter((todo) => !todo.completed).length;
  todoCount.textContent = `${total} item${total === 1 ? '' : 's'} total • ${active} active`;

  clearCompletedButton.hidden = todos.every((todo) => !todo.completed);
}

function getFilteredTodos() {
  switch (currentFilter) {
    case 'active':
      return todos.filter((todo) => !todo.completed);
    case 'completed':
      return todos.filter((todo) => todo.completed);
    default:
      return todos;
  }
}

function saveTodos() {
  try {
    localStorage.setItem('todos', JSON.stringify(todos));
  } catch (error) {
    console.error('Failed to save todos', error);
  }
}

function loadTodos() {
  try {
    const stored = localStorage.getItem('todos');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to parse stored todos', error);
    return [];
  }
}
