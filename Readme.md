# Troubleshooter POC

A **Proof of Concept (POC)** for a **Distributed Incident Simulation and Resolution Platform**. This project demonstrates how to manage, simulate, and resolve debugging scenarios for infrastructure issues. Built with **Django** and **Python 3.12**, it includes robust features like state transitions, role-based access control, asynchronous task handling, and more.

---

## Table of Contents

1. [Features](#features)
2. [Requirements](#requirements)
3. [Installation](#installation)
4. [Usage](#usage)
5. [Project Structure](#project-structure)
6. [Models](#models)
7. [Contributing](#contributing)
8. [License](#license)

---

## Features

- **Scenario Management**:
  - Create and manage debugging scenarios involving realistic system issues.
  - Transition states for scenario lifecycle (`CREATED`, `RUNNING`, `COMPLETED`, `FAILED`).

- **Replay System**:
  - Record user actions during scenario resolution for replay and review.
  - Insights into mistakes and best resolution strategies.

- **State Transitions**:
  - Advanced state transition management with transition logs and graphs.

- **Asynchronous Tasks**:
  - Background task processing using **Celery**.
  - Configured with SQLite and RabbitMQ for task queuing and execution.

- **Role-Based Access Control (RBAC)**:
  - Manage users with different roles (Admins, Engineers).

- **Scalable Architecture**:
  - Modular and extensible with separate apps for core functionalities.

---

## Requirements

- Python 3.12
- Django 4.x
- SQLite (default database)
- RabbitMQ (for Celery)
- Redis (optional for caching)

---

## Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/yourusername/troubleshooter_poc.git
   cd troubleshooter_poc
Set Up a Virtual Environment:

```bash
python3 -m venv venv
source venv/bin/activate
Install Dependencies:

```
pip install -r requirements.txt
```

Configure the Environment:

Run Migrations:

```
python manage.py migrate
```
Start the Development Server:

```
python manage.py runserver
```
Run Celery Worker (optional):

```bash
celery -A fixme worker --loglevel=info

```

### Future Enhancements
- Add support for advanced metrics monitoring using Prometheus and Grafana.
- Implement Go-based microservices for real-time validation.
- Introduce a full RBAC management interface for administrators.
- Integrate distributed caching for performance optimization.

