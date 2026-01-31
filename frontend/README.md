# Pettah Market - Frontend

Next.js frontend application for Pettah Market

## Setup

1. Install dependencies
```bash
npm install
```

2. Configure environment variables
```bash
cp .env.example .env.local
```

3. Run development server
```bash
npm run dev
```

App will run on `http://localhost:3000`

## Project Structure

```
frontend/
├── app/             # Next.js app directory
│   ├── layout.tsx
│   ├── page.tsx
│   ├── auth/        # Authentication pages
│   ├── shop/        # Shop pages
│   └── ...
├── components/      # Reusable components
├── lib/             # Utilities and helpers
│   ├── api.ts       # API client
│   └── stores/      # Zustand stores
├── styles/          # Global styles
├── public/          # Static assets
├── tailwind.config.js
└── next.config.js
```

## Key Technologies

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **TailwindCSS** - Styling
- **Zustand** - State management
- **Axios** - HTTP client
