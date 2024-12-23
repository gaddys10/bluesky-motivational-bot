import { RichText } from '@atproto/api';


// FUNCTION: Collect all posts
export async function fetchAllPosts(agent) {
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

// FUNCTION: Follow @ohsyrus.bsky.social followers
export async function followOhsyrusFollowers(agent) {
    const allFollowers = [];
    let cursor = null;

    // Fetch all followers using pagination
    do {
        const response = await agent.app.bsky.graph.getFollowers({
            actor: 'ohsyrus.bsky.social',
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
    // console.log(`${getFormattedDate()} - ${allFollowers.length} currently following @ohsyrus.bsky.social`)
    // For each follower starting from earlierst (to only run once)
    for (let i = allFollowers.length - 1; i >= 0; i--) {
        const follower = allFollowers[i];
        try {
            // Check if already following
            if (!follower.viewer?.following) {
                //Follow by DID if not following & exit loop
                console.log(`${getFormattedDate()} - Now following: ${follower.handle}`);
                await agent.follow(follower.did);
                await new Promise(resolve => setTimeout(resolve, 500));
                break;
            }
        } catch (error) {
            console.error(`${getFormattedDate()} - Error following @${follower.handle}:`, error);
        }
    }
}

export function getFormattedDate() {
    return new Date(Date.now()).toLocaleString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit', 
        hour12: true 
    });
}

export async function loginWithRateLimitHandling(agent) {
    try {
        const session = agent.session;
        if (!(session && session.handle)) {
            await agent.login({
                identifier: process.env.BLUESKY_USERNAME,
                password: process.env.BLUESKY_PASSWORD
            });
        }
    } catch (error) {
        if (error.message.includes("Rate Limit Exceeded")) {
            const resetTime = error.headers['ratelimit-reset']; // Time when limit resets (UTC timestamp)
            const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds (UTC)
            const waitTime = resetTime - currentTime + 5; // Wait for the reset time plus 5 seconds buffer
            console.log(`Rate limit exceeded. Waiting ${waitTime} seconds before retrying...`);
            await new Promise(resolve => setTimeout(resolve, waitTime * 1000)); // Wait for the reset time to pass
            return loginWithRateLimitHandling(agent); // Retry login after waiting
        }
        throw error; // Re-throw other errors
    }
}

// FUNCTION: Like posts on feed
export async function likeFeed(agent){
    try{
        const { data } = await agent.getTimeline({
            limit: 25,
        });

        const { feed: postsArray, cursor: nextPage } = data

        for(const post of postsArray){
            
            if(post.post?.record?.text && 
                (post.post.record.text.includes("motivation") || 
                (post.post.record.text.includes("motivated") || 
                post.post.record.text.includes("discipline") || 
                post.post.record.text.includes("congratulations!") ||
                post.post.record.text.includes("\"graduated with my degree\"") ||
                post.post.record.text.includes("hopeful") ||
                post.post.record.text.includes("champion") ||
                post.post.record.text.includes("inspiration") ||
                post.post.record.text.includes("happiness") ||
                post.post.record.text.includes("\"to the gym\"")))){
                    let preview = post.post.record.text;
                    preview = preview.length > 30 ? preview.substring(0, 30) + "..." : preview;
                    await agent.like(post.post.uri, post.post.cid);
                    console.log(`${getFormattedDate()} - Liked feed post: ${preview}`);
            }
        }
    } catch (error){
        console.error(`${getFormattedDate()} - Error during liking feed`, error.message, error.stack);
        if (error.code === 'UND_ERR_HEADERS_TIMEOUT') {
            console.log(`${getFormattedDate()} - Retrying likeFeed...`);
            setTimeout(() => likeFeed(agent), 5000); // Retry after 5 seconds
        }    
    }
}

// FUNCTION: Like 5 searched posts
export async function likeSearchedPosts(agent) {
    try {
        const response = await agent.app.bsky.feed.searchPosts({
            q: `\"I need motivation\" -#nsfw -#motivationalboobs -#gay -dick -pussy -sex -cock -horny -democrat -republican`,
            limit: 7, // Adjust limit as needed
        });

        for (const post of response.data.posts) {
            let preview = post.record.text;
            preview = preview.length > 30 ? preview.substring(0, 30) + "..." : preview;
            try {
                if (!post.viewer?.like) {
                    await agent.like(post.uri, post.cid);
                    console.log(`${getFormattedDate()} - Liked Search post: ${preview}`);
                }
            } catch (error) {
                console.error(`${getFormattedDate()} - Error liking post: ${post.uri}`, error);
            }
        }
    } catch (error) {
        console.error(`${getFormattedDate()} - Error during search for 'I need motivation':`, error);
    }

    try {
        const response = await agent.app.bsky.feed.searchPosts({
            q: `\"I need discipline\" -#nsfw -#motivationalboobs -dick -pussy -fuck -#gay -horny -cock -democrat -republican`,
            limit: 7, // Adjust limit as needed
        });

        for (const post of response.data.posts) {
            let preview2 = post.record.text;
            preview2 = preview2.length > 30 ? preview2.substring(0, 30) + "..." : preview2;
            try {
                if (!post.viewer?.like) {
                    await agent.like(
                        post.uri,
                        post.cid,
                    );
                    console.log(`${getFormattedDate()} - Liked post: ${preview2}`);
                }
            } catch (error) {
                console.error(`${getFormattedDate()} - Error liking post: ${post.uri}`, error);
            }
        }

        // cursor = nextCursor;
         // Update cursor for pagination
    } catch (error) {
        console.error(`${getFormattedDate()} - Error during search for 'I need discipline':`, error);
    }
}

// FUNCTION: Bluesky posting
export async function postToBlueSky(postArray, agent) {
    const allPosts = await fetchAllPosts(agent);
    let newPost;
    let postExists = true;

    while (postExists) {
        const randomIndex = Math.floor(Math.random() * postArray.length);
        newPost = postArray[randomIndex];
        const newPostRt = new RichText({ text: newPost });

        await newPostRt.detectFacets(agent);

        postExists = allPosts.some(post => post.text === newPostRt.text);

        if (postExists) {
            console.log(`${getFormattedDate()} - Selected post already posted. Trying another...`);
        }
    }

    const resultPost = new RichText({ text: newPost });
    await resultPost.detectFacets(agent);

    await agent.post({
        text: resultPost.text,
        facets: resultPost.facets,
        createdAt: new Date().toISOString()
    });

    console.log(`${getFormattedDate()} - Just posted: ${newPost}`);
}

