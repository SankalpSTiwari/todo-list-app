const todoForm = document.querySelector('#todo-form');
const todoTextInput = document.querySelector('#todo-text');
const todoPrioritySelect = document.querySelector('#todo-priority');
const todoDueDateInput = document.querySelector('#todo-due-date');
const todoCategorySelect = document.querySelector('#todo-category');
const todoItemsList = document.querySelector('#todo-items');
const todoCount = document.querySelector('#todo-count');
const clearCompletedButton = document.querySelector('#clear-completed');
const filterButtons = Array.from(document.querySelectorAll('.filter-button'));
const priorityFilterButtons = Array.from(
  document.querySelectorAll('.priority-filter')
);
const searchInput = document.querySelector('#search-input');
const todoTemplate = document.querySelector('#todo-item-template');

let todos = loadTodos();
let currentFilter = 'all';
let currentPriorityFilter = 'all';
let searchQuery = '';
let draggedElement = null;
let draggedIndex = null;

todoForm.addEventListener('submit', handleAddTodo);
clearCompletedButton.addEventListener('click', handleClearCompleted);
filterButtons.forEach((button) => {
  button.addEventListener('click', () =>
    handleFilterChange(button.dataset.filter)
  );
});
priorityFilterButtons.forEach((button) => {
  button.addEventListener('click', () =>
    handlePriorityFilterChange(button.dataset.priority)
  );
});
searchInput.addEventListener('input', handleSearch);

todoItemsList.addEventListener('click', handleItemAction);
todoItemsList.addEventListener('change', handleToggleCompleted);
todoItemsList.addEventListener('dragstart', handleDragStart);
todoItemsList.addEventListener('dragover', handleDragOver);
todoItemsList.addEventListener('dragenter', handleDragEnter);
todoItemsList.addEventListener('drop', handleDrop);
todoItemsList.addEventListener('dragend', handleDragEnd);

render();

// Test drag functionality
console.log(
  'Todo app loaded. Try dragging items by the drag handle (6-dot icon)'
);

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
    dueDate: todoDueDateInput.value || null,
    priority: todoPrioritySelect.value,
    category: todoCategorySelect.value,
    order: todos.length, // Add order property for custom sorting
  };

  todos = [newTodo, ...todos];
  todoTextInput.value = '';
  todoDueDateInput.value = '';
  todoPrioritySelect.value = 'medium';
  todoCategorySelect.value = 'general';
  todoTextInput.focus();
  saveTodos();
  render();
}

function handleItemAction(event) {
  const target = event.target;
  const itemElement = target.closest('.todo-item');

  if (!itemElement) return;

  // Don't trigger actions when clicking on drag handle
  if (target.closest('.drag-handle')) {
    return;
  }

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

function handlePriorityFilterChange(priority) {
  currentPriorityFilter = priority;
  priorityFilterButtons.forEach((button) => {
    button.classList.toggle('is-active', button.dataset.priority === priority);
  });
  render();
}

function handleSearch(event) {
  searchQuery = event.target.value.toLowerCase().trim();
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
    const prioritySpan = item.querySelector('.todo-priority');
    const categorySpan = item.querySelector('.todo-category');
    const dueDateSpan = item.querySelector('.todo-due-date');

    checkbox.checked = todo.completed;
    textSpan.textContent = todo.text;

    // Set priority with color coding
    prioritySpan.textContent = todo.priority.toUpperCase();
    prioritySpan.className = `todo-priority priority-${todo.priority}`;

    // Set category
    categorySpan.textContent = todo.category;
    categorySpan.className = `todo-category category-${todo.category}`;

    // Set due date with overdue highlighting
    if (todo.dueDate) {
      const dueDate = new Date(todo.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      dueDate.setHours(0, 0, 0, 0);

      dueDateSpan.textContent = formatDate(todo.dueDate);

      if (dueDate < today && !todo.completed) {
        dueDateSpan.className = 'todo-due-date overdue';
      } else if (dueDate.getTime() === today.getTime()) {
        dueDateSpan.className = 'todo-due-date due-today';
      } else {
        dueDateSpan.className = 'todo-due-date';
      }
    } else {
      dueDateSpan.textContent = '';
    }

    if (todo.completed) {
      item.classList.add('completed');
    }

    todoItemsList.appendChild(item);
  });

  const total = todos.length;
  const active = todos.filter((todo) => !todo.completed).length;
  todoCount.textContent = `${total} item${
    total === 1 ? '' : 's'
  } total • ${active} active`;

  clearCompletedButton.hidden = todos.every((todo) => !todo.completed);
}

function getFilteredTodos() {
  let filtered = todos;

  // Filter by completion status
  switch (currentFilter) {
    case 'active':
      filtered = filtered.filter((todo) => !todo.completed);
      break;
    case 'completed':
      filtered = filtered.filter((todo) => todo.completed);
      break;
    default:
      // Show all
      break;
  }

  // Filter by priority
  if (currentPriorityFilter !== 'all') {
    filtered = filtered.filter(
      (todo) => todo.priority === currentPriorityFilter
    );
  }

  // Filter by search query
  if (searchQuery) {
    filtered = filtered.filter(
      (todo) =>
        todo.text.toLowerCase().includes(searchQuery) ||
        todo.category.toLowerCase().includes(searchQuery)
    );
  }

  // Sort by custom order first, then by priority and due date
  return filtered.sort((a, b) => {
    // First sort by custom order (if exists)
    if (a.order !== undefined && b.order !== undefined) {
      return a.order - b.order;
    }

    // Fallback to priority and date sorting for items without order
    const priorityOrder = { high: 3, medium: 2, low: 1 };

    // First sort by completion (incomplete first)
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }

    // Then by priority
    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
    if (priorityDiff !== 0) return priorityDiff;

    // Then by due date (earliest first, null dates last)
    if (a.dueDate && b.dueDate) {
      return new Date(a.dueDate) - new Date(b.dueDate);
    }
    if (a.dueDate && !b.dueDate) return -1;
    if (!a.dueDate && b.dueDate) return 1;

    // Finally by creation date (newest first)
    return new Date(b.createdAt) - new Date(a.createdAt);
  });
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === tomorrow.toDateString()) {
    return 'Tomorrow';
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
    });
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

// Drag and Drop Functions
function handleDragStart(event) {
  const todoItem = event.target.closest('.todo-item');
  if (!todoItem) return;

  console.log('Drag start:', todoItem.dataset.id);

  draggedElement = todoItem;
  draggedIndex = Array.from(todoItemsList.children).indexOf(todoItem);

  todoItem.classList.add('dragging');
  event.dataTransfer.effectAllowed = 'move';
  event.dataTransfer.setData('text/plain', todoItem.dataset.id);

  // Store the todo ID for later use
  event.dataTransfer.setData(
    'application/json',
    JSON.stringify({
      todoId: todoItem.dataset.id,
      fromIndex: draggedIndex,
    })
  );
}

function handleDragOver(event) {
  event.preventDefault();
  event.dataTransfer.dropEffect = 'move';

  const afterElement = getDragAfterElement(todoItemsList, event.clientY);
  const dragging = document.querySelector('.dragging');

  if (!dragging) return;

  if (afterElement == null) {
    todoItemsList.appendChild(dragging);
  } else {
    todoItemsList.insertBefore(dragging, afterElement);
  }
}

function handleDragEnter(event) {
  event.preventDefault();
}

function handleDrop(event) {
  event.preventDefault();
  console.log('Drop event triggered');

  try {
    // Get the drag data
    const dragData = JSON.parse(event.dataTransfer.getData('application/json'));
    const draggedTodoId = dragData.todoId;
    const fromIndex = dragData.fromIndex;

    console.log('Dropped todo:', draggedTodoId, 'from index:', fromIndex);

    // Find the drop target
    const dropTarget = event.target.closest('.todo-item');
    if (!dropTarget) {
      console.log('No valid drop target');
      return;
    }

    const toIndex = Array.from(todoItemsList.children).indexOf(dropTarget);
    console.log('Drop target index:', toIndex);

    if (fromIndex === toIndex) {
      console.log('Same position, no change needed');
      return;
    }

    // Find the actual todos in the main array
    const draggedTodoIndex = todos.findIndex(
      (todo) => todo.id === draggedTodoId
    );
    const targetTodoIndex = todos.findIndex(
      (todo) => todo.id === dropTarget.dataset.id
    );

    if (draggedTodoIndex === -1 || targetTodoIndex === -1) {
      console.log('Could not find todos in main array');
      return;
    }

    console.log('Moving from', draggedTodoIndex, 'to', targetTodoIndex);

    // Get current DOM order (what user sees)
    const currentOrder = Array.from(todoItemsList.children).map(
      (item) => item.dataset.id
    );
    console.log('Current DOM order:', currentOrder);

    // Update the todos array to match the DOM order
    const reorderedTodos = [];
    currentOrder.forEach((todoId) => {
      const todo = todos.find((t) => t.id === todoId);
      if (todo) {
        reorderedTodos.push(todo);
      }
    });

    // Update order property for all todos
    reorderedTodos.forEach((todo, index) => {
      todo.order = index;
    });

    // Replace the todos array
    todos = reorderedTodos;

    console.log(
      'New order:',
      todos.map((t) => t.text)
    );
    saveTodos();
    render();
  } catch (error) {
    console.error('Error in drop handler:', error);
  }
}

function handleDragEnd(event) {
  const todoItem = event.target.closest('.todo-item');
  if (todoItem) {
    todoItem.classList.remove('dragging');
  }

  draggedElement = null;
  draggedIndex = null;
}

function getDragAfterElement(container, y) {
  const draggableElements = [
    ...container.querySelectorAll('.todo-item:not(.dragging)'),
  ];

  return draggableElements.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;

      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    },
    { offset: Number.NEGATIVE_INFINITY }
  ).element;
}
