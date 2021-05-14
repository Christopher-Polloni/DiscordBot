const dotenv = require('dotenv');
dotenv.config();
module.exports = {
  token: process.env.TOKEN,
  youtubeAPI: process.env.YOUTUBE_API,
  mongoUri: process.env.MONGO_URI,
  translationEndpoint: process.env.TRANSLATION_ENDPOINT,
  translationSubscriptionKey: process.env.TRANSLATION_SUBSCRIPTION_KEY,
  openWeatherMapKey: process.env.OPEN_WEATHER_API_KEY,
  timeZone: "EDT",
  bitlyApiKey: process.env.BITLY_KEY,
  topggApiKey: process.env.TOP_GG_API_KEY,
  cleverBotApiKey: process.env.CLEVER_BOT_API_KEY,
  clashOfClansApiKey: process.env.CLASH_OF_CLANS_API_KEY,
  languages: {
    "🇺🇸": { "language": "English", "abbreviation": "en" },
    "🇫🇷": { "language": "French",  "abbreviation": "fr" },
    "🇩🇪": { "language": "German",  "abbreviation": "de" },
    "🇬🇷": { "language": "Greek",   "abbreviation": "el" },
    "🇮🇹": { "language": "Italian", "abbreviation": "it" },
    "🇯🇵": { "language": "Japanese", "abbreviation": "ja" },
    "🇰🇷": { "language": "Korean", "abbreviation": "ko" },
    "🇵🇱": { "language": "Polish", "abbreviation": "pl" },
    "🇧🇷": { "language": "Portuguese", "abbreviation": "pt" },
    "🇷🇴": { "language": "Romanian", "abbreviation": "ro" },
    "🇷🇺": { "language": "Russian", "abbreviation": "ru" },
    "🇪🇸": { "language": "Spanish", "abbreviation": "es" }
  }
}
