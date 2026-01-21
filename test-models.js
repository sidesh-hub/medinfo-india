
import { readFileSync, existsSync } from 'fs';

// Load .env manually
let GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY && existsSync('.env')) {
    try {
        const envConfig = readFileSync('.env', 'utf8');
        const match = envConfig.match(/GEMINI_API_KEY=(.*)/);
        if (match) {
            GEMINI_API_KEY = match[1].trim();
        }
    } catch (e) {
        console.error("Error reading .env", e);
    }
}

if (!GEMINI_API_KEY) {
    console.error("No API KEY found in .env");
    process.exit(1);
}

const URL = `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`;

console.log(`Testing API Key: ${GEMINI_API_KEY.substring(0, 10)}...`);
console.log(`Connecting to: https://generativelanguage.googleapis.com/v1beta/models`);

fetch(URL)
    .then(res => {
        console.log(`Status: ${res.status}`);
        if (!res.ok) {
            return res.text().then(text => {
                throw new Error(`Error ${res.status}: ${text}`);
            });
        }
        return res.json();
    })
    .then(data => {
        console.log("Available Models:");
        if (data.models) {
            data.models.forEach(m => console.log(`- ${m.name}`));
        } else {
            console.log("No models returned", data);
        }
    })
    .catch(err => {
        console.error("FAILED:", err.message);
    });
