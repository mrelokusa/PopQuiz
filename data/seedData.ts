import { Quiz } from '../types';

export const SEED_DATA: Partial<Quiz>[] = [
  {
    title: "Which 'The Office' Character Matches Your Energy?",
    description: "Are you the World's Best Boss or just here for pretzel day? Find out now.",
    author: "DunderMifflinAdmin",
    outcomes: [
       { id: 'o1', title: 'Michael Scott', description: 'Chaotic, needy, but ultimately full of love. You want people to be afraid of how much they love you.', image: '👔', colorClass: 'bg-neo-blue' },
       { id: 'o2', title: 'Dwight Schrute', description: 'Intense, loyal, and prepared for the apocalypse. You are the Assistant (to the) Regional Manager.', image: '👓', colorClass: 'bg-neo-lemon' },
       { id: 'o3', title: 'Kelly Kapoor', description: 'You have a lot of questions. Number one: how dare you?', image: '💅', colorClass: 'bg-neo-coral' },
       { id: 'o4', title: 'Stanley Hudson', description: 'You are done. You have been done since 9am. Did I stutter?', image: '🥨', colorClass: 'bg-neo-mint' }
    ],
    questions: [
        {
            id: 'q1', text: "It's 5:00 PM on Friday. What are you doing?", answers: [
                { id: 'a1', text: "Inviting everyone to my condo for a party!", outcomeId: 'o1' },
                { id: 'a2', text: "Checking the perimeter security one last time.", outcomeId: 'o2' },
                { id: 'a3', text: "Gossiping in the annex.", outcomeId: 'o3' },
                { id: 'a4', text: "I left at 4:58 PM.", outcomeId: 'o4' }
            ]
        },
        {
            id: 'q2', text: "What is your management style?", answers: [
                { id: 'a1', text: "Somehow I Manage.", outcomeId: 'o1' },
                { id: 'a2', text: "Dictatorship.", outcomeId: 'o2' },
                { id: 'a3', text: "Branding and personal image.", outcomeId: 'o3' },
                { id: 'a4', text: "Do not speak to me.", outcomeId: 'o4' }
            ]
        },
        {
            id: 'q3', text: "Pick a survival item.", answers: [
                { id: 'a1', text: "A magic set.", outcomeId: 'o1' },
                { id: 'a2', text: "Nun-chucks.", outcomeId: 'o2' },
                { id: 'a3', text: "My phone.", outcomeId: 'o3' },
                { id: 'a4', text: "Crossword puzzles.", outcomeId: 'o4' }
            ]
        }
    ]
  },
  {
    title: "What is Your Actual Gen Z Aesthetic?",
    description: "Forget your zodiac sign. Are you Cottagecore, Dark Academia, or Y2K Chaos?",
    author: "VibeChecker",
    outcomes: [
       { id: 'o1', title: 'Dark Academia', description: 'Tweed blazers, rainy days, and secret societies. You romanticize studying.', image: '🕯️', colorClass: 'bg-neo-black text-white' },
       { id: 'o2', title: 'Cottagecore', description: 'Baking bread, frolicking in meadows, and rejecting modernity.', image: '🍄', colorClass: 'bg-neo-mint' },
       { id: 'o3', title: 'Y2K Cyber', description: 'Chrome, neon, fast internet, and faster sunglasses. You are living in 2003.', image: '💿', colorClass: 'bg-neo-periwinkle' },
       { id: 'o4', title: 'Goblin Mode', description: 'Comfort over everything. Snacks in bed. Feral energy.', image: '👹', colorClass: 'bg-neo-coral' }
    ],
    questions: [
        {
            id: 'q1', text: "Pick a weekend activity.", answers: [
                { id: 'a1', text: "Reading poetry in a cemetery.", outcomeId: 'o1' },
                { id: 'a2', text: "Gardening and jam making.", outcomeId: 'o2' },
                { id: 'a3', text: "Editing TikToks.", outcomeId: 'o3' },
                { id: 'a4', text: "Rotting in bed.", outcomeId: 'o4' }
            ]
        },
        {
            id: 'q2', text: "Choose a beverage.", answers: [
                { id: 'a1', text: "Black coffee.", outcomeId: 'o1' },
                { id: 'a2', text: "Herbal tea with honey.", outcomeId: 'o2' },
                { id: 'a3', text: "Energy drink.", outcomeId: 'o3' },
                { id: 'a4', text: "Whatever is in the fridge.", outcomeId: 'o4' }
            ]
        },
        {
            id: 'q3', text: "Pick a shoe.", answers: [
                { id: 'a1', text: "Loafers.", outcomeId: 'o1' },
                { id: 'a2', text: "Bare feet.", outcomeId: 'o2' },
                { id: 'a3', text: "Platform boots.", outcomeId: 'o3' },
                { id: 'a4', text: "Crocs.", outcomeId: 'o4' }
            ]
        }
    ]
  },
  {
    title: "Which Bread Are You?",
    description: "The most important scientific question of our time.",
    author: "CarbLoader",
    outcomes: [
       { id: 'o1', title: 'Sourdough', description: 'High maintenance, tangy, and universally loved. You have a lot of culture.', image: '🍞', colorClass: 'bg-neo-lemon' },
       { id: 'o2', title: 'Bagel', description: 'Thick, tough exterior, soft interior. You are versatile but dense.', image: '🥯', colorClass: 'bg-neo-blue' },
       { id: 'o3', title: 'Croissant', description: 'Flaky, messy, and expensive. You fall apart easily but look good doing it.', image: '🥐', colorClass: 'bg-neo-coral' },
       { id: 'o4', title: 'White Bread', description: 'Classic, reliable, maybe a bit boring. You get the job done.', image: '🥪', colorClass: 'bg-neo-paper' }
    ],
    questions: [
        {
            id: 'q1', text: "How do you handle stress?", answers: [
                { id: 'a1', text: "I ferment in my feelings.", outcomeId: 'o1' },
                { id: 'a2', text: "I get tough.", outcomeId: 'o2' },
                { id: 'a3', text: "I crumble immediately.", outcomeId: 'o3' },
                { id: 'a4', text: "I stay soft.", outcomeId: 'o4' }
            ]
        },
        {
            id: 'q2', text: "Pick a best friend.", answers: [
                { id: 'a1', text: "Avocado.", outcomeId: 'o1' },
                { id: 'a2', text: "Cream Cheese.", outcomeId: 'o2' },
                { id: 'a3', text: "Chocolate.", outcomeId: 'o3' },
                { id: 'a4', text: "Peanut Butter.", outcomeId: 'o4' }
            ]
        },
        {
            id: 'q3', text: "What's your vibe?", answers: [
                { id: 'a1', text: "Hipster.", outcomeId: 'o1' },
                { id: 'a2', text: "New Yorker.", outcomeId: 'o2' },
                { id: 'a3', text: "Parisian.", outcomeId: 'o3' },
                { id: 'a4', text: "Suburban.", outcomeId: 'o4' }
            ]
        }
    ]
  },
  {
    title: "The Red Flag Detector",
    description: "We all have one. Let's find out what makes you un-dateable.",
    author: "DatingPolice",
    outcomes: [
       { id: 'o1', title: 'The Ghost', description: 'You avoid conflict by simply vanishing from existence. Spooky.', image: '👻', colorClass: 'bg-neo-black text-white' },
       { id: 'o2', title: 'The Clinger', description: 'You have sent 45 texts in the last hour. Put the phone down.', image: '🧲', colorClass: 'bg-neo-coral' },
       { id: 'o3', title: 'The Project Manager', description: 'You treat relationships like a job. Where is the spreadsheet?', image: '📋', colorClass: 'bg-neo-blue' },
       { id: 'o4', title: 'The Main Character', description: 'It is your world, we are just NPCs living in it.', image: '🎬', colorClass: 'bg-neo-lemon' }
    ],
    questions: [
        {
            id: 'q1', text: "They haven't texted back in 3 hours. You:", answers: [
                { id: 'a1', text: "Forget they exist.", outcomeId: 'o1' },
                { id: 'a2', text: "Call the police.", outcomeId: 'o2' },
                { id: 'a3', text: "Analyze the timestamp data.", outcomeId: 'o3' },
                { id: 'a4', text: "Post a thirst trap.", outcomeId: 'o4' }
            ]
        },
        {
            id: 'q2', text: "First date idea?", answers: [
                { id: 'a1', text: "Something vague I can bail on.", outcomeId: 'o1' },
                { id: 'a2', text: "Meeting my parents.", outcomeId: 'o2' },
                { id: 'a3', text: "Escape room to test their IQ.", outcomeId: 'o3' },
                { id: 'a4', text: "Watching me perform karaoke.", outcomeId: 'o4' }
            ]
        },
        {
            id: 'q3', text: "Why did your last relationship end?", answers: [
                { id: 'a1', text: "I stopped replying.", outcomeId: 'o1' },
                { id: 'a2', text: "I loved too hard.", outcomeId: 'o2' },
                { id: 'a3', text: "Scheduling conflicts.", outcomeId: 'o3' },
                { id: 'a4', text: "They didn't appreciate my genius.", outcomeId: 'o4' }
            ]
        }
    ]
  },
  {
    title: "Which Cursed Object Are You?",
    description: "Forget spirit animals. We're doing haunted items.",
    author: "OccultWeekly",
    outcomes: [
       { id: 'o1', title: 'Annabelle Doll', description: 'You look innocent but you thrive on chaos. Do not open the glass case.', image: '🎀', colorClass: 'bg-neo-coral' },
       { id: 'o2', title: 'Haunted Mirror', description: 'You reflect people\'s insecurities back at them. Brutally honest.', image: '🪞', colorClass: 'bg-neo-periwinkle' },
       { id: 'o3', title: 'Monkey\'s Paw', description: 'You give people what they want, but in the worst way possible.', image: '🐒', colorClass: 'bg-neo-mint' },
       { id: 'o4', title: 'Video Tape from The Ring', description: 'You are viral, toxic, and people only have 7 days to deal with you.', image: '📼', colorClass: 'bg-neo-black text-white' }
    ],
    questions: [
        {
            id: 'q1', text: "What is your best quality?", answers: [
                { id: 'a1', text: "My smile.", outcomeId: 'o1' },
                { id: 'a2', text: "My honesty.", outcomeId: 'o2' },
                { id: 'a3', text: "I'm helpful.", outcomeId: 'o3' },
                { id: 'a4', text: "I'm memorable.", outcomeId: 'o4' }
            ]
        },
        {
            id: 'q2', text: "How do you get revenge?", answers: [
                { id: 'a1', text: "Psychological warfare.", outcomeId: 'o1' },
                { id: 'a2', text: "Showing them the truth.", outcomeId: 'o2' },
                { id: 'a3', text: "Irony.", outcomeId: 'o3' },
                { id: 'a4', text: "A phone call.", outcomeId: 'o4' }
            ]
        },
        {
            id: 'q3', text: "Where do you live?", answers: [
                { id: 'a1', text: "A nursery.", outcomeId: 'o1' },
                { id: 'a2', text: "An antique shop.", outcomeId: 'o2' },
                { id: 'a3', text: "A dusty box.", outcomeId: 'o3' },
                { id: 'a4', text: "A well.", outcomeId: 'o4' }
            ]
        }
    ]
  },
    {
    title: "What is Your Corporate Personality?",
    description: "Are you a circle-back or a deep-dive?",
    author: "LinkedInInfluencer",
    outcomes: [
       { id: 'o1', title: 'The Sycophant', description: 'You agree with everything. "Great point!" is your catchphrase.', image: '🤝', colorClass: 'bg-neo-blue' },
       { id: 'o2', title: 'The Ghost Employee', description: 'You are on payroll but nobody knows what you actually do.', image: '🌫️', colorClass: 'bg-neo-paper' },
       { id: 'o3', title: 'The Buzzword King', description: 'We need to leverage our synergy to drill down on the low hanging fruit.', image: '🚀', colorClass: 'bg-neo-lemon' },
       { id: 'o4', title: 'The Burnout', description: 'You are hanging on by a thread and a dry shampoo.', image: '🔥', colorClass: 'bg-neo-coral' }
    ],
    questions: [
        {
            id: 'q1', text: "The meeting could have been an email. You:", answers: [
                { id: 'a1', text: "Nod enthusiastically.", outcomeId: 'o1' },
                { id: 'a2', text: "Turn off camera and mute.", outcomeId: 'o2' },
                { id: 'a3', text: "Circle back to the action items.", outcomeId: 'o3' },
                { id: 'a4', text: "Cry silently.", outcomeId: 'o4' }
            ]
        },
        {
            id: 'q2', text: "Your inbox is:", answers: [
                { id: 'a1', text: "Inbox Zero.", outcomeId: 'o1' },
                { id: 'a2', text: "Unread (4,502).", outcomeId: 'o2' },
                { id: 'a3', text: "Color coded labels.", outcomeId: 'o3' },
                { id: 'a4', text: "A source of trauma.", outcomeId: 'o4' }
            ]
        },
        {
            id: 'q3', text: "Favorite office snack?", answers: [
                { id: 'a1', text: "Whatever the boss likes.", outcomeId: 'o1' },
                { id: 'a2', text: "I eat lunch in my car.", outcomeId: 'o2' },
                { id: 'a3', text: "Protein bar for optimization.", outcomeId: 'o3' },
                { id: 'a4', text: "Stale donuts.", outcomeId: 'o4' }
            ]
        }
    ]
  }
];
