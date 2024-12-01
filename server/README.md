# Commands for starting the server:

## Create Virtual Environment:

### Create virtual environment
```bash
python -m venv venv
```
### Start virtual environment
```bash
venv\Scripts\activate
```
### Install all libraries
```bash
pip install -r requirements.txt
```
### Make all Migrations and Migrate
```bash
python manage.py makemigrations
```
```bash
python manage.py migrate
```

## Start the server:

### Start virtual environment
```bash
venv\Scripts\activate
```
### Start the server
```bash
python manage.py runserver
```
