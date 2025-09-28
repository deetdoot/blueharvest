# Blue Harvest - Smart Irrigation Management System

## Overview

Blue Harvest is a comprehensive smart irrigation management system designed to help farmers optimize water usage and ensure regulatory compliance. The platform combines AI-driven irrigation recommendations, real-time weather monitoring, and government oversight capabilities to create an efficient water management ecosystem.

The system serves two primary user types: farmers who need intelligent irrigation guidance and water usage tracking, and government officials who monitor regional compliance and water allocation. The application provides data-driven insights to optimize crop yield while conserving water resources and maintaining regulatory compliance.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client application is built using **React with TypeScript** and follows a component-based architecture. The UI framework leverages **shadcn/ui** components built on top of **Radix UI primitives** for accessibility and consistency. **Tailwind CSS** provides utility-first styling with a custom design system that includes agricultural-themed colors and typography.

The frontend uses **Wouter** for lightweight client-side routing, supporting separate dashboards for farmers and government users. **TanStack Query** handles all server state management, providing caching, background updates, and optimistic updates for a responsive user experience.

### Backend Architecture
The server follows a **RESTful API design** built with **Express.js** and TypeScript. The architecture separates concerns into distinct layers:

- **Route handlers** manage HTTP requests and responses
- **Service layer** contains business logic for weather data, irrigation calculations, and email notifications
- **Storage layer** abstracts database operations using a repository pattern
- **Database layer** uses **Drizzle ORM** with PostgreSQL for type-safe database interactions

The backend implements **session-based middleware** for request logging and error handling, providing detailed API monitoring capabilities.

### Data Architecture
The system uses **PostgreSQL** as the primary database with **Drizzle ORM** providing type-safe schema definitions and migrations. The database schema includes:

- **Farmers and Crops** - Core agricultural entities with detailed farm characteristics
- **Irrigation Logs** - Historical tracking of water usage and irrigation events
- **Weather Data** - Cached weather information for offline capabilities
- **Water Allocations and Compliance** - Regulatory tracking and government oversight
- **AI Recommendations** - Intelligent irrigation suggestions based on multiple factors

### External Service Integrations
The application integrates with several external services:

- **OpenWeatherMap API** - Real-time weather data and forecasting with fallback to mock data for development
- **SendGrid Email Service** - Automated notifications for irrigation alerts and compliance updates
- **Neon Database** - Serverless PostgreSQL hosting for scalable data storage

### AI and Intelligence Features
The irrigation service implements intelligent recommendation algorithms that consider:

- **Crop-specific water requirements** based on plant type and growth stage
- **Weather-based adjustments** using evapotranspiration calculations
- **Soil characteristics** and irrigation method efficiency
- **Historical usage patterns** and seasonal optimization

### Authentication and Security
The system currently uses a demo-based approach with placeholder farmer identification. The architecture supports future implementation of proper authentication through the established session management patterns and secure database access controls.

### Development and Deployment
The project uses **Vite** for fast development builds and hot module replacement. **ESBuild** handles production bundling for optimal performance. The configuration supports both development and production environments with appropriate optimizations for each.

## External Dependencies

### Core Framework Dependencies
- **React 18** - Frontend framework with TypeScript support
- **Express.js** - Backend web framework
- **Vite** - Build tool and development server
- **TypeScript** - Type safety across the entire stack

### Database and ORM
- **PostgreSQL** - Primary database (via Neon serverless)
- **Drizzle ORM** - Type-safe database toolkit
- **@neondatabase/serverless** - Serverless PostgreSQL client

### UI and Styling
- **shadcn/ui** - Component library built on Radix UI
- **Radix UI** - Accessible component primitives
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Icon system

### State Management and Data Fetching
- **TanStack Query** - Server state management
- **React Hook Form** - Form handling with validation

### External APIs
- **OpenWeatherMap** - Weather data and forecasting
- **SendGrid** - Email notifications and alerts

### Development Tools
- **tsx** - TypeScript execution for development
- **ESBuild** - Fast JavaScript bundler
- **PostCSS** - CSS processing with Autoprefixer

### Replit-Specific Integrations
- **@replit/vite-plugin-runtime-error-modal** - Development error handling
- **@replit/vite-plugin-cartographer** - Development tooling
- **@replit/vite-plugin-dev-banner** - Development environment indicators