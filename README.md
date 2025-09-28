# 🌾 Blue Harvest - Smart Irrigation Management System

![Blue Harvest Logo](./attached_assets/BlueHarvest%20Logo_1759023379104.png)

A comprehensive AI-powered irrigation management platform that helps farmers optimize water usage and ensures regulatory compliance for government oversight.

Live Demo: https://mlh-asu-emon8.replit.app/https://mlh-asu-emon8.replit.app/

Demo Video: https://www.youtube.com/watch?v=foIdEKN_QUA

<img width="1260" height="746" alt="image" src="https://github.com/user-attachments/assets/1a7ed062-8ffe-4b5d-8c76-1ae752572ada" />
<img width="409" height="563" alt="image" src="https://github.com/user-attachments/assets/924f1625-bd57-4713-b11b-f53b9a4e236a" />
<img width="801" height="668" alt="image" src="https://github.com/user-attachments/assets/6828fb35-d5c9-4abf-903e-23d83700aae0" />
<img width="877" height="256" alt="image" src="https://github.com/user-attachments/assets/ab67620d-7db3-4fdf-8684-fd33ddaefaf9" />
<img width="1258" height="675" alt="image" src="https://github.com/user-attachments/assets/9ba0577a-8dbf-4c23-9a23-c188c4f98709" />


## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Environment Variables](#environment-variables)
- [Contributing](#contributing)
- [License](#license)

## 🌟 Overview

Blue Harvest is an intelligent agricultural water management system that combines AI-driven irrigation recommendations, real-time weather monitoring, and government compliance tracking. The platform serves two primary user types:

- **🚜 Farmers**: Get intelligent irrigation guidance, water usage tracking, and crop management insights
- **🏛️ Government Officials**: Monitor regional water compliance, allocation tracking, and agricultural oversight

The system provides data-driven insights to optimize crop yield while conserving water resources and maintaining regulatory compliance.

## ✨ Features

### 🚜 Farmer Dashboard
- **Smart Irrigation Recommendations**: AI-powered suggestions based on weather, soil conditions, and crop requirements
- **Real-time Weather Integration**: Current conditions and 5-day forecasts from OpenWeatherMap
- **Water Usage Tracking**: Monitor daily/weekly water consumption and efficiency metrics
- **Crop Price Monitoring**: Live market prices and trend analysis
- **Alert System**: Automated notifications for irrigation, weather, and compliance issues
- **Soil Monitoring**: Track moisture levels, pH, and temperature across different fields
- **Yield Analytics**: Historical yield trends and performance insights

### 🏛️ Government Dashboard
- **Regional Water Oversight**: Monitor water usage across different regions and farms
- **Compliance Tracking**: Real-time compliance status and violation monitoring
- **Water Allocation Management**: Track and manage water allocations by region
- **Analytics & Reporting**: Comprehensive charts showing usage trends, efficiency comparisons, and seasonal demand
- **Farm Distribution Analysis**: Visualize farm sizes and distribution patterns
- **Regulatory Insights**: AI-powered summaries for policy decision-making

### 🤖 AI-Powered Features
- **Intelligent Recommendations**: Machine learning algorithms for optimal irrigation timing
- **Weather-based Adjustments**: Evapotranspiration calculations and weather pattern analysis
- **Crop-specific Optimization**: Tailored recommendations based on plant type and growth stage
- **Historical Pattern Analysis**: Learn from past irrigation events and outcomes

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **shadcn/ui** component library built on Radix UI
- **TanStack Query** for server state management
- **Wouter** for lightweight routing
- **Recharts** for data visualization

### Backend
- **Node.js** with Express.js
- **TypeScript** for type safety
- **Drizzle ORM** with PostgreSQL
- **Neon Database** for serverless PostgreSQL hosting

### External Services
- **OpenWeatherMap API** for weather data
- **SendGrid** for email notifications 
- **Google Gemini AI** for intelligent insights

### Development Tools
- **ESBuild** for production bundling
- **PostCSS** with Autoprefixer
- **tsx** for TypeScript execution

## 📁 Project Structure

```
blueharvest/
├── client/                    # React frontend application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   │   ├── ui/          # shadcn/ui components
│   │   │   └── ...          # Custom components
│   │   ├── pages/           # Route components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # Utility functions
│   │   └── types/           # TypeScript type definitions
│   └── index.html
├── server/                   # Express.js backend
│   ├── services/            # Business logic services
│   ├── routes.ts            # API route handlers
│   ├── storage.ts           # Database operations
│   └── index.ts             # Server entry point
├── shared/                   # Shared types and schemas
│   └── schema.ts            # Database schema definitions
├── attached_assets/          # Static assets
└── configuration files...
```

## 🚀 Installation

### Prerequisites
- Node.js 18+ 
- PostgreSQL database (or Neon account)
- OpenWeatherMap API key
- SendGrid API key (optional)

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/deetdoot/blueharvest.git
   cd blueharvest
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env
   # Database
   DATABASE_URL=your_postgresql_connection_string
   
   # Weather API
   OPENWEATHER_API_KEY=your_openweathermap_api_key
   
   # Email Service (optional)
   SENDGRID_API_KEY=your_sendgrid_api_key
   FROM_EMAIL=your_sender_email
   
   # AI Service
   GEMINI_API_KEY=your_google_gemini_api_key
   ```

4. **Database Setup**
   ```bash
   npm run db:push
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5000`

## 📖 Usage

### For Farmers
1. **Registration**: Register your farm with location, crop types, and field information
2. **Dashboard Access**: View your personalized dashboard with water usage metrics
3. **Irrigation Management**: Follow AI recommendations or manually schedule irrigation
4. **Monitor Alerts**: Stay informed about weather changes, water compliance, and system notifications
5. **Analytics**: Track your farm's efficiency, yield trends, and water usage patterns

### For Government Officials
1. **Regional Overview**: Access the government dashboard for regional water monitoring
2. **Compliance Monitoring**: Track farmer compliance with water allocation limits
3. **Analytics**: Review comprehensive charts showing regional usage patterns and trends
4. **Reporting**: Generate insights for policy decisions and resource allocation

### API Access
The system provides RESTful APIs for:
- Farmer management and registration
- Water usage tracking and irrigation logging
- Weather data integration
- Compliance monitoring and reporting
- AI-powered recommendations

## 📚 API Documentation

### Farmer Endpoints
```
GET    /api/farmers              # List all farmers
POST   /api/farmers              # Register new farmer
GET    /api/farmers/:id          # Get farmer details
PUT    /api/farmers/:id          # Update farmer information
```

### Water Management
```
GET    /api/farmers/:id/water-usage        # Get water usage data
POST   /api/farmers/:id/irrigation-logs    # Log irrigation events
GET    /api/farmers/:id/recommendations    # Get AI recommendations
```

### Government Oversight
```
GET    /api/government/regional-usage      # Regional water usage stats
GET    /api/government/compliance-stats    # Compliance statistics
GET    /api/government/compliance-records  # Detailed compliance records
```

### Weather & External Data
```
GET    /api/weather/current/:location      # Current weather data
GET    /api/weather/forecast/:location     # Weather forecast
GET    /api/crop-prices                    # Current crop market prices
```

## 🔧 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `OPENWEATHER_API_KEY` | OpenWeatherMap API key | Yes |
| `SENDGRID_API_KEY` | SendGrid email service key | No |
| `FROM_EMAIL` | Sender email address | No |
| `GEMINI_API_KEY` | Google Gemini AI API key | Yes |
| `NODE_ENV` | Environment (development/production) | No |

## 🏗️ Development

### Available Scripts
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run check` - TypeScript type checking
- `npm run db:push` - Push database schema changes

### Architecture Highlights
- **Type Safety**: Full TypeScript coverage across frontend and backend
- **Modern React**: Uses React 18 with hooks and modern patterns  
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Real-time Updates**: TanStack Query provides optimistic updates and caching
- **Error Handling**: Comprehensive error boundaries and user feedback
- **Accessibility**: Built on Radix UI primitives for accessibility compliance

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write meaningful commit messages
- Add tests for new features
- Ensure accessibility compliance
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🌱 About Blue Harvest

Blue Harvest represents the future of sustainable agriculture through intelligent water management. By combining cutting-edge AI technology with practical farming needs and regulatory requirements, we're helping build a more efficient and sustainable agricultural ecosystem.

**Built with ❤️ for farmers and agricultural sustainability**

Contributors:
Roy Margallo 
Bibhash Kar
Shuvashish Kar
Emtiaz Emon
