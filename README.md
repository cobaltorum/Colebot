# Discord Bot TypeScript Template

A simple, plug-and-play template designed for building Discord bots using TypeScript and Discord.js.

## Why Use This Template?

When I started building my own Discord bots, I found there weren’t many solid starter templates out there. This project addresses that gap by providing a clean, well-organized foundation. With this template, you can focus on writing your bot’s logic instead of spending time on setting up your project structure.

# Development

For detailed instructions on how to extend the template and follow best practices, refer to [`the full development documentation`](./documentation/Development.md).

# Deployment

## Prerequisites

-   `.env` file in the root directory with the necessary variables (see [`/.env.example`](.env.example)).
-   `docker` & `docker compose` installed on your machine.

> [!NOTE]
> This template has been tested for deployment in a Unix/Linux based environment. Additionally, you'll need to tailor the `docker-compose.yml` file to your needs depending on what you decide to add to the bot, and you'll need to learn how to use properly docker/docker compose if you don't already know.

## Docker Commands

### Starting the bot

```bash
sudo docker compose -p "" up -d
```

### Shutting down the bot

```bash
sudo docker compose down
```

### Restarting the bot

```bash
sudo docker compose restart
```

### Rebuilding the bot

```
sudo docker compose build
```
