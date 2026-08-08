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
