# Lemon Jelly Cafe — Cloud Deployment Code

## Overview

This folder contains the source code for the Lemon Jelly Cafe cloud deployment on Microsoft Azure. The application is a Node.js web server that serves the cafe's website and connects to an Azure SQL Database for live data.

## Files

| File | Description |
|------|-------------|
| app.js | Main application — Express server, API endpoints, cafe website |
| package.json | Node.js dependencies (Express, MSSQL) |
| Dockerfile | Builds the Docker container from Node.js Alpine image |
| docker-compose.yml | Runs the container on port 80 |
| test-db.js | Database connection test and table setup script |

## Tech Stack

- Node.js 20
- Express.js 4.18
- Azure SQL Database (mssql driver)
- Docker + Docker Compose

## How to Run

### 1. Clone the repo
git clone https://github.com/rahulgify01-dev/mba-cloud-project.git
cd mba-cloud-project/code
### 2. Set up environment
Update the database credentials in app.js with your Azure SQL Database details.

### 3. Run with Docker
### 4. Access the website
Open http://localhost or http://your-vm-ip in a browser.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | / | Serves the cafe website |
| GET | /api/menu | Returns menu items from database |
| GET | /api/staff | Returns staff schedule from database |
| GET | /api/orders | Returns recent orders from database |
| POST | /api/order | Places a new order to database |

## Azure Resources

| Resource | Details |
|----------|---------|
| Virtual Machine | Ubuntu Linux (B1s), IP: 20.121.42.237 |
| SQL Database | Server: lemonjelly-server |
| Blob Storage | For automated backups (pending) |

## Live Demo

http://20.121.42.237
