# Cole Bot

**Cole Bot** is a personal Discord bot with various utility tools. It was originally built for my own use, but I figured why not publish the source here on GitHub? Maybe it’ll help someone, or at the very least, it won’t hurt.

# Deployment

This project is deployed using Docker and Docker Compose because containerization is awesome.
I’m not going to walk you through every step, but since you’re here, you probably already know how to handle that. If not, the `docker-compose.yml` file should give you a pretty good idea.

> [!TIP]
> Use the `docker compose -p "" up -d` to start all containers. Keep in mind you'll need to have configured the required environment variables for everything to work. I have provided [an example file](/.env.example) to help you.

# Contributing

Whether it’s fixing a bug, suggesting improvements, or adding new features, your help is always welcome.

## How to Contribute:

1. **Write Quality Code:** Keep it clean, readable, and in line with the project’s conventions. Clear comments are always appreciated.
2. **Use Prettier:** Format your code through the `format` command.
3. **Test Thoroughly:** Make sure your changes work well and don’t break existing functionality.
4. **Stay On Track:** Keep your contributions aligned with the bot's purpose and goals to maintain focus.

## What You Can Contribute:

1. Fix bugs or address reported issues.
2. Enhance existing features or improve code quality.
3. Add new features that align with the bot's goals (smaller, focused additions are best).

## Things to Avoid:

1. **Code Formatting:** No need to format manually; we use [Prettier](https://www.npmjs.com/package/prettier) for that.
2. **Typos:** While pointing out typos is great, please create an issue or let me know directly instead of making a pull request.
3. **Micro-optimizations:** Focus on meaningful improvements rather than tiny tweaks that don’t add much value.

Thanks!

# Licensing

This project is licensed under the **Apache 2.0 License**, meaning you can do pretty much anything you want. If you want to get into the specifics though, have a look at the [LICENSE](/LICENSE) file.
