# AutoRent Rasa chatbot — single image: trains the model, runs action server + Rasa API.
# Base image must match your installed Rasa version (see ../requirement.txt).
FROM rasa/rasa:3.6.21-full

USER root

WORKDIR /app

# Project files (see .dockerignore)
COPY . /app

# Extra deps for custom actions (rasa-sdk, requests, etc.)
RUN pip install --no-cache-dir -r actions/requirements.txt

# Train a fresh model in the image (first build can take several minutes)
RUN rasa train --fixed-model-name autorent

COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Rasa official image runs as non-root user
USER 1001

EXPOSE 5005 5055

ENV AUTORENT_API_URL=http://host.docker.internal:5000/api

ENTRYPOINT ["/docker-entrypoint.sh"]
