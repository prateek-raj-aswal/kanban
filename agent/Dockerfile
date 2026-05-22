FROM python:3.11-slim

RUN addgroup --system appgroup && \
    adduser --system --ingroup appgroup appuser

WORKDIR /app

RUN pip install --no-cache-dir fastapi==0.115.12 "uvicorn[standard]==0.34.3"

COPY main.py .

RUN chown -R appuser:appgroup /app
USER appuser

EXPOSE 8001

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001"]
