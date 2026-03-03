# Pettah Market - Virtual Marketplace

A modern web application that connects customers with shops and service providers in Pettah, Colombo, Sri Lanka.

## 🎯 Project Overview

Pettah Market is a virtual marketplace platform designed to make it easy for customers to discover and purchase products/services from local shops and businesses in Pettah. Shop owners can register, create product listings, and manage their business online.

## ✨ Features (MVP)

- User registration & authentication (customers & shop owners)
- Shop owner profiles with business details
- Product/service listings with images, descriptions, and pricing
- Advanced search and filtering by category, location, and name
- Shop details and contact information
- Rating and review system
- Responsive design for desktop and mobile

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js with TypeScript
- **Styling:** TailwindCSS
- **State Management:** React Context API / Zustand
- **HTTP Client:** Axios

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB
- **Authentication:** JWT
- **Validation:** Joi

### Deployment
- **Frontend:** Vercel / DigitalOcean
- **Backend:** DigitalOcean / AWS
- **Database:** MongoDB Atlas

## 📁 Project Structure

```
pettah-market/
├── frontend/          # Next.js web application
├── backend/           # Node.js/Express API
├── docs/              # Documentation
├── .gitignore
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Git
- MongoDB (local installation for development)

### Installation

1. Clone the repository
```bash
git clone https://github.com/Nafhanilvin/pettah-market.git
cd pettah-market
```

2. Setup Backend
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

The default backend `.env.example` is configured for a simple local MongoDB setup.
When the project is ready to scale, switch `MONGODB_URI` to a managed/cluster database URI.

3. Setup Frontend
```bash
cd ../frontend
npm install
cp .env.example .env.local
npm run dev
```

## 📚 Documentation

- [Architecture Design](./docs/ARCHITECTURE.md)
- [Database Schema](./docs/DATABASE.md)
- [API Documentation](./docs/API.md)
- [Frontend Guide](./docs/FRONTEND.md)

## 👨‍💻 Contributing

This is a personal project, but contributions and suggestions are welcome!

## 📝 License

MIT License - feel free to use this project for your own purposes.

## 📧 Contact

For questions or suggestions, feel free to reach out!

---

**Made with ❤️ by Nafhanilvin**
