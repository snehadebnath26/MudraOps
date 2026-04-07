# MudrasAI

A DevOps project for 6th semester that combines mudra guidance with a cloud-friendly deployment pipeline.

## What it does

- Provides a simple backend API for mudra descriptions and recommendations.
- Offers a frontend dashboard for selecting mood/goals and viewing recommended mudras.
- Includes Docker and Docker Compose for local deployment.
- Uses GitHub Actions CI to verify backend tests.

## Architecture

- `backend/` - FastAPI service with mudra endpoints
- `frontend/` - Static HTML + JavaScript UI
- `docker-compose.yml` - local orchestration for frontend + backend
- `.github/workflows/ci.yml` - CI pipeline for tests and linting

## Features

- Mood-based mudra recommendations
- Dictionary of common mudras and their benefits
- DevOps pipeline with Docker and CI
- Easy extension to add real hand-pose detection

## Local setup

1. Start the services:

```bash
docker compose up --build
```

2. Open the frontend:

```
http://localhost:8080
```

3. Call the backend API directly:

```
http://localhost:8000/docs
```

## Project novelty

This project is not just a static mudra learning site. It adds:
- a recommendation engine for wellness goals
- a deployable containerized architecture
- a CI workflow to validate code changes

## Next steps

- Add MediaPipe-based hand-pose recognition
- Add user session history and analytics
- Deploy with a cloud provider such as Railway or Render
