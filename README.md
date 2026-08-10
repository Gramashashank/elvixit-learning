
# GitHub Actions Python CI Demo

## Overview

This repository demonstrates a basic GitHub Actions Continuous Integration (CI) workflow created as part of internship learning and training.

The workflow automatically runs whenever code is pushed to the `main` or `github-actions` branch, and also when a Pull Request is created for the `main` branch.

## Workflow Features

- Checkout the repository
- Set up Python 3.11
- Display the installed Python version
- Perform Python syntax validation using `compileall`
- List repository files
- Display a success message after successful execution

## Workflow File

```
.github/workflows/python-ci.yml
```

## Workflow Trigger

```yaml
on:
  push:
    branches:
      - github-actions
      - main

  pull_request:
    branches:
      - main
```

## Technologies Used

- GitHub Actions
- YAML
- Python 3.11
- Ubuntu GitHub Runner

## Learning Outcomes

Through this task, I learned how to:

- Create a GitHub Actions workflow
- Configure workflow triggers
- Use GitHub-hosted runners
- Set up Python using GitHub Actions
- Execute shell commands in workflow steps
- Perform basic Continuous Integration (CI)

## Workflow Status

✅ Successfully executed with all steps passing.

## Author

**Ramashashank Reddy Gunnala**


# GitHub and Jira Integration using MCP

## Overview

This project demonstrates how to configure GitHub and Jira using the Model Context Protocol (MCP). The MCP configuration allows an AI agent or MCP-compatible client to communicate with both GitHub and Jira through their respective MCP servers.

## Objective

- Connect GitHub using the official GitHub MCP Server.
- Connect Jira using the Atlassian MCP Server.
- Configure both servers using an MCP configuration file.
- Enable AI agents to interact with GitHub repositories and Jira projects.

## Repository Structure

```
.
├── .vscode
│   └── mcp.json
├── README.md
└── sample files
```

## GitHub MCP Server

The GitHub MCP Server enables AI agents to perform GitHub operations such as:

- View repositories
- List branches
- Read commits
- Create and manage issues
- View Pull Requests
- Manage repository contents

## Jira MCP Server

The Atlassian MCP Server enables AI agents to interact with Jira by:

- Viewing projects
- Creating issues
- Updating issues
- Assigning tasks
- Viewing sprint information

## MCP Configuration

The MCP configuration is stored in:

```
.vscode/mcp.json
```

The configuration includes:

- GitHub MCP Server
- Jira MCP Server
- GitHub Personal Access Token (PAT) environment variable

## Prerequisites

- Docker Desktop
- Git
- GitHub Account
- GitHub Personal Access Token (PAT)
- Jira (Atlassian) Account

## Workflow

```
                AI Agent
                    │
                    ▼
              MCP Client
               /       \
              /         \
 GitHub MCP Server   Jira MCP Server
         │                   │
         ▼                   ▼
     GitHub API          Jira API
```

## Features

- GitHub repository access
- Pull Request management
- Issue management
- Jira project access
- Jira issue management
- AI-powered workflow using MCP

## Technologies Used

- GitHub MCP Server
- Atlassian MCP Server
- Docker
- Git
- Model Context Protocol (MCP)

## References

- https://github.com/github/github-mcp-server
- https://github.com/atlassian/atlassian-mcp-server
