# Vanilla To-Do List Application

A full-stack To-Do application built with vanilla JavaScript, Node.js, Express, and SQLite. This application demonstrates how to build a modern web application without using any frontend frameworks.

## Features

- Create, read, update, and delete tasks (CRUD operations)
- Mark tasks as completed
- Filter tasks (All, Active, Completed)
- Persistent storage with SQLite database
- Responsive design with modern CSS
- REST API with Express.js

## Tech Stack

### Frontend
- HTML5
- CSS3
- Vanilla JavaScript
- Fetch API for AJAX requests

### Backend
- Node.js
- Express.js
- SQLite3 for data persistence
- RESTful API

## Installation

1. Clone the repository:
```
git clone https://github.com/yourusername/to-do-list.git
cd to-do-list
```

2. Install dependencies:
```
npm install
```

3. Start the server:
```
npm start
```

4. For development with auto-reload:
```
npm run dev
```

5. Open your browser and navigate to:
```
http://localhost:3000
```

## API Endpoints

| Method | Endpoint         | Description                   |
|--------|------------------|-------------------------------|
| GET    | /api/tasks       | Get all tasks                 |
| GET    | /api/tasks/:id   | Get a specific task           |
| POST   | /api/tasks       | Create a new task             |
| PUT    | /api/tasks/:id   | Update a task                 |
| PATCH  | /api/tasks/:id   | Update task completion status |
| DELETE | /api/tasks/:id   | Delete a task                 |

## Project Structure

```
to-do-list/
├── public/               # Frontend files
│   ├── css/              # CSS stylesheets
│   │   └── styles.css    # Main CSS file
│   ├── js/               # JavaScript files
│   │   └── app.js        # Main JS file
│   └── index.html        # Main HTML file
├── server/               # Backend files
│   ├── database/         # Database related files
│   │   ├── schema.js     # Database schema
│   │   └── todo.db       # SQLite database file
│   └── routes.js         # API routes
├── server.js             # Express server setup
├── package.json          # Project dependencies
└── README.md             # Project documentation
```

## License

ISC
