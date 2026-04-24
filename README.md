# Halakat

Halakat is a Quran companion app built with Expo and React Native to support reading, memorization, recitation, and daily Islamic practice in one mobile experience.

## Features

- User onboarding and authentication
- Quran browsing by Surah and Para
- Surah and Para detail screens
- Memorization support flow
- Recitation practice with voice recording
- AI-assisted recitation support
- AI chat assistant
- Prayer times based on location
- Dua and adhkar sections
- Tips and reflections for consistency
- Editable user profile

## Tech Stack

- Expo
- React Native
- Expo Router
- TypeScript
- Express.js
- MongoDB
- AsyncStorage

## Project Structure

```bash
app/         # Expo Router screens
assets/      # Fonts and images
constants/   # App constants and fonts
providers/   # Context providers
services/    # API and service layer
server/      # Express backend
```

## Getting Started

### Install dependencies

```bash
npm install
```

### Start the backend

```bash
npm run server
```

### Start the Expo app

```bash
npm run dev
```

### Run on Android

```bash
npm run android
```

### Run on iOS

```bash
npm run ios
```

## Available Scripts

- `npm run dev` - Start Expo
- `npm run server` - Start backend server
- `npm run build:web` - Export web build
- `npm run lint` - Run linting
- `npm run typecheck` - Run TypeScript checks
- `npm run android` - Run Android app
- `npm run ios` - Run iOS app
- `npm run build:android` - Build Android release

## Notes

- Environment variables are required for local setup but are intentionally not listed here.
- Authentication and profile data are handled through the local backend.
- Some AI-powered features depend on private API configuration.

## Backend

The backend provides routes for signup, login, profile fetch, profile update, and health checks. It uses MongoDB for persistence and JWT for authentication.

## Deploy Backend To Vercel

The backend is set up for Vercel serverless deployment through [vercel.json](/d:/d%20drive%20data/react%20native/Halakat/Halakat/vercel.json:1) and [api/index.js](/d:/d%20drive%20data/react%20native/Halakat/Halakat/api/index.js:1).

Set these environment variables in Vercel before using the deployed API:

- `MONGODB_URI`
- `JWT_SECRET`

After deployment, update the Expo app environment so `EXPO_PUBLIC_API_URL` points to your Vercel backend URL.

## Future Improvements

- Memorization progress tracking
- Better recitation scoring
- Notifications and reminders
- Community circle features
- Production deployment support

## License

This project is for educational and personal development purposes.
