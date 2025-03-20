FROM python:3.12-slim

ENV PYTHONBUFFERED=1

RUN apt-get update && apt-get install -y postgresql-client curl && rm -rf /var/lib/apt/lists/*

WORKDIR /cama_backend

COPY /requirements.txt .

RUN pip install -r requirements.txt

COPY . .

COPY wait-for-db.sh /wait-for-db.sh
RUN chmod +x /wait-for-db.sh

EXPOSE 8000

CMD ["bash", "-c", " python manage.py runserver 0.0.0.0:8000"]
