# Troubleshooter POC

A **Proof of Concept (POC)** for a **Distributed Incident Simulation and Resolution Platform**. This project demonstrates how to manage, simulate, and resolve debugging scenarios for infrastructure issues.

## Features

- **Scenario Management**:
  - Create and manage debugging scenarios involving realistic system issues.

- **Replay System**:
  - Record user actions during scenario resolution for replay and review.
  - Insights into mistakes and best resolution strategies.

- **Asynchronous Tasks**:
  - Background task processing using **Celery**.

- **Role-Based Access Control (RBAC)**:
  - Manage users with different roles (Admins, Engineers).
---

## Requirements

- Python 3.12
- Django 4.x
- SQLite (default database)
- RabbitMQ (for Celery)
- Redis (optional for caching)


## Local setup

Clone the repository
```python
git clone https://github.com/MikeMwita/fixme-backend
cd fixme-backend
```
Create & activate virtual env
```python
python3.12 -m venv .venv
source .venv/bin/activate

```

Install dependancies

```python
pip install --upgrade pip
pip install -r requirements.txt

```
Incase of errors with ssl while installing requirements do:

'''pip install -r requirements.txt --trusted-host pypi.org --trusted-host files.pythonhosted.org

'''

python manage.py makemigrations
python manage.py migrate
python manage.py runserver.

### Future Enhancements
- Add support for advanced metrics monitoring using Prometheus and Grafana.
- Implement Go-based microservices for real-time validation.
- Integrate distributed caching for performance optimization.

