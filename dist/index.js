// Import `BskyAgent` class from '@atproto/api' pkg to interact w Bluesky API
import { BskyAgent } from '@atproto/api';

// Import `dotenv` pkg to load env variables from a `.env` file
import * as dotenv from 'dotenv';

// Import `CronJob` class from `cron` pkg to schedule tasks @ specific times
import { CronJob } from 'cron';

// Import `process` module to access env variables & sys properties
import * as process from 'process';

// Load env variables from the `.env` file into `process.env`
dotenv.config();

// Create new instance of Bluesky agent to handle communication w Bluesky service
const agent = new BskyAgent({
    service: 'https://bsky.social', // Specify the Bluesky service URL
});

// Define main function containing core logic for Bluesky posting
async function main() {
    // Log in to Bluesky w env variable credentials
    await agent.login({ 
        identifier: process.env.BLUESKY_USERNAME, // Bluesky username
        password: process.env.BLUESKY_PASSWORD // Bluesky password
    });
    await agent.post({
        text: "Am I dreaming or am I awake?\n\nI think I can see somthing."
    });
    console.log("Just posted!");
}
main();
// Run this on a cron job
const scheduleExpressionMinute = '* * * * *'; // Run once every minute for testing
const scheduleExpression = '0 */3 * * *'; // Run once every three hours in prod
const job = new CronJob(scheduleExpression, main); // change to scheduleExpressionMinute for testing
job.start();
