import { Telegraf } from "telegraf";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

// Ensure the bot token is defined
if (!process.env.TOKEN) {
  console.error("Error: Bot token is not defined in the .env file.");
  process.exit(1);
}

// Initialize the bot
const bot = new Telegraf(process.env.TOKEN);

// Read resources from JSON file with error handling
let resources;
try {
  const data = fs.readFileSync("resources.json", "utf8");
  resources = JSON.parse(data);
} catch (error) {
  console.error("Error reading resources.json:", error.message);
  process.exit(1);
}

// Start command
bot.command("start", (ctx) => {
  ctx.reply(
    "Hello! I can send you learning resources. Use /getresources <subject> to get files.\nExample: /getresources math"
  );
});

// Get resources command
bot.command("getresources", async (ctx) => {
  const args = ctx.message.text.split(" ");
  const subject = args[1]?.toLowerCase(); // Get the subject and make it lowercase

  if (!subject) {
    return ctx.reply("Please specify a subject. Example: /getresources math");
  }

  // Find resources for the subject
  if (resources[subject]) {
    for (const resource of resources[subject]) {
      // Check if the file exists before sending
      if (fs.existsSync(resource.file)) {
        await ctx.replyWithDocument({
          source: resource.file,
          filename: resource.title,
        });
      } else {
        ctx.reply(`Sorry, the file "${resource.title}" is not available.`);
      }
    }
  } else {
    ctx.reply(
      `Sorry, I don't have resources for "${subject}". Please try another subject.`
    );
  }
});

// Launch the bot
bot.launch().then(() => {
  console.log("Bot is running!");
});
