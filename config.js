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
