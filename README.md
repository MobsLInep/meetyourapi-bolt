# Gemini Chat App

A modern chat application powered by Google Gemini AI with image support, built using Next.js 14, Clerk for authentication, MongoDB for data storage, and ImageKit for image handling.

## Features

- 🔐 Secure authentication with Clerk
- 🤖 AI-powered chat using Google Gemini
- 🖼️ Image upload and analysis support
- 💾 Chat history management with MongoDB
- 🎨 Modern and responsive UI
- 📱 Mobile-friendly design

## Prerequisites

- Node.js 18+ and npm
- MongoDB database
- Clerk account
- Google Gemini API key
- ImageKit account

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# MongoDB
MONGODB_URI=your_mongodb_uri

# Google Gemini
GOOGLE_GEMINI_API_KEY=your_gemini_api_key

# ImageKit
NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT=your_imagekit_url_endpoint
```

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd gemini-chat-app
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                 # Next.js app directory
│   ├── api/            # API routes
│   ├── dashboard/      # Dashboard pages
│   └── page.tsx        # Home page
├── components/         # React components
├── lib/               # Utility functions
├── models/            # MongoDB models
└── types/             # TypeScript types
```

## API Routes

- `GET /api/chats` - Get all chats for the current user
- `POST /api/chats` - Create a new chat
- `GET /api/chats/[chatId]` - Get a specific chat
- `PATCH /api/chats/[chatId]` - Update a chat
- `DELETE /api/chats/[chatId]` - Delete a chat

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 