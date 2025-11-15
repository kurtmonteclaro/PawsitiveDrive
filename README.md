# 🐾 Pawsitive Drive

Pawsitive Drive is a web application designed to help pet owners manage, track, and support animal welfare initiatives.  
This project is built with **React** for the frontend and **Spring Boot (Java)** for the backend, using **MySQL** as the main database.

---

## 🚀 Tech Stack
**Frontend:**
- React (Create React App)
- HTML, CSS, JavaScript

**Backend:**
- Java Spring Boot
- Spring Web
- Spring Data JPA
- MySQL Database

---

## 🧩 Setup Instructions

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/<your-username>/PawsitiveDrive.git
cd PawsitiveDrive
```

### 2️⃣ Database Setup (MySQL)

**Prerequisites:**
- Install MySQL if you haven't already: [Download MySQL](https://dev.mysql.com/downloads/installer/)
- Make sure MySQL is running on your system

**Steps:**

1. **Start MySQL Service** (if not already running)
   - Windows: Check Services or run MySQL from Start Menu
   - Mac: `brew services start mysql` or use MySQL Workbench
   - Linux: `sudo systemctl start mysql`

2. **Create the Database:**
   
   Open MySQL command line or MySQL Workbench and run:
   ```sql
   CREATE DATABASE pawsitivedrive_db;
   ```
   
   Or using command line:
   ```bash
   mysql -u root -p
   # Then enter your MySQL password (or press Enter if no password)
   CREATE DATABASE pawsitivedrive_db;
   EXIT;
   ```

3. **Update Database Credentials** (if needed):
   
   Edit `backend/backend/src/main/resources/application.properties`:
   - If your MySQL username is not `root`, change `spring.datasource.username`
   - If your MySQL has a password, add it to `spring.datasource.password`
   
   Example:
   ```properties
   spring.datasource.username=root
   spring.datasource.password=your_password_here
   ```

### 3️⃣ Backend Setup (Spring Boot)

1. **Navigate to backend folder:**
   ```bash
   cd backend/backend
   ```

2. **Run the backend:**
   
   # On Windows:
   ```bash
   .\mvnw.cmd spring-boot:run
   ```
   
   # On Mac/Linux:
   ```bash
   ./mvnw spring-boot:run
   ```

   **Note:** The backend will automatically:
   - Create all database tables (thanks to `ddl-auto=update`)
   - Initialize roles (Donor and Admin) on first run
   - Start on `http://localhost:8080`

### 4️⃣ Frontend Setup (React)

1. **Navigate to frontend folder:**
   ```bash
   cd frontend/pawsitive-drive-frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the React development server:**
   ```bash
   npm start
   ```

   The app will open at `http://localhost:3000`

---

## ✅ Quick Start Checklist

- [ ] MySQL installed and running
- [ ] Database `pawsitivedrive_db` created
- [ ] Database credentials updated in `application.properties` (if needed)
- [ ] Backend running on port 8080
- [ ] Frontend running on port 3000

---

## 🧠 Features (Planned)

🐶 User authentication (pet owners, organizations)

📋 Manage pet adoption and rescue drives

📍 Location-based drive tracking

📊 Dashboard for drive analytics

💬 Contact and feedback form


👥 Developers

    Kurt David Monteclaro – Frontend Developer
    Andrei Sam Loy - Frontend Developer
    Xavier John Sabornido - Backend Developer