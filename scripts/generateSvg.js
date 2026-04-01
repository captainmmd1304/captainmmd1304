require("dotenv").config();
const fs = require("fs");

const API_KEY = process.env.WEATHER_API_KEY;
const CITY = "Pune";

// Get day
const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const today = days[new Date().getDay()];

// Greeting (morning/evening)
const hour = new Date().getHours();
const greeting =
    hour < 12 ? "morning ☀️" :
        hour < 18 ? "afternoon 🌤️" :
            "evening 🌙";

// Fetch weather
async function getWeather() {
    const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${CITY}&units=metric&appid=${API_KEY}`
    );
    const data = await res.json();

    const temp = Math.round(data.main.temp);
    const condition = data.weather[0].main;

    return { temp, condition };
}

async function generate() {
    const { temp, condition } = await getWeather();

    const svg = `
<svg width="950" height="520" xmlns="http://www.w3.org/2000/svg">
<style>
  .bubble { fill:#3f3f46; }
  .text { fill:#f5f5f5; font-family: Arial, Helvetica, sans-serif; font-size:20px; }
  .link { fill:#3b82f6; text-decoration: underline; }
</style>

<!-- Bubble 1 -->
<rect x="20" y="20" rx="22" width="280" height="60" class="bubble"/>
<text x="40" y="55" class="text">Hi, I'm Malhar 👋</text>

<!-- Bubble 2 -->
<rect x="20" y="100" rx="22" width="650" height="90" class="bubble"/>
<text x="40" y="140" class="text">Good ${greeting}!</text>
<text x="40" y="170" class="text">I am from Pune, India 🌍 where it's supposed to be ${temp}°C today.</text>

<!-- Bubble 3 -->
<rect x="20" y="210" rx="22" width="700" height="90" class="bubble"/>
<text x="40" y="250" class="text">I'm a computer science student interested in</text>
<text x="40" y="280" class="text"> LLMs, open source, machine learning and web development 🚀</text>

<!-- Bubble 4 -->
<rect x="20" y="320" rx="22" width="720" height="90" class="bubble"/>
<text x="40" y="360" class="text">Currently working on projects, improving my skills/text>
<text x="40" y="390" class="text">and learning by building cool things</text>

<!-- Bubble 5 -->
<rect x="20" y="430" rx="22" width="430" height="60" class="bubble"/>
<text x="40" y="465" class="text">Have a great ${today} 👋</text>

</svg>
`;

    fs.writeFileSync("assets/about-me.svg", svg);
}

generate();