export interface FirstStepsSection {
  heading: string;
  paragraphs: string[];
  tryIt?: string;
}

export interface FirstStepsLesson {
  slug: string;
  order: number;
  title: string;
  tagline: string;
  emoji: string;
  /** island / theme color in the 3D world */
  color: string;
  minutes: number;
  sections: FirstStepsSection[];
  grownUps: string;
}

export const firstStepsLessons: FirstStepsLesson[] = [
  {
    slug: "what-is-a-computer",
    order: 1,
    title: "What is a computer, really?",
    tagline: "Every computer plays the same game: In, Think, Out.",
    emoji: "🖥️",
    color: "#4ade80",
    minutes: 5,
    sections: [
      {
        heading: "The In-Think-Out game",
        paragraphs: [
          "A computer is a machine that plays one game all day long: something goes IN, the computer THINKS, and something comes OUT.",
          "When you press a key (IN), the computer thinks super fast, and a letter shows up on the screen (OUT). When you tap a video (IN), it thinks, and the video plays (OUT). Phones, tablets, game consoles, even smart TVs — they're all computers playing In-Think-Out.",
        ],
        tryIt:
          "Find three computers in your home that don't look like computers. Hint: does your microwave have buttons and a screen?",
      },
      {
        heading: "Computers follow recipes",
        paragraphs: [
          "How does a computer know what to think? People write it recipes — step-by-step instructions. A recipe for a computer is called a PROGRAM.",
          "A program for making toast might say: 1. Take bread. 2. Heat it. 3. Pop it up when it's brown. A program for a game says things like: 1. When the player presses jump, move the character up. 2. If the character touches a star, add a point.",
          "The special part? Computers follow their recipes EXACTLY. They never get bored, and they never skip a step. But they also can't guess what you meant — if the recipe is wrong, the computer does the wrong thing perfectly.",
        ],
        tryIt:
          "Be a robot! Ask someone to give you exact steps for making a sandwich, and follow them EXACTLY — even the silly mistakes. Did they forget to say 'open the bag'?",
      },
      {
        heading: "Why this matters for AI",
        paragraphs: [
          "For a long time, people had to write every single step for computers. That's called programming, and it can take years to learn.",
          "But something new happened: we built programs that can LEARN instead of just following steps. That's AI — and it's what the next lesson is about.",
        ],
      },
    ],
    grownUps:
      "This lesson introduces the input-process-output model and the idea of programs as exact instructions. The sandwich exercise is a classic 'exact instructions challenge' — letting the silly failures happen is the whole point, because it teaches why computers need precise instructions.",
  },
  {
    slug: "meet-ai",
    order: 2,
    title: "Meet AI: the computer that learned",
    tagline: "AI didn't memorize answers. It practiced — a LOT.",
    emoji: "🤖",
    color: "#818cf8",
    minutes: 6,
    sections: [
      {
        heading: "Learning from a million examples",
        paragraphs: [
          "How did you learn what a dog looks like? Nobody gave you a rule list like 'four legs, fur, tail.' You just saw lots of dogs, and your brain figured it out.",
          "AI learns the same way. Instead of a person writing every rule, we show the computer millions and millions of examples — pictures, stories, conversations — and it slowly gets good at spotting patterns, the way you got good at spotting dogs.",
        ],
      },
      {
        heading: "What AI is great at (and terrible at)",
        paragraphs: [
          "Because AI learned from examples, it's amazing at things with lots of examples: answering questions, writing stories, making pictures, helping with homework ideas, even writing computer recipes (programs!).",
          "But here's the twist: AI doesn't KNOW things the way you do. It's making its best guess based on patterns. Usually the guess is great. Sometimes it's confidently, hilariously wrong — like a friend who answers every question instantly, even when they should say 'I'm not sure.'",
        ],
        tryIt:
          "With a grown-up, ask an AI something you already know a lot about — your favorite animal or game. Did it get everything right? Anything wrong?",
      },
      {
        heading: "AI is a tool, and you're the boss",
        paragraphs: [
          "A calculator is fast at math, but it doesn't decide WHAT to calculate — you do. AI is the same. It can write, draw, and answer super fast, but it doesn't decide what's worth making, or check whether the answer is true, or know what YOU wanted.",
          "That's your job. The people who are best with AI aren't the ones who let it do everything — they're the ones who give it good directions and double-check its work. That's exactly what you'll practice next.",
        ],
      },
    ],
    grownUps:
      "This frames machine learning as pattern-learning from examples, and plants the two ideas kids most need: AI outputs are guesses that can be wrong, and the human is the director and fact-checker. The 'ask about something you know' exercise builds healthy skepticism faster than any lecture.",
  },
  {
    slug: "talking-to-ai",
    order: 3,
    title: "How to talk to an AI",
    tagline: "Good directions in, good stuff out.",
    emoji: "💬",
    color: "#fbbf24",
    minutes: 7,
    sections: [
      {
        heading: "Be specific, like ordering ice cream",
        paragraphs: [
          "If you say 'I want ice cream,' you might get any flavor. If you say 'I want two scoops of chocolate in a cone with sprinkles,' you get exactly what you dreamed of.",
          "AI works the same way. 'Tell me a story' gets you a random story. 'Tell me a funny story about a dragon who is scared of birthday candles, and make it three paragraphs' gets you something awesome. The details you give are called a PROMPT — and writing good prompts is a real skill.",
        ],
        tryIt:
          "With a grown-up, ask an AI for a story twice: once with a boring prompt ('tell me a story') and once with a super-specific one. Compare! Which one is better?",
      },
      {
        heading: "Keep going — you can ask again",
        paragraphs: [
          "Here's a secret most people don't know: you don't have to accept the first answer. You can say 'make it funnier,' 'make it shorter,' 'add a talking cat,' or 'that's not right, try again.'",
          "Talking to AI is a conversation, not a vending machine. The best results almost always come from going back and forth a few times.",
        ],
      },
      {
        heading: "The safety rules",
        paragraphs: [
          "AI chats feel friendly, but remember: it's a computer program, not a person who knows you. So follow these rules every time:",
          "Rule 1: Never tell an AI your full name, address, school, phone number, or passwords.",
          "Rule 2: If an AI says something weird, mean, or confusing, stop and show a grown-up.",
          "Rule 3: Don't believe everything an AI says — check important things with a person or a book.",
          "Rule 4: AI is for helping you think, not thinking instead of you. Your homework should still have YOUR ideas in it.",
        ],
        tryIt:
          "Make a 'safety poster' with the four rules — draw it, or ask the AI to help you make it catchy. Hang it near the computer.",
      },
    ],
    grownUps:
      "This lesson teaches prompting (specificity and iteration) alongside four non-negotiable safety rules: no personal information, escalate weird content to an adult, verify claims, and AI as a thinking aid rather than a replacement. Doing the exercises together is the best way to model all four.",
  },
  {
    slug: "ai-makes-mistakes",
    order: 4,
    title: "Be the boss: AI makes mistakes",
    tagline: "Your superpower is checking the robot's work.",
    emoji: "🧐",
    color: "#f87171",
    minutes: 6,
    sections: [
      {
        heading: "The confident goof-up",
        paragraphs: [
          "Ask an AI how many R's are in 'strawberry' and it might cheerfully say two. (Count them — it's three!) AI mistakes are sneaky because the AI never sounds unsure. It says wrong things in the same confident voice as right things.",
          "These goof-ups even have a funny name: HALLUCINATIONS — when an AI makes something up that sounds real but isn't. It might invent a book that doesn't exist or a fact that's just wrong.",
        ],
        tryIt:
          "Play 'Catch the Robot'! With a grown-up, ask an AI five questions about things you know really well. Score a point for every mistake you catch. Can you catch one?",
      },
      {
        heading: "How detectives check answers",
        paragraphs: [
          "When something matters — homework facts, health stuff, news — good AI users act like detectives. They ask: Does this match what I already know? Can I find it in a book or a trusted website? Does a grown-up agree?",
          "For fun stuff like stories and jokes, you don't need to check much. The more important the answer is, the more checking it deserves. That's a rule even professional programmers use.",
        ],
      },
      {
        heading: "Mistakes are why humans matter",
        paragraphs: [
          "Here's the happy twist: AI making mistakes is exactly why YOU are so important. A computer that's fast but sometimes wrong needs a human who is careful and curious.",
          "Fast robot + careful human = an amazing team. Neither one is as good alone. Remember that — it's the whole secret of building things with AI, and it's what the next lesson is about.",
        ],
      },
    ],
    grownUps:
      "This lesson normalizes AI fallibility (including the term 'hallucination') and builds a verification habit scaled to stakes. The 'Catch the Robot' game flips the power dynamic: instead of treating the AI as an oracle, kids learn to audit it — the single most protective digital-literacy habit they can carry into adulthood.",
  },
  {
    slug: "build-a-story",
    order: 5,
    title: "Build a story with AI",
    tagline: "You're the director. The AI is your helper.",
    emoji: "✨",
    color: "#f472b6",
    minutes: 8,
    sections: [
      {
        heading: "Directors don't type — they decide",
        paragraphs: [
          "Today you're making something real: a whole illustrated story, with you as the DIRECTOR and the AI as your helper.",
          "A movie director doesn't hold the camera or sew the costumes. They decide what the movie should be, then check every scene: 'perfect,' or 'again, but better.' That's your job now.",
        ],
      },
      {
        heading: "Step by step: your story",
        paragraphs: [
          "1. DECIDE: Pick a hero, a place, and a problem. (A penguin, on a pirate ship, who lost the treasure map.) Write it down — that's your plan!",
          "2. ASK: Tell the AI your plan and ask for a short story — 'four paragraphs, funny, with a surprise ending.'",
          "3. CHECK: Read it like a director. Is the ending really a surprise? Is the funny part actually funny?",
          "4. IMPROVE: Tell the AI exactly what to fix. 'Make the ending happier.' 'Give the penguin a catchphrase.' Do this two or three times — real directors always do more than one take.",
          "5. FINISH: When you love it, give the story a title. You can even ask the AI to describe a cover picture!",
        ],
        tryIt:
          "Do all five steps with a grown-up. When you're done, read your story out loud to someone. You made that!",
      },
      {
        heading: "What you just learned (it's secretly huge)",
        paragraphs: [
          "Plan, ask, check, improve, finish. That little loop you just did? It's EXACTLY how grown-up builders make apps, games, and websites with AI. Same loop, bigger projects.",
          "You didn't just make a story today. You learned the real workflow that professional AI builders use every day. The last lesson makes the jump.",
        ],
      },
    ],
    grownUps:
      "The story project runs the full creative-direction loop — specify, generate, evaluate, iterate, ship — which is genuinely the same loop used in professional AI-assisted software development. Naming the loop at the end helps kids transfer the skill beyond storytelling.",
  },
  {
    slug: "make-your-first-app",
    order: 6,
    title: "Make your first tiny app",
    tagline: "Describe it. Watch it appear. Play it.",
    emoji: "🚀",
    color: "#22d3ee",
    minutes: 10,
    sections: [
      {
        heading: "Apps are In-Think-Out too",
        paragraphs: [
          "Remember lesson one? In, Think, Out. An app is just that game with buttons: you press something (IN), the app thinks, and something happens on screen (OUT).",
          "And here's the amazing news: today, AI can write the app's recipe FOR you. You describe the app in normal words, and the AI writes the computer instructions. People call this VIBE CODING — you bring the idea and the directions, the AI does the typing.",
        ],
      },
      {
        heading: "Your first build",
        paragraphs: [
          "With a grown-up, open an AI tool that can make small apps or web pages (many AI chat tools can make simple ones right in the chat). Then use your director skills:",
          "1. DECIDE: Pick something tiny and fun. A button that tells a random joke. A spinner that picks what game to play. A birthday card that explodes with confetti when you click it.",
          "2. ASK: Describe it exactly: 'Make a web page with a big red button. When I click it, show a random silly joke. Make the background space-themed.'",
          "3. TRY IT: Click everything! Does it work? Is it fun?",
          "4. IMPROVE: 'Make the button bigger.' 'Add more jokes.' 'Play a sound when I click.' Two or three rounds, just like the story.",
        ],
        tryIt:
          "Build the joke button (or your own idea). Then show your app to your family — you are officially someone who MAKES apps, not just uses them.",
      },
      {
        heading: "Where you go from here",
        paragraphs: [
          "You now know what a computer is, what AI is, how to talk to it, how to catch its mistakes, and how to direct it to build real things. That's the whole foundation — seriously.",
          "Keep making tiny things. Every silly joke button teaches you something. And when you're ready for bigger builds — real websites, real games, real tools — the Builders section of this site will be waiting for you. Welcome to the club. 🎉",
        ],
      },
    ],
    grownUps:
      "The capstone connects everything to a first real build. Any AI chat tool that renders small web apps works; keep the project under 15 minutes and let the child dictate every instruction — the goal is agency ('I make apps'), not the app itself. From here, the site's Builders track covers real tooling whenever they're ready.",
  },
];

export function getFirstStepsLesson(slug: string): FirstStepsLesson | undefined {
  return firstStepsLessons.find((l) => l.slug === slug);
}
