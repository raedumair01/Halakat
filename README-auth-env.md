Environment setup for Halakat:

1. Create a `.env` file in the project root.
2. Copy the values from `.env.example`.
3. Leave `EXPO_PUBLIC_API_URL` as `http://localhost:4000` for normal local development unless you want to target a different backend.

Recommended local `.env`:

EXPO_PUBLIC_API_URL=http://localhost:4000
EXPO_PUBLIC_GROQ_CHAT_API_KEY=your-chat-groq-api-key
EXPO_PUBLIC_GROQ_VOICE_API_KEY=your-voice-groq-api-key
EXPO_PUBLIC_GROQ_MODEL=llama-3.3-70b-versatile
PORT=4000
MONGODB_URI=mongodb://localhost:27017/Halakat
JWT_SECRET=change-this-in-production

Notes:
- In Expo development, the app will automatically swap `localhost` to your current Expo host IP on a physical device.
- Android emulator still falls back to `http://10.0.2.2:4000` when no Expo host IP is available.
- If you want to point the app at a remote/shared backend, set `EXPO_PUBLIC_API_URL` to that full URL explicitly.
- The server reads `.env` through `dotenv`.
- Expo exposes only variables prefixed with `EXPO_PUBLIC_` to the app.
- The Ask tab requires `EXPO_PUBLIC_GROQ_CHAT_API_KEY`.
- The Recite screen requires `EXPO_PUBLIC_GROQ_VOICE_API_KEY`.
- Expo should be restarted after editing `.env`.
