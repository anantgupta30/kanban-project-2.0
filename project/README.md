# Kanban Project

A kanban application which helps the user to keep track of their tasks and complete them before the deadline.

## Installation

Run the below command to install all the dependencies 

```bash
pip install -r requirements.txt
```
If python is not added to your path then run

```bash
python -m pip install -r requirements.txt
```
Having the virtual environment is not necessary but it is recommended to have before installation.

## Usage

If all the requirements are successfully installed, just start the server

```bash
python -m app.py
```
or simply app.py in the command prompt.

Note: The cmd should be opened in the same folder in which the app.py and requirements file are present. 
```bash
app.py
```
This will start the server. But we still need a tool for async tasks like exporting a tool. For that we use celery

## Celery

You can install celery using the official documentation from  docs.celeryq.dev

**Note:** Celery only works on linux environment. So, if you are a windows user, you better install the Ubuntu 20.04 in wsl.

After the celery is installed, you can start it by the following command

```bash
celery -A app.celery worker -l info
```
And for scheduled jobs like monthly report and daily alert, we use celery beat.

```bash
celery -A app.celery beat -l info --max-interval 1
```

By this time, you will be getting a CONNECTION REFUSED error.
Because, We need a message broker to send tasks to celery.

We will use redis for both caching and message broker.

## Redis

Install the redis from redis.io. It requires wsl as well.

After proper installation start redis server by the folllowing command

```bash
redis-server
```

And you are ready to Go....