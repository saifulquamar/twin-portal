FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Copy portal web application files and server
COPY portal/ ./portal/
COPY server.py .

# Cloud Run automatically sets the PORT environment variable (default 8080)
ENV PORT=8080
EXPOSE 8080

CMD ["python", "server.py"]
