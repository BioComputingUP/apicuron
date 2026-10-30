<p align="center">
  <img src="apicuron-ui/src/assets/APICURON.svg" alt="APICURON Logo" />
</p>

<p align="center">
  <strong>A gamified platform to credit and acknowledge the contributions of biocurators.</strong>
</p>

<p align="center">
  <a href="https://doi.org/10.1093/database/baab019"><img src="https://img.shields.io/badge/DOI-10.1093%2Fdatabase%2Fbaab019-blue" alt="DOI"></a>
  <a href="https://pubmed.ncbi.nlm.nih.gov/33882120/"><img src="https://img.shields.io/badge/PubMed-33882120-green" alt="PubMed"></a>
  <img src="https://img.shields.io/badge/NestJS-10.x-E0234E?logo=nestjs&logoColor=white" alt="NestJS">
  <img src="https://img.shields.io/badge/Angular-17.x-DD0031?logo=angular&logoColor=white" alt="Angular">
  <img src="https://img.shields.io/badge/MongoDB-7.x-47A248?logo=mongodb&logoColor=white" alt="MongoDB">
  <img src="https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white" alt="Docker">
  <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License">
</p>

---

## Table of Contents

- [About APICURON](#about-apicuron)
- [Key Features](#key-features)
- [How It Works](#how-it-works)
- [Repository Structure](#repository-structure)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Setup](#environment-setup)
  - [Running with Docker Compose (Recommended)](#running-with-docker-compose-recommended)
  - [Manual / Local Development](#manual--local-development)
- [Service Architecture & Ports](#service-architecture--ports)
- [Production Logs](#production-logs)
- [Testing](#testing)
- [Citation](#citation)
- [Contributing](#contributing)
- [License](#license)

---

## About APICURON

Biocuration plays an essential role in scientific research, turning raw biological data into structured, FAIR (Findable, Accessible, Interoperable, and Reusable) knowledge. Despite its vital importance, acknowledging and quantifying curator contributions—especially across community-driven and distributed databases—has historically been difficult.

**APICURON** is an open-source platform designed to address this challenge. It provides biological databases and scientific resources with an automated tracking system to monitor, credit, and reward the work of biocurators. By leveraging **gamification** (badges, medals, scores, and leaderboards) and linking contributions directly to **ORCID** records, APICURON makes scientific curation activities visible, measurable, and citable.

---

## Key Features

- **Automated Activity Ingestion**: Receive curation events directly via REST API or automated synchronization from partner databases.
- **ORCID Authentication & Attribution**: Seamlessly associate curation efforts with verifiable researcher identities via ORCID.
- **Gamification Engine**: Dynamic calculation of scores, badges, medals, and activity rankings on the fly.
- **Embeddable Widgets**: Standalone leaderboard web components ready to be embedded directly into third-party database interfaces.
- **W3C PROV-O Compliance**: Curation actions map to standard lifecycle concepts (`generation`, `revision`, `invalidation`) and resolvers via `identifiers.org`.
- **Administrative Dashboard**: Intuitive management interfaces for resource owners to configure curation activities, scoring systems, and badge requirements.

---

## How It Works

Curation events submitted to APICURON consist of five core dimensions:

1. **Entity**: The curated data object, resolved via `identifiers.org`.
2. **Activity**: The action performed (e.g. `entry_creation`, `evidence_update`), mapped to W3C provenance lifecycle terms.
3. **Agent**: The biocurator responsible for the activity, identified by their unique ORCID ID.
4. **Timestamp**: The date and time when the curation activity took place.
5. **Score**: A weighted value assigned by the resource platform reflecting the effort required.

APICURON aggregates these events, calculates achievements, and exposes rankings and statistics via both its interactive web portal and public REST APIs.

---

## Repository Structure

This repository is organized as a monorepo containing both backend and frontend applications along with local and production deployment setups:

```text
apicuron/
├── apicuron-ws/               # NestJS backend API service
│   ├── src/                   # Controllers, modules, services, CQRS handlers
│   ├── test/                  # Unit and E2E test suites
│   ├── Dockerfile             # Multi-stage Dockerfile for the web server
│   └── package.json           # Backend dependencies and scripts
├── apicuron-ui/               # Angular frontend application
│   ├── src/                   # Angular components, services, and models
│   │   ├── app/               # Main application modules and pages
│   │   └── assets/            # Static assets, SVGs, and documentation
│   ├── projects/leaderboard/  # Embeddable leaderboard widget
│   ├── Dockerfile             # Multi-stage Dockerfile for UI
│   └── package.json           # Frontend dependencies and scripts
├── mongo/                     # MongoDB initialization scripts and configs
├── nginx.conf                 # Nginx reverse proxy configuration for development
├── docker-compose.yaml        # Main Docker Compose configuration
├── docker-compose.dev.yaml    # Development overlay configuration
├── docker-compose.prod.yaml   # Production overlay configuration
├── .env.example               # Example environment variable configuration
└── README.md                  # Project documentation
```

---

## Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Backend** (`apicuron-ws`) | [NestJS](https://nestjs.com/), TypeScript, [MongoDB](https://www.mongodb.com/) / Mongoose, CQRS, EventEmitter, Swagger/OpenAPI |
| **Frontend** (`apicuron-ui`)| [Angular](https://angular.dev/) (v17+), TypeScript, Angular Material, Tailwind CSS, Angular Elements (Widget) |
| **Database & Cache** | MongoDB 7, Memory Cache |
| **Infrastructure & Proxy** | Docker & Docker Compose, Nginx |
| **External Integrations** | ORCID OAuth API, Identifiers.org |

---

## Getting Started

### Prerequisites

Ensure you have the following installed on your machine:

- [Docker](https://docs.docker.com/get-docker/) & [Docker Compose](https://docs.docker.com/compose/)
- [Node.js](https://nodejs.org/) (v20 LTS recommended)
- [Yarn](https://yarnpkg.com/) (`corepack enable`)

### Environment Setup

Create your local `.env` configuration file from the template:

```bash
cp .env.example .env
```

Review `.env` and adjust database credentials or provide a GitHub token if needed:

```dotenv
MONGO_INITDB_ROOT_USERNAME=admin
MONGO_INITDB_ROOT_PASSWORD=secret
MONGODB_USER=apicuron
MONGODB_PASSWORD=secret
DATABASE_HOST=mongodb
DATABASE=apicuron
DB_PORT=27017
NODE_ENV=development
GITHUB_TOKEN=
```



### Running with Docker Compose (Recommended)

The easiest way to start the entire APICURON stack (Frontend, Backend, Database, and Nginx proxy) is with Docker Compose:

```bash
docker compose up --build
```

To run in the background (detached mode):

```bash
docker compose up -d
```

### Manual / Local Development

If you prefer to run services individually for active development:

#### 1. Start MongoDB
You can run a local MongoDB container:

```bash
docker compose up -d mongodb
```

#### 2. Backend (`apicuron-ws`)
Navigate to the backend directory, install dependencies, and start the development server:

```bash
cd apicuron-ws
yarn install
yarn start:dev
```
The API server will start on `http://localhost:3000` (or the port defined in your configuration). Interactive API documentation is available at `http://localhost:3000/api/docs`.

#### 3. Frontend (`apicuron-ui`)
Navigate to the frontend directory, install dependencies, and launch the Angular development server:

```bash
cd apicuron-ui
yarn install
yarn start-dev
```
The frontend application will be accessible at `http://localhost:4200`.

---

## Service Architecture & Ports

When running through the provided Docker Compose and Nginx proxy:

| Service | Internal Port | Host / Proxy URL | Description |
| :--- | :--- | :--- | :--- |
| **Proxy (Nginx)** | `3000` | `http://localhost:3000` | Unified gateway routing UI and API |
| **Web UI** (`apicuron-ui`) | `4200` | `http://localhost:3000/` or `http://localhost:4200` | Angular frontend client |
| **API Server** (`apicuron-ws`)| `3000` | `http://localhost:3000/api` | NestJS backend REST API |
| **API Swagger Docs** | `3000` | `http://localhost:3000/api/docs` | OpenAPI / Swagger interactive documentation |
| **Database** (`mongodb`) | `27017` | `localhost:27017` | MongoDB database engine |

---

## Production Logs

Containers log to the host's systemd journal, so logs persist across deployments. On the host:

```bash
journalctl CONTAINER_NAME=apicuron-webserver --since "1 hour ago"
journalctl CONTAINER_NAME=apicuron-webserver -f
```

Other containers: `apicuron-proxy-ui`, `apicuron-db`. Dev containers use the `-dev` suffix, except the database, which is `apicuron-mongo-dev`.

---

## Testing

### Backend Unit & E2E Tests
```bash
cd apicuron-ws
yarn test        # Unit tests
yarn test:cov    # Test coverage
yarn test:e2e    # End-to-end tests
```

### Frontend Unit Tests
```bash
cd apicuron-ui
npm test         # Angular test suite
```

---

## Citation

If you use APICURON in your research or integrate it into your biological database, please cite:

> **APICURON: a database to credit and acknowledge the work of biocurators**  
> *Database: The Journal of Biological Databases and Curation*, Volume 2021, 2021, baab019  
> DOI: [10.1093/database/baab019](https://doi.org/10.1093/database/baab019)  
> PMID: [33882120](https://pubmed.ncbi.nlm.nih.gov/33882120/)  

```bibtex
@article{apicuron2021,
  author    = {Apicuron Consortium},
  title     = {APICURON: a database to credit and acknowledge the work of biocurators},
  journal   = {Database},
  volume    = {2021},
  pages     = {baab019},
  year      = {2021},
  publisher = {Oxford University Press},
  doi       = {10.1093/database/baab019}
}
```

---

## Contributing

Contributions, suggestions, and bug reports are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

For larger changes or proposals, please open an issue first to discuss what you would like to change.

---

## License

This project is licensed under the GPL License - see the LICENSE file for details.
