require("dotenv").config();
const fs = require("fs");
const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));

const API_KEY = process.env.WEATHER_API_KEY;
const CITY = "Pune";

// Get day
const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const today = days[new Date().getDay()];

// Greeting
const hour = new Date().getHours();
const greeting =
    hour < 12 ? "Good morning" :
        hour < 18 ? "Good afternoon" :
            "Good evening";

async function getWeather() {
    if (!API_KEY) {
        throw new Error("Missing WEATHER_API_KEY in environment variables.");
    }

    const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${CITY}&units=metric&appid=${API_KEY}`
    );

    const data = await res.json();

    if (!data.main || !data.weather) {
        console.error("Weather API response:", data);
        throw new Error("Weather API failed. Check your API key, city name, or API activation.");
    }

    const temp = Math.round(data.main.temp);
    const condition = data.weather[0].main;

    return { temp, condition };
}

// Estimate width for SVG text clipping
function estimateTextWidth(text, fontSize = 20) {
    return Math.max(40, text.length * (fontSize * 0.58));
}

function createTypingDots(id, x, y, start, duration = 1.2) {
    const hideAt = start + duration;

    return `
    <g opacity="0">
      <animate attributeName="opacity" values="0;1;1;0"
        keyTimes="0;0.05;0.95;1"
        dur="${duration}s"
        begin="${start}s"
        fill="freeze"/>

      <g transform="translate(${x}, ${y})">
        <rect x="0" y="0" rx="22" ry="22" width="90" height="50" class="typing-bubble"/>

        <circle cx="25" cy="25" r="5" class="typing-dot">
          <animate attributeName="opacity" values="0.25;1;0.25"
            dur="0.9s" begin="${start}s" repeatCount="indefinite"/>
        </circle>

        <circle cx="45" cy="25" r="5" class="typing-dot">
          <animate attributeName="opacity" values="0.25;1;0.25"
            dur="0.9s" begin="${start + 0.15}s" repeatCount="indefinite"/>
        </circle>

        <circle cx="65" cy="25" r="5" class="typing-dot">
          <animate attributeName="opacity" values="0.25;1;0.25"
            dur="0.9s" begin="${start + 0.3}s" repeatCount="indefinite"/>
        </circle>
      </g>
    </g>
  `;
}

function createMessageBubble({ id, x, y, width, height, lines, start }) {
    const bubbleDuration = 0.35;
    let defs = "";
    let texts = "";

    lines.forEach((line, i) => {
        const lineY = 38 + i * 30;
        const revealStart = start + 0.35 + i * 0.8;
        const revealDur = 0.9;
        const clipWidth = Math.min(width - 40, estimateTextWidth(line));

        defs += `
      <clipPath id="clip-${id}-${i}">
        <rect x="20" y="${lineY - 18}" width="0" height="26">
          <animate attributeName="width"
            from="0"
            to="${clipWidth}"
            dur="${revealDur}s"
            begin="${revealStart}s"
            fill="freeze"/>
        </rect>
      </clipPath>
    `;

        texts += `
      <text x="20" y="${lineY}" class="text" clip-path="url(#clip-${id}-${i})">${line}</text>
    `;
    });

    const bubble = `
    <g opacity="0" transform="translate(${x}, ${y}) scale(0.85)">
      <animate attributeName="opacity"
        from="0" to="1"
        dur="${bubbleDuration}s"
        begin="${start}s"
        fill="freeze"/>

      <animateTransform
        attributeName="transform"
        type="scale"
        values="0.85;1.06;1"
        keyTimes="0;0.6;1"
        dur="${bubbleDuration}s"
        begin="${start}s"
        additive="sum"
        fill="freeze"/>

      <animateTransform
        attributeName="transform"
        type="translate"
        values="${x} ${y}; ${x} ${y}"
        dur="${bubbleDuration}s"
        begin="${start}s"
        additive="replace"
        fill="freeze"/>

      <rect x="0" y="0" rx="22" ry="22" width="${width}" height="${height}" class="bubble"/>
      ${texts}
    </g>
  `;

    return { defs, bubble };
}

async function generate() {
    const { temp, condition } = await getWeather();

    const messages = [
        {
            id: "m1",
            x: 20,
            y: 20,
            width: 280,
            height: 60,
            lines: ["Hi, I'm Malhar"]
        },
        {
            id: "m2",
            x: 20,
            y: 100,
            width: 760,
            height: 90,
            lines: [
                `${greeting}!`,
                `I am from Pune, India where it is ${temp}°C and ${condition.toLowerCase()} today.`
            ]
        },
        {
            id: "m3",
            x: 20,
            y: 210,
            width: 830,
            height: 90,
            lines: [
                "I'm a Computer Science student interested in",
                "LLMs, open source, machine learning, and web development."
            ]
        },
        {
            id: "m4",
            x: 20,
            y: 320,
            width: 770,
            height: 90,
            lines: [
                "Exploring AI, software engineering, and product building",
                "one project at a time."
            ]
        },
        {
            id: "m5",
            x: 20,
            y: 430,
            width: 530,
            height: 60,
            lines: [`Have a great ${today} :)`]
        }
    ];

    let defs = "";
    let content = "";
    let currentTime = 0;

    for (const msg of messages) {
        const typingStart = currentTime;
        const messageStart = typingStart + 1.2;

        content += createTypingDots(msg.id, msg.x, msg.y + 5, typingStart, 1.2);

        const { defs: bubbleDefs, bubble } = createMessageBubble({
            ...msg,
            start: messageStart
        });

        defs += bubbleDefs;
        content += bubble;

        currentTime += msg.lines.length === 1 ? 2.8 : 3.8;
    }

    const totalDuration = currentTime + 2;

    const svg = `
<svg width="950" height="620" viewBox="0 0 950 620" xmlns="http://www.w3.org/2000/svg">
  <defs>
    ${defs}
  </defs>

  <style>
    .bg {
      fill: transparent;
    }

    .bubble {
      fill: #3f3f46;
      filter: drop-shadow(0px 6px 18px rgba(0,0,0,0.28));
    }

    .typing-bubble {
      fill: #52525b;
      filter: drop-shadow(0px 4px 10px rgba(0,0,0,0.22));
    }

    .text {
      fill: #f5f5f5;
      font-family: Arial, Helvetica, sans-serif;
      font-size: 20px;
      letter-spacing: 0.2px;
    }

    .typing-dot {
      fill: #e4e4e7;
    }
  </style>

  <rect width="100%" height="100%" class="bg"/>
  ${content}

  <!-- loop reset -->
  <animate attributeName="opacity"
           values="1;1"
           dur="${totalDuration}s"
           repeatCount="indefinite"/>
</svg>
`;

    fs.writeFileSync("assets/about-me.svg", svg.trim());
}

generate().catch(err => {
    console.error(err.message);
    process.exit(1);
});