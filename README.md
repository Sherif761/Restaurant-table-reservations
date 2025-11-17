# Restaurant-table-reservations
A full backend system for managing restaurant reservations, built with Node.js, Express, and MongoDB.
This project was developed as a training/practice project, focusing on production-grade backend architecture, authentication, security, payment integration, and database monitoring.

📌 Features:
🔐 Authentication & Authorization:

-> Email/password registration

-> Email/password login

-> Secure sessions

-> User Managment system


🛡️ Security:

-> CSRF protection

-> XSS mitigation

-> Input validation & sanitization

-> Helmet, CORS, rate-limiting

-> Session hijacking prevention

-> Secure cookie handling


🧭 System Architecture:

-> MVC structure

-> Controllers + Services separation

-> Environment-based configuration

-> Error handling middleware


🛠️ CMS (Admin Panel)

AdminJS panel for managing:

-> Users

-> Reservations

-> Tables

-> Push, edit and delete meals

-> Restaurant settings


📅 Restaurant Reservation Logic

-> Make reservation

-> Cancel reservation

-> Check table availability

-> Prevent double booking

-> Time-slot validation

-> User reservation history


Project Structure:

Restaurant-Project/
│── README.md
│── package.json
│── app.js
│── test.html
|── test.js
│── .env
│
├── 📂 config/
│   ├── mongodb.js
│   ├── schemas.js
│
├── 📂 services/
│   ├── admin.js
│   ├── authentication.js
|   ├── tables.js
│
|── 📂 .adminjs/
    ├── adminJS.js
    ├── bundle.js
    ├── entry.js
