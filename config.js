const dotenv = require('dotenv');
dotenv.config();
module.exports = {
  token: process.env.TOKEN,
  youtubeAPI: process.env.YOUTUBE_API,
  mongoUri: process.env.MONGO_URI,
  translationEndpoint: process.env.TRANSLATION_ENDPOINT,
  translationSubscriptionKey: process.env.TRANSLATION_SUBSCRIPTION_KEY,
  openWeatherMapKey: process.env.OPEN_WEATHER_API_KEY,
  timeZone: "EST",
  bitlyApiKey: process.env.BITLY_KEY,
  topggApiKey: process.env.TOP_GG_API_KEY,
  cleverBotApiKey: process.env.CLEVER_BOT_API_KEY,
  languages: {
    "🇺🇸": {
      "language": "English",
      "abbreviation": "en"
    },
    "🇪🇸": {
      "language": "Spanish",
      "abbreviation": "es"
    },
    "🇧🇷": {
      "language": "Portuguese",
      "abbreviation": "pt"
    },
    "🇮🇹": {
      "language": "Italian",
      "abbreviation": "it"
    }
  }
}
