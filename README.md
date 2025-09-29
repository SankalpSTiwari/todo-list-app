# Todo List App

A vanilla HTML, CSS, and JavaScript todo list application built for learning core web development concepts from the ground up.

## Learning Goals

- Understand semantic HTML structure and accessibility basics
- Practice styling with modern CSS layout techniques
- Manipulate the DOM using vanilla JavaScript
- Manage application state and persist data in `localStorage`
- Learn Git fundamentals by tracking changes throughout development

## Project Structure

```
📁 todo-list-app
├── index.html     # Markup and DOM structure
├── styles.css     # Visual design and layout
├── app.js         # Application logic
└── README.md      # Documentation and learning notes
```

## Getting Started

1. **Open the project**

   ```bash
   cd /Users/sankalptiwari/Desktop/my_projects/todo-list-app
   ```

2. **Start a local server** (recommended)
   - If you have Python installed:

     ```bash
     python3 -m http.server 8000
     ```

   - Then visit `http://localhost:8000` in your browser.

3. **Edit files** with your favorite editor. Live reload tools (like VS Code Live Server) are helpful during development.

## Git Workflow

1. Initialize the repository:

   ```bash
   git init
   ```

2. Configure your name and email (if not set globally):

   ```bash
   git config user.name "Your Name"
   git config user.email "you@example.com"
   ```

3. Stage changes and commit:

   ```bash
   git add .
   git commit -m "Initial commit"
   ```

## Next Steps & Enhancements

- Add keyboard shortcuts (Enter to add, Escape to cancel edit)
- Implement drag-and-drop reordering
- Sync across devices using a backend or cloud storage
- Add unit tests with Jest or Vitest
- Create progressive web app (PWA) capabilities for offline usage

## License

MIT
