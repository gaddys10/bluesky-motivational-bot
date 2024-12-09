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

    const allPosts = await fetchAllPosts(agent);
    let newPost;
    let postExists = true;

    while (postExists) {
        const randomIndex = Math.floor(Math.random() * postArray.length);
        newPost = postArray[randomIndex];
        postExists = allPosts.some(post => post.text === newPost); // Compare `text` field specifically
        if (postExists) console.log("Selected post already posted. Trying another...");
    }

    // Post to BlueSky
    await agent.post({
        text: newPost,
        createdAt: new Date().toISOString()
    });

    // Log post success
    console.log(`Just posted: ${newPost}`);
}

// FUNCTION: Follow @ohsyrus followers
async function followOhsyrusFollowers(actor) {
    const allFollowers = [];
    let cursor = null;

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

// FUNCTION: Like 5 searched posts
async function likeSearchedPosts() {
    let cursor = null; // Initialize cursor for the first query

    do {
        try {
            const response = await agent.app.bsky.feed.searchPosts({
                q: "motivation",
                limit: 5, // Adjust limit as needed
            });

            const { posts: posts, cursor: nextCursor } = response.data;
            // console.log(response.data.posts);

            for (const post of response.data.posts) {
                let preview = post.record.text;
                preview = preview.length > 20 ? preview.substring(0, 20) + "..." : preview;
                try {
                    if (!post.viewer?.like) {
                        await agent.like(
                            post.uri,
                            post.cid,
                        );
                        console.log(`Liked post: ${preview}`);
                    }
                } catch (error) {
                    console.error(`Error liking post: ${post.uri}`, error);
                }
            }
        } catch (error) {
            console.error("Error during search for 'I need motivation':", error);
            break; // Exit loop on error
        }
    } while (cursor);

    cursor = null; // Reset cursor for the second query

    do {
        try {
            const response = await agent.app.bsky.feed.searchPosts({
                q: "discipline",
                limit: 5, // Adjust limit as needed
            });

            const { posts: posts, cursor: nextCursor } = response.data;

            for (const post of response.data.posts) {
                let preview2 = post.record.text;
                preview2 = preview2.length > 20 ? preview2.substring(0, 20) + "..." : preview2;
                try {
                    if (!post.viewer?.like) {
                        await agent.like(
                            post.uri,
                            post.cid,
                        );
                        console.log(`Liked post: ${preview2}`);
                    }
                } catch (error) {
                    console.error(`Error liking post: ${post.uri}`, error);
                }
            }

            cursor = nextCursor; // Update cursor for pagination
        } catch (error) {
            console.error("Error during search for 'I need discipline':", error);
            break; // Exit loop on error
        }
    } while (cursor);
}

// change to scheduleExpressionMinute for testing
const scheduleExpressionMinute = '* * * * *'; // Run once every minute for testing
const postScheduleExpression = '0 */3 */30 * *'; // Run once every three hours in prod
const followScheduleExpression = '0 * */45 * *'; // Run once every 45 minutes
const searchLikeScheduleExpression = '0 * */30 * *'; // run once every 30 minutes

// Configure postToBlueSky to run on a 3 hour cron job
const postJob = new CronJob(
    postScheduleExpression, 
    postToBlueSky(posts)
);

// Configure followOhsyrusFollowers to run every 45 minutes
const followJob = new CronJob(
    followScheduleExpression, 
    followOhsyrusFollowers('ohsyrus.bsky.social')
); 

// Configure likeSearchPosts to run every 30 minutes
const searchLikeJob = new CronJob(
    searchLikeScheduleExpression,
    likeSearchedPosts()
);

// START POST CRON JOB! (8 posts/day)[Every 3h]
postJob.start();

// START @OHSYRUS FOLLOW CRON JOB! (36 follows of @ohsyrus followers/day)[Every 45m]
followJob.start();

// SEARCH LIKER CRON JOB (240 likes/day)[Every 30m]
searchLikeJob.start();

// TIMELINE LIKER CRON JOB (2 LIKES/DAY)[Every 12h]

// FOLLOW BACK CRON JOB

// QUOTE POST REPOST CRON JOB