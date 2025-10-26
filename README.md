# Villa Upsell Admin Dashboard

A modern React-based admin dashboard for managing villa upsell services. Built with TypeScript, Tailwind CSS, and React Query.

## Features

- **Authentication**: Secure login and registration system
- **Property Management**: Create, edit, and manage villa properties
- **Vendor Management**: Manage service providers and partners
- **Upsell Management**: Create and organize upsell services
- **Order Tracking**: Monitor guest orders and payments
- **Analytics Dashboard**: View performance metrics and insights
- **Mobile-First Design**: Responsive design optimized for mobile devices

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **State Management**: React Query for server state
- **Routing**: React Router v6
- **Forms**: React Hook Form
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Build Tool**: Vite

## Getting Started

### Prerequisites

- Node.js 18+ (recommended: Node.js 20+)
- npm or yarn
- Villa Upsell Backend API running on `http://localhost:8000`

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env
   ```

4. Update `.env` with your configuration:
   ```
   VITE_API_URL=http://localhost:8000/api
   VITE_GUEST_APP_URL=http://localhost:4000
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout.tsx      # Main layout with sidebar
│   └── ProtectedRoute.tsx
├── contexts/           # React contexts
│   └── AuthContext.tsx # Authentication context
├── lib/               # Utility libraries
│   ├── api.ts         # API client configuration
│   └── utils.ts       # Helper functions
├── pages/             # Page components
│   ├── Dashboard.tsx  # Main dashboard
│   ├── Properties.tsx # Property management
│   ├── Vendors.tsx    # Vendor management
│   ├── Upsells.tsx    # Upsell management
│   ├── Orders.tsx     # Order tracking
│   ├── Analytics.tsx   # Analytics dashboard
│   └── Settings.tsx   # Settings page
├── types/             # TypeScript type definitions
│   └── index.ts
├── App.tsx            # Main app component
└── main.tsx           # App entry point
```

## API Integration

The admin dashboard integrates with the Villa Upsell Backend API. Make sure the backend is running and accessible at the configured API URL.

### Authentication

The app uses token-based authentication with Laravel Sanctum. Users can register for new accounts or log in with existing credentials to access the dashboard.

**Registration Features:**
- Account type selection (Villa Owner or Administrator)
- Strong password requirements
- Email validation
- Terms and conditions agreement
- Real-time form validation

**Login Features:**
- Secure token-based authentication
- Remember me functionality
- Password visibility toggle
- Error handling and user feedback

### Key API Endpoints

- `POST /register` - Register new user account
- `POST /login` - User authentication
- `POST /logout` - User logout
- `GET /me` - Get current user info
- `GET /properties` - List user properties
- `POST /properties` - Create new property
- `PUT /properties/{id}` - Update property
- `DELETE /properties/{id}` - Delete property

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Style

- Use TypeScript for type safety
- Follow React best practices
- Use Tailwind CSS for styling
- Implement responsive design
- Use React Query for data fetching

## Deployment

1. Build the project:
   ```bash
   npm run build
   ```

2. Deploy the `dist` folder to your hosting provider

3. Configure environment variables for production

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is part of the Villa Upsell system. All rights reserved.