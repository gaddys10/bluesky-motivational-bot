// Import `BskyAgent` class from '@atproto/api' pkg to interact w Bluesky API
import { BskyAgent } from '@atproto/api';

// Import `dotenv` pkg to load env variables from a `.env` file
import * as dotenv from 'dotenv';

// Import `CronJob` class from `cron` pkg to schedule tasks @ specific times
import { CronJob } from 'cron';

// Import `process` module to access env variables & sys properties
import * as process from 'process';

// Import post list
import { posts }  from '../data/postList.js'

import http from 'http';

const PORT = process.env.PORT || 3000;

import { 
    likeSearchedPosts, 
    loginWithRateLimitHandling, 
    fetchAllPosts, 
    postToBlueSky, 
    followOhsyrusFollowers,
    likeFeed,
    getFormattedDate
} from './accountFunctions.js';

// Load env variables from the `.env` file into `process.env`
dotenv.config();

// Create new instance of Bluesky agent to handle communication w Bluesky service
const agent = new BskyAgent({
    service: 'https://bsky.social', // Specify the Bluesky service URL
});

// Example usage:
await loginWithRateLimitHandling(agent);

// change to scheduleExpressionMinute for testing
const scheduleExpressionMinute = '* * * * *'; // Run once every minute for testing

const postScheduleExpression = '12 */1 * * *'; // post once every 1h 12m in prod
const followScheduleExpression = '0 */1 * * *'; // Follow @ohsyrus followers once every 1h starting at 12am
const likeFeedScheduleExpression = '45 */1 * * *'; // like x/15 posts on the feed ever 1h 45m
const searchLikeScheduleExpression = '30 */1 * * *'; // search for motivation and like every 1h 30m
const repostScheduleExpression = '* * * * *';
const followBackScheduleExpression = '0 */6 * * *'; // Run every 6 hours starting at 12am


// Configure postToBlueSky to run on a 3 hour cron job
const postJob = new CronJob(
    postScheduleExpression, 
    async () => {
        await postToBlueSky(posts, agent);
    }
);

// Configure followOhsyrusFollowers to run every 45 minutes
const followJob = new CronJob(
    followScheduleExpression, 
    async () => {
        await followOhsyrusFollowers(agent);
    }
); 

// Configure likeSearchPosts to run every 30 minutes
const searchLikeJob = new CronJob(
    searchLikeScheduleExpression,
    async () => {
        await likeSearchedPosts(agent);
    }
);

const likeFeedJob = new CronJob(
    likeFeedScheduleExpression,
    async () => {
        await likeFeed(agent);
    }
)

// configure followBack to run twice daily
// const followBackJob = new CronJob()

// START POST CRON JOB! (8 posts/day)[Every 3h]
postJob.start();

// START @OHSYRUS FOLLOW CRON JOB! (36 follows of @ohsyrus followers/day)[Every 45m]
followJob.start();

// SEARCH LIKER CRON JOB (240 likes/day)[Every 30m]
searchLikeJob.start();

// TIMELINE LIKER CRON JOB (2 LIKES/DAY)[Every 12h]
likeFeedJob.start();

// QUOTE POST REPOST CRON JOB



// Simple HTTP server to keep Render happy
http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Cron jobs are running\n');
}).listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});