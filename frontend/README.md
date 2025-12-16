# Anti-Scam Frontend

This directory contains the frontend web application. The actual Next.js application files are located in the project root for compatibility with Next.js configuration requirements.

## Structure

The frontend is a Next.js 16 application with the following structure:

```
/ (project root)
├── app/                    # Next.js app directory (pages & API routes)
├── components/             # React components
├── lib/                    # Utility libraries
├── hooks/                  # React hooks
├── public/                 # Static assets
├── styles/                 # Global styles
├── next.config.mjs         # Next.js configuration
├── package.json            # Frontend dependencies
└── tsconfig.json           # TypeScript configuration
```

## Running the Frontend

```bash
# Install dependencies (from project root)
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Frontend Features

- 🔐 User authentication (login/register)
- 📞 Call monitoring dashboard
- 🤖 AI scam detection UI
- 📱 Responsive design
- 🎨 Modern UI with shadcn/ui components

## API Integration

The frontend currently uses Next.js API routes located in `app/api/`. For mobile app integration, use the backend API service located in `/backend`.

## Notes

- The frontend and backend can run independently
- Frontend API routes (`app/api/*`) are for web UI only
- Mobile app should use the backend API (`/backend/src/routes/*`)

