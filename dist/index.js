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

// Load env variables from the `.env` file into `process.env`
dotenv.config();

// Create new instance of Bluesky agent to handle communication w Bluesky service
const agent = new BskyAgent({
    service: 'https://bsky.social', // Specify the Bluesky service URL
});

// Log in to Bluesky w env variable credentials
await agent.login({ 
    identifier: process.env.BLUESKY_USERNAME, // Bluesky username
    password: process.env.BLUESKY_PASSWORD // Bluesky password
});

// FUNCTION: Collect all posts
async function fetchAllPosts(agent) {
    const allPosts = [];
    let cursor;

    do {
        const { data } = await agent.getAuthorFeed({
            actor: process.env.BLUESKY_USERNAME,
            cursor,
            limit: 20,
        });

        allPosts.push(...data.feed);
        cursor = data.cursor; // Pagination
    } while (cursor);

    return allPosts;
}

// FUNCTION: Bluesky posting
async function postToBlueSky(postArray) {

    //get all posts
    const allPosts = await fetchAllPosts(agent);

    //get random post from postArray
    let randomIndex = Math.floor(Math.random() * postArray.length)
    let newPost = postArray[randomIndex]

    //check if post exists
    let postExists = allPosts.some(post => post === newPost);

    // if post already exists, recursively look for another post and exit function after
    if(postExists){
        console.log("Selected post has already been posted.. finding another one");
        postToBlueSky(postArray)
        return;
    }

    // Post to BlueSky
    await agent.post({
        text: newPost,
        createdAt: new Date().toISOString()
    });

    // Log post success
    console.log(`Just posted: ${newPost}`);
}

async function followOhsyrusFollowers(actor) {
    const allFollowers = [];
    let cursor = null;

    console.log(`Fetching all followers for @${actor}...`);

    // Fetch all followers using pagination
    do {
        const response = await agent.api.app.bsky.graph.getFollowers({
            actor,
            cursor,
            limit: 100, // Maximum limit per API request
        });

        // Extract Followers
        const { followers, cursor: nextCursor } = response.data;

        // Add fetched followers to the list
        allFollowers.push(...followers);

        // Update the cursor for the next page
        cursor = nextCursor;

    } while (cursor);

    console.log(`${allFollowers.length} currently following @ohsyrus.bsky.social`)

    // For each follower starting from earlierst (to only run once)
    for (let i = allFollowers.length - 1; i >= 0; i--) {
        const follower = allFollowers[i];
        try {
            // Check if already following
            if (!follower.viewer?.following) {
                //Follow by DID if not following & exit loop
                console.log(`Now following: ${follower.handle}`);
                await agent.follow(follower.did);
                break;
            } else {
                console.log(`Already following: ${follower.handle}. Skipping..`);
            }
            
        } catch (error) {
            console.error(`Error following ${follower.handle}:`, error);
        }
    }
}

// Configure postToBlueSky to run on a 3 hour cron job
const scheduleExpressionMinute = '* * * * *'; // Run once every minute for testing

const postScheduleExpression = '0 */3 */30 * *'; // Run once every three hours in prod
const postJob = new CronJob(postScheduleExpression, postToBlueSky(posts)); // change to scheduleExpressionMinute for testing

// Configure followOhsyrusFollowers to run every 30 minutes
const likeScheduleExpression = '0 * */10 * *'; // Run once every 10 minutes in prod
const likeJob = new CronJob(likeScheduleExpression, followOhsyrusFollowers('ohsyrus.bsky.social')); // change to scheduleExpressionMinute for testing

// START POST CRON JOB!
postJob.start();

// START LIKE CRON JOB!
likeJob.start();
