# 📊 Metrics Dashboard (AI-Generated)

A lightweight, responsive static Metrics Dashboard generated using AI prompts and containerized using Docker with Nginx.

This project demonstrates how to package and deploy a static web application using Docker, making it portable and easy to run across different environments.

---

## 🚀 Features

- Interactive Metrics Dashboard
- Responsive UI
- Built with HTML, CSS, and JavaScript
- Dockerized using Nginx
- Optimized with `.dockerignore`
- Easy deployment using Docker

---

## 📁 Project Structure

```
metrics-dashboard-static/
├── css/
│   └── style.css
├── js/
│   └── script.js
├── index.html
├── Dockerfile
├── .dockerignore
├── README.md
└── screenshots/
```

---

## 🛠️ Technologies Used

- HTML5
- CSS3
- JavaScript
- Docker
- Nginx

---

## 🐳 Docker Setup

### Build the Docker Image

```bash
docker build -t metrics-dashboard:v1 .
```

### Run the Docker Container

```bash
docker run -d --name metrics-dashboard -p 8080:80 metrics-dashboard:v1
```

### Access the Application

```
http://localhost:8080
```

---

## 📦 Docker Hub

Pull the published Docker image:

```bash
docker pull ramasashashank2003/elvixit_learning:metrics-dashboard-v1
```

Run directly from Docker Hub:

```bash
docker run -d --name metrics-dashboard -p 8080:80 ramasashashank2003/elvixit_learning:metrics-dashboard-v1
```

---

## 📷 Screenshots

Add screenshots in a `screenshots` folder.

Example:

- Dashboard UI
- Docker Build Output
- Running Container (`docker ps`)
- Docker Hub Repository

---

## 🧪 Testing

The project was tested by:

- Building the Docker image successfully.
- Running the container locally.
- Verifying the dashboard in the browser.
- Publishing the Docker image to Docker Hub.

---

## 🤖 AI Usage

The Metrics Dashboard source code was generated using AI prompts.

My contribution included:

- Reviewing the generated project structure.
- Dockerizing the application using Nginx.
- Creating the Dockerfile and `.dockerignore`.
- Building and testing the Docker image locally.
- Publishing the Docker image to Docker Hub.
- Organizing the project for version control.

---

## 📄 License

This project is intended for learning and demonstration purposes.
