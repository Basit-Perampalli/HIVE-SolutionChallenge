# Backend Setup

## Prerequisites

- Python 3 and pip
- Virtualenv (optional, but recommended)

## Installation

1. **Navigate to the backend directory:**

   ```bash
   cd backend
   ```

2. **Create a virtual environment (optional but recommended):**

   ```bash
   python -m venv venv
   ```

3. **Activate the virtual environment:**

   - On Windows:

     ```bash
     venv\\Scripts\\activate
     ```

   - On macOS and Linux:

     ```bash
     source venv/bin/activate
     ```

4. **Install the dependencies:**

   ```bash
   pip install -r requirements.txt
   ```

## Running the Backend

1. **Apply database migrations:**

   ```bash
   python manage.py migrate
   ```

2. **Start the development server:**

   ```bash
   python manage.py runserver
   ```

   This will start the backend on the default port (usually 8000). You can access it by navigating to `http://localhost:8000` in your web browser.

# Frontend Setup

## Prerequisites

- Node.js and npm

## Installation

1. **Navigate to the frontend directory:**

   ```bash
   cd frontend
   ```

2. **Install the dependencies:**

   ```bash
   npm install
   ```

## Running the Frontend

1. **Start the development server:**

   ```bash
   npm run dev
   ```

   This will start the frontend on the default port 5173. You can access it by navigating to `http://localhost:5173` in your web browser.
