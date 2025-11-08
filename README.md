# Pharmacy Management System

A streamlined, user‑friendly system designed for pharmacies to manage inventory, sales, staff and analytics — built with Node.js, Express, MySQL and EJS.

---

## Table of Contents

1. [Features](#features)  
2. [Tech Stack](#tech‑stack)  
3. [Getting Started](#getting‑started)  
   1. [Prerequisites](#prerequisites)  
   2. [Installation](#installation)  
   3. [Configuration](#configuration)  
   4. [Running Locally](#running‑locally)  
4. [Usage](#usage)  
5. [Project Structure](#project‑structure)  
6. [Contributing](#contributing)  
7. [License](#license)  
8. [Contact](#contact)

---

## Features  

- Secure authentication system supporting **Admin** and **Staff** roles  
- Role‑based permissions to control access to different modules  
- Inventory management: add/edit/delete medicines, track stock levels  
- Sales processing: create sales orders, generate receipts, manage customers  
- Dashboard with real‑time statistics and reports (e.g., total sales, low inventory alerts)  
- Search and filter capabilities (medicines, customers, sales history)  
- Responsive UI layout to support desktop usage (and mobile where applicable)  
- Environment variable support for secure configuration

---

## Tech Stack  

- **Backend:** Node.js + Express  
- **Database:** MySQL  
- **Frontend Rendering:** EJS templates  
- **Styling:** Bootstrap  
- **Environment Management:** dotenv  
- **Session & Authentication:** express-session, bcrypt, middleware  
- **Folder Structure & Logging:** custom controllers, helpers, middleware, utils & logs folders  

---

## Getting Started  

### Prerequisites  
- Node.js (v14+ recommended)  
- npm (comes with Node.js)  
- MySQL server running (and access credentials)  

### Installation  
1. Clone the repository:  
   ```bash
   git clone https://github.com/nabil-assi/Pharmacy-Managment-System.git
   cd Pharmacy-Managment-System
   ```  
2. Install dependencies:  
   ```bash
   npm install
   ```  

### Configuration  
1. Copy the example environment file:  
   ```bash
   cp .env.example .env
   ```  
2. Edit `.env` to configure your database connection and other settings, e.g.:  
   ```
   DB_HOST=localhost  
   DB_USER=root  
   DB_PASSWORD=yourpassword  
   DB_NAME=pharmacy_db  
   SESSION_SECRET=your_secret_key  
   ```  

### Running Locally  
Start the application:  
```bash
npm run dev   # or `node app.js` as appropriate
```  
Open your browser and navigate to:  
```
http://localhost:3000/login
```

---

## Usage  
- **Admin user** — full access: manage staff, medicines, sales reports, etc.  
- **Staff user** — limited access: manage sales and customers, view inventories they are authorized for.  
- In the dashboard you can monitor key metrics: total sales, active invoices, low‑stock alerts.  
- Use the navigation to enter new sales, manage medicine stocks, view and export reports (future feature).

---

## Project Structure  
```text
/config             # configuration files (DB, sessions, etc)  
/controllers         # route handlers  
/helper              # utility modules  
/logs                # logs for errors, requests, transactions  
/middleware          # custom middleware (auth, roles, etc)  
/public              # static assets (CSS, JS, images)  
/routes              # route definitions  
/tests/integration   # integration tests  
/utils               # misc utility functions  
/views               # EJS templates  
app.js               # application entry point  
.env.example         # environment variable template  
```

---

## Contributing  
Contributions are welcome! Please follow these steps:  
1. Fork the repository  
2. Create a feature branch (`git checkout -b feature/MyNewFeature`)  
3. Commit your changes (`git commit -am 'Add my new feature'`)  
4. Push to the branch (`git push origin feature/MyNewFeature`)  
5. Open a Pull Request describing your changes  

Please ensure your code adheres to existing styling, includes tests where applicable, and passes any linting or build steps before submitting.

---

## License  
This project is licensed under the [MIT License](LICENSE) — feel free to use, modify and distribute as permitted by the license.

---

## Contact  
Created and maintained by **Nabil Assi**.  
If you have any questions or suggestions, please feel free to reach out!
