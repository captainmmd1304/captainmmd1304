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

async function generate() {
    const { temp, condition } = await getWeather();

    const svg = `
<svg width="950" height="620" viewBox="0 0 950 620" xmlns="http://www.w3.org/2000/svg">
  <style>
    .bubble { fill: #3f3f46; }
    .text { fill: #f5f5f5; font-family: Arial, Helvetica, sans-serif; font-size: 20px; }
    .link { fill: #3b82f6; text-decoration: underline; }
  </style>

  <rect x="20" y="20" rx="22" ry="22" width="280" height="60" class="bubble"/>
  <text x="40" y="58" class="text">Hi, I'm Malhar</text>

  <rect x="20" y="100" rx="22" ry="22" width="650" height="90" class="bubble"/>
  <text x="40" y="140" class="text">${greeting}!</text>
  <text x="40" y="170" class="text">I am from Pune, India where it is supposed to be  ${temp}°C today.</text>

  <rect x="20" y="210" rx="22" ry="22" width="820" height="90" class="bubble"/>
  <text x="40" y="250" class="text">I'm a Computer Science student interested in</text>
  <text x="40" y="280" class="text">LLMs, open source, machine learning, and web development.</text>

  <rect x="20" y="320" rx="22" ry="22" width="760" height="90" class="bubble"/>
  <text x="40" y="360" class="text">Exploring AI, software engineering, and product building</text>
  <text x="40" y="390" class="text">one project at a time.</text>

  <rect x="20" y="430" rx="22" ry="22" width="520" height="60" class="bubble"/>
  <text x="40" y="468" class="text">Have a great ${today} :)</text>

  <rect x="20" y="510" rx="22" ry="22" width="460" height="60" class="bubble"/>
  <text x="40" y="548" class="text">Connect with me on <a href="https://www.linkedin.com/in/malhardegaonkar/"><tspan class="link">LinkedIn</tspan></a></text>
</svg>
`;

    fs.writeFileSync("assets/about-me.svg", svg.trim());
}

generate().catch(err => {
    console.error(err.message);
    process.exit(1);
});