# AutoRent Rasa chatbot — Docker deployment

This folder (`rasachat`) is the **chatbot only**: one Docker image that contains the trained model, the **Rasa server** (REST API on port **5005**), and the **action server** (port **5055**, used internally by Rasa). Your MERN app talks to **5005** only.

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (or Docker Engine + Compose) installed and running.
- Optional: your AutoRent backend URL if custom actions call it (`AUTORENT_API_URL`).

## What the image does

1. **Build stage**: installs `actions/requirements.txt`, runs `rasa train --fixed-model-name autorent`.
2. **Runtime**: `docker-entrypoint.sh` starts `rasa run actions` on **5055**, then `rasa run --enable-api --cors "*"` on **5005**.

`endpoints.yml` uses `http://localhost:5055/webhook` — correct **inside** the same container.

## Build the image

From the `rasachat` directory (where the `Dockerfile` is):

```bash
cd rasachat
docker build -t autorent-rasa-chatbot:latest .
```

The first build can take **several minutes** (training DIET/TED with 100 epochs).

## Run the container

```bash
docker run --rm -p 5005:5005 ^
  -e AUTORENT_API_URL=http://host.docker.internal:5000/api ^
  autorent-rasa-chatbot:latest
```

On PowerShell, line continuation is `` ` `` instead of `^`:

```powershell
docker run --rm -p 5005:5005 `
  -e AUTORENT_API_URL=http://host.docker.internal:5000/api `
  autorent-rasa-chatbot:latest
```

- **5005**: Rasa HTTP API (your frontend or backend calls this).
- **AUTORENT_API_URL**: base URL your custom actions use (see `actions/actions.py`). Use your real API URL in production.

## Run with Docker Compose

```bash
cd rasachat
docker compose up --build
```

Override the API URL:

```bash
set AUTORENT_API_URL=https://api.example.com/api
docker compose up --build
```

## Smoke test

With the container running:

```bash
curl http://localhost:5005/version
```

Send a message (REST channel):

```bash
curl -X POST http://localhost:5005/webhooks/rest/webhook ^
  -H "Content-Type: application/json" ^
  -d "{\"sender\": \"test-user\", \"message\": \"hello\"}"
```

## Deploying the image

1. **Build and tag** for your registry:

   ```bash
   docker tag autorent-rasa-chatbot:latest your-registry/autorent-rasa-chatbot:1.0.0
   docker push your-registry/autorent-rasa-chatbot:1.0.0
   ```

2. **On the server**, pull and run with the correct **public** API URL and port:

   ```bash
   docker run -d -p 5005:5005 \
     -e AUTORENT_API_URL=https://your-backend.example.com/api \
     --name autorent-chatbot \
     your-registry/autorent-rasa-chatbot:1.0.0
   ```

3. **Reverse proxy** (optional): put Nginx or Traefik in front of `5005` with TLS.

4. **React / MERN**: point the chat widget or server to `https://your-chat-host/webhooks/rest/webhook` (or your chosen channel).

## Environment variables

| Variable | Purpose |
|----------|---------|
| `AUTORENT_API_URL` | Base URL for backend API calls from custom actions (default in image: `http://host.docker.internal:5000/api`). |

## Troubleshooting

- **Docker daemon not running**: start Docker Desktop, then retry `docker build`.
- **Action server errors**: ensure `actions/requirements.txt` matches what `actions/actions.py` imports.
- **Backend unreachable from container**: set `AUTORENT_API_URL` to a URL reachable from inside Docker (not `localhost` if the API runs on the host — use `host.docker.internal` on Windows/Mac, or the server’s LAN/public URL on Linux).

## Rebuild after changing stories or NLU

Edit `data/*.yml`, `domain.yml`, etc., then rebuild:

```bash
docker build --no-cache -t autorent-rasa-chatbot:latest .
```

Or use `docker compose build --no-cache`.
