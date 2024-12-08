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

// Posts
const posts = [
    "A man can accept failure but he must never accept defeat.",
    "Them niggas never been chased before. \n\n Cant fight off the back foot. Easy money.",
    "There is no healing. There is only letting go.",
    "Your breakthrough is on the other side of your consistency.",
    "Everyone must choose one of two pains: the pain of discipline or the pain of regret.",
    "Keeping yourself busy to avoid the pain is great. But it’ll still be there waiting on you when you slow down.", 
    "To have ultimate victory, you must be ruthless.\n\n- Napoleon Bonaparte",
    "Never underestimate your own intelligence and never overestimate the intelligence of others.",
    "Fortune favors the bold",
    "imagine the come up story",
    "The two most common themes used for selling shit? Fear and sex.",
    "You gotta be okay with being bad at something before you’re great at it.\n\n Do it anyway.",
    "Us Black Men from the hood have to be the ones to take care of the Black boys from the hood & properly uplift them. Nobody else will.",
    "Stay patient and committed to the process.",
    "If you want to quickly show your value in a company, create documentation outlining process and procedures. Companies love it.",
    "don't argue with people you don't respect",
    "Information is your cheat code \n\nWhy panic when you have access to information daily on how to do anything \n\nThis is your time, if you view it that way",
    "Quantum physics says that things can be in multiple states until observed - superposition - hence, if you’re governed by the same laws of physics then everything that happens can be perceived multiple ways and it’s up to you to choose which way you view it",
    "Believe nun of what u hear and half of what u see",
    "Stop being a coward.",
    "The process of following your Life’s Task all the way to mastery can essentially begin at any point in life. The hidden force within you is always there and ready to be engaged, but only if you can silence the noise from others.",
    "One does not discover new lands without consenting to lose sight of the shore.\n\n — André Gide",
    "People do not decide their futures, they decide their habits and their habits decide their futures.",
    "The world belongs to those who ruthlessly do, not those who consistently talk, plan or dream. \n\nIn a world full of thinkers, planners, and talkers - be a doer.",
    "You either consuming or producing",
    "Tribes were easily taken over because they lacked the ability to organize",
    'Proper Preparation Prevents Poor Performance',
    "Worrying means you suffer twice.",
    "Unplanned action beats every unactioned plan.",
    "I remember I heard a person say major in profit minor in passion at college",
    "Goals are for people who care about winning once. Systems are for people who care about winning repeatedly.",
    "Work smarter",
    "There’s an obstacle in the way, be prepared.",
    "Do not waste time on things you cannot change or influence. Just keep moving.",
    "Nothing bad can really happen, that everything that happens to us in life can become fuel for us to move forward.",
    "It is unrealistc to expect people to see you as you see yourself.",
    "Learn to stand firm in what you believe.",
    "Be careful about your thoughts, don’t give your attention to everything.",
    "Put your ego aside, take ownership, and keep moving.",
    "Accept the present and mold the future.",
    "Beware the barrenness of a busy life. Seek depth and meaning.",
    "after you get ya work done shit feel so good",
    "Stop being who they want you to be and start being who you are.",
    "People don't even realize how easy it is to outwork everybody out here.",
    "…want something? Get it done. No excuses.",
    "I always ask myself how would a person praying for my life would play the current hand I have",
    "Do good because it matters,\n\nNot because it gets noticed.",
    "Your biggest enemy is your uncontrolled mind.",
    "Never settle for a woman who doesn’t respect you.",
    "Everybody ain’t motivated a lot people be hating.",
    "Failure is necessary.\n\nNot an option.\n\nYou understand?",
    "Stop wasting your time,\n\nJust start you’ll figure it out",
    "You pay for comfort with your potential.",
    "Always assume incompetence before looking for conspiracy.",
    "Gamify your life.\n\nLevel up.\n\nWin.",
    `'Im a failure.'\n\nNo.\n\nYou haven't failed enough`,
    "Stop faking action.\n\nStart taking action.",
    "Blaming others does absolutely nothing for your life and puts you in a position with zero power to change your situation.",
    "Winners will always find a way to win.",
    "You don't need to memorize complex stuff.\n\nYou need to understand the basics deeply.",
    "You don't need the perfect plan.\n\nYou need the courage to start.",
    "You know exactly what needs to be done. \n\nYou know somewhat how to do it. \n\nSo.\n\nJust do it.",
    "You want more results?\n\nTake more action.",
    "You’re not crazy for dreaming big.\n\nYou’re just surrounded by the wrong people.",
    "actions instead of words >>",
    "Whatever you do, don’t ever lose that ambition",
    "Most successful people I've met aren't that smart.\n\nThey just move fast, take risks, work hard.",
    "Work hard in silence.\n\nLet success do the talking.",
    "Stop talking so much",
    "Hold onto dear life, and never give up.",
    "You must be prepared to discipline yourself to put in this hard work.",
    "The only real prison is fear, and the only real freedom is freedom from fear.",
    "You're just one day away from a great workout, healthy eating, and proper sleep.\n\nThen tell me you don't feel good.",
    "There’s always room for improvement",
    "If a “meaningless” job enables you to accomplish some other goal that’s meaningful to you, it becomes a meaningful job",
    "Let your character be your loudest statement.",
    "Biggest problem with capitalism is we confuse monetary success with intelligence and give reverence",
    "intelligent enemies are better than stupid friends",
    "THE BEST PART ABOUT GETTIN BACK ON YA FEET IS KNOWING WHO NOT TO WALK WITH AGAIN.",
    "You become the standards you accept.",
    "Accept rejection gracefully.",
    "To achieve greatly, you must become a different person.",
    "Remember the goal",
    "first they call u crazy, then ask how u did it 😮‍💨",
    "lead with respect unless given a reason not to",
    "We all started with 0 clients, 0 sales, & 0 support.. just start!",
    "Get rid of the distractions and see how much progress you’ll make",
    "It's easier to find a client than to find an employer.",
    "YOUR WILL is the most ACCURATE way to predict THE FUTURE.",
    "If you don’t got as much resources as someone then you gotta outwork them",
    "Stay loyal to your creativity because it's a gift",
    "Having a highly educated circle will take you places you’d never imagine.",
    "You can literally come back from anything. It's all about your mindset.",
    "Move with purpose nigga",
    "Even the unlucky gets lucky every now and then.",
    "People don’t usually find fulfillment in pursuing money but they often find money pursuing fulfillment.",
    "Never buy into the scam that you need to mistreat people to get ahead in life. Complete nonsense.",
    "if you make enough money summer never has to end",
    "stop talking & create",
    "As long as you take yourself serious nothing in your way matters.",
    "Let go of the past",
    "The real you is whatever you do when nobody’s watching. If you’re honourable and dignified in private, you have nothing to hide, ever.",
    "I’m convinced that anyone can achieve their goals if they’re willing to look stupid.",
    "Get you a woman that knows how to do paperwork 🫡",
    "If you wait too long, the coffee gets cold, the door closes, you get old, the girls move on, & dreams fade. You must act w/ a sense of urgency today",
    "Best advice I've gotten in a while: Decide what kind of life you actually want. And then say no to everything that isn't that.",
    "Try the thing you don’t think you’re quite ready for.",
    "If you are worried about what others might think then you will never really create anything.",
    "Find a way.",
    "Take the long road.",
    "bottom feeder mentality don't take you to the top",
    "sometimes the shortcut isn't worth it",
    "Recreate yourself",
    "To be approved you must be similar.\n\nTo be irreplaceable you must be different.",
    "Being attacked is a sign that you are important enough to be a target.",
    "Don’t just read headlines and form an opinion, do a little research also",
    "You were born with high self-esteem.\n\nThe outside world tried to change that.",
    "Your lack of discipline is an insult to the people who believe in you.",
    "You gotta design your life the way you want it.",
    "Let yourself be inspired by greater people than you.",
    "You are in control of your life.",
    "It’s never been easier to start a business.\n\nIt’s also never been easier to do nothing.",
    "It doesn’t necessarily ever get easier. You just get better at managing what’s hard.",
    "Making friends helps you grow faster.",
    "People crave something real. Be that",
    "The hardest things in life are the most rewarding.",
    "A prototype is worth a thousand meetings.",
    "Discipline can fix 80% of your problems.",
    "Don’t resent the competition, up your game.",
    "You're not afraid of failing, you're afraid of being seen failing.",
    "Never spend too much time on things that don’t matter.",
    "A real hit record doesn’t have an expiration date",
    "every skill issue is temporary and can be solved with time and focus.",
    "struggle is the universe’s way of validating if your faith is genuine or not",
    "There are ppl that want exactly what you want, no lying or coercion needed.. find them and build with them",
    "Sometimes you just have to be quiet and start doing the things you said you would do.",
    "If you don’t work on yourself, you will die never knowing who you were meant to be",
    "You don’t need more luck.\n\nYou just need more focus.",
    "The future belongs to those brave enough to build it.",
    "Start seeing things in terms of cause and effect, rather than good and bad, and life will make more sense.",
    "You can overcome burnout by believing you’re just high off cortisol rn",
    "There is no shame in making an honest effort.",
    "You are always ONE decision away from a totally different life.",
    "what's wrong bro you've barely touched your hero's journey",
    "U gotta sit back & be bored when u tryna hit them goals",
    "The best victories are the ones they never see coming.",
    "Success is often a function of who is willing to suck at something the longest.",
    "do whatever it takes to win",
    "People respect consistency",
    

]

// Create new instance of Bluesky agent to handle communication w Bluesky service
const agent = new BskyAgent({
    service: 'https://bsky.social', // Specify the Bluesky service URL
});

// main function containing core logic for Bluesky posting
async function main() {

    // Log in to Bluesky w env variable credentials
    await agent.login({ 
        identifier: process.env.BLUESKY_USERNAME, // Bluesky username
        password: process.env.BLUESKY_PASSWORD // Bluesky password
    });

    const profileData  = await agent.getProfile({ actor: 'ourdearfriend.bsky.social' })
    // const { did, displayName, ... } = profileData
    console.log(profileData);

    // Make sure post doesn't already exist
    const { data } = await agent.getTimeline({

    });
    
    const { feed: postsArray, cursor: nextPage } = data;

    console.log(postsArray.length);
    console.log(nextPage);



    // Post to BlueSky
    await agent.post({
        text: "Alright, what do we have here",
        createdAt: new Date().toISOString()
    });

    // Log post success
    console.log("Just posted!");
}
main();

// Run this on a cron job
const scheduleExpressionMinute = '* * * * *'; // Run once every minute for testing
const scheduleExpression = '0 */3 * * *'; // Run once every three hours in prod
const job = new CronJob(scheduleExpression, main); // change to scheduleExpressionMinute for testing
job.start();
