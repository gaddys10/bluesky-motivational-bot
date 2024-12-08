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
        identifier: process.env.BLUESKY_USERNAME!, // Bluesky username
        password: process.env.BLUESKY_PASSWORD!  // Bluesky password
    });

    // Check to see if message already exists on page

    // Post motivational or test message to Bluesky
    await agent.post({
        text: "Am I dreaming or am I awake?\\u000A I think I can see somthing." // The text content of the post
    });

    // Log a message to the console indicating the post was successful
    console.log("Just posted!");
}

// Call the main function to log in and post to Bluesky immediately when the script runs
main();

// Define cron job schedules to run the `main` function at specific intervals
const scheduleExpressionMinute = '* * * * *'; // Schedule for every minute (useful for testing)
const scheduleExpression = '0 */3 * * *'; // Schedule for every three hours (production)

// Create a cron job instance that runs the `main` function on the defined schedule
const job = new CronJob(scheduleExpression, main); // Replace with `scheduleExpressionMinute` for testing

// Start the cron job to begin executing on the defined schedule
job.start();
