# JUNLINK - Point of Sale System

A modern, feature-rich Point of Sale (POS) system built with Next.js, designed for retail businesses to manage sales, inventory, customers, and financial operations in a unified platform.

## 📋 Overview

JUNLINK is a comprehensive POS solution that combines sales terminal functionality with robust business management tools. The system provides real-time transaction processing, inventory tracking, customer relationship management, and detailed financial reporting - all within an intuitive, responsive interface.

The application is built with a focus on performance, user experience, and scalability, leveraging modern web technologies to deliver a seamless experience across different devices and screen sizes.

## ✨ Key Features

### 🛒 Sales Terminal
- **Real-time Transaction Processing**: Fast, efficient checkout experience with live cart updates
- **Customer Integration**: Quick customer search and association with transactions
- **Receipt Generation**: Automatic receipt generation with transaction details
- **Barcode/SKU Support**: Quick item lookup and addition to cart
- **Multiple Payment Methods**: Support for various payment types
- **Keyboard Shortcuts**: Streamlined workflow with keyboard shortcuts for common actions

### 📊 Dashboard & Analytics
- **Real-time KPI Monitoring**: Track cash on hand, daily gross, monthly revenue, and expenses
- **Financial Reports**: Comprehensive financial reporting with date range filtering
- **Interactive Calendar**: Custom date range selection for financial analysis
- **Inventory Summary**: Quick overview of stock levels and alerts
- **Visual Data**: Charts and graphs powered by Recharts for data visualization

### 📦 Inventory Management
- **Item Registration**: Create and manage product catalog with categories
- **Stock Management**: Track stock levels, add/remove inventory, and manage quantities
- **Stock Monitoring**: Real-time visibility of available stock, low-stock alerts, and most-stocked items
- **Category Management**: Organize products with hierarchical categories
- **Bulk Operations**: Support for CSV import and bulk updates

### 👥 Customer Management
- **Customer Database**: Comprehensive customer information storage
- **AI-Powered Registration**: Document scanning with Gemini AI for automated form filling
- **Manual Registration**: Traditional form-based customer data entry
- **Customer Search**: Quick customer lookup during transactions
- **Transaction History**: View customer purchase history and patterns

### 💰 Expenses & Cash Flow
- **Expense Tracking**: Record and categorize business expenses
- **Cash Flow Monitoring**: Track money in and out with visual reports
- **Expense Breakdown**: Analyze expenses by category and time period
- **Cashout Management**: Record cash withdrawals and transfers
- **Classification System**: Organize expenses with custom classifications

### 📈 Transaction Management
- **Transaction History**: Complete log of all sales transactions
- **Payment History**: Detailed payment transaction records
- **Advanced Filtering**: Filter transactions by date, amount, status, and more
- **Export Capabilities**: Export transaction data for external analysis
- **Real-time Updates**: Live transaction data with auto-refresh

### ⚙️ Settings & Administration
- **User Management**: Staff accounts and permission controls
- **Store Configuration**: Multi-store support with individual settings
- **Subscription Management**: Integrated subscription and payment handling
- **Backdating Permissions**: Control staff access to historical transaction modifications
- **Maintenance Mode**: Built-in maintenance guard for system updates

### 🤖 AI Integration
- **Document Processing**: Gemini AI integration for extracting customer information from documents
- **Image Compression**: Automatic image optimization for uploads
- **Smart Form Filling**: AI-assisted data entry for faster customer registration

## 🛠️ Technology Stack

### Core Framework & Runtime
- **[Next.js 16.0.7](https://nextjs.org/)** - React framework with App Router
- **[React 19.2.1](https://react.dev/)** - UI library
- **[TypeScript 5](https://www.typescriptlang.org/)** - Type-safe development

### Database & Backend
- **[Supabase](https://supabase.com/)** - PostgreSQL database with real-time capabilities
  - `@supabase/supabase-js` - JavaScript client library
  - `@supabase/ssr` - Server-side rendering support

### State Management & Data Fetching
- **[Zustand 5.0.9](https://zustand-demo.pmnd.rs/)** - Lightweight state management
- **[SWR 2.3.8](https://swr.vercel.app/)** - Data fetching and caching
- **[React Hook Form 7.66.0](https://react-hook-form.com/)** - Form state management
- **[@hookform/resolvers 5.2.2](https://github.com/react-hook-form/resolvers)** - Form validation resolvers

### UI Components & Styling
- **[Tailwind CSS 4](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Lucide React 0.548.0](https://lucide.dev/)** - Icon library
- **[React Data Grid 7.0.0-beta.58](https://adazzle.github.io/react-data-grid/)** - High-performance data grid

### Data Visualization
- **[Recharts 3.5.0](https://recharts.org/)** - Charting library for React
- **[@tanstack/react-table 8.21.3](https://tanstack.com/table)** - Headless table library

### Validation & Schema
- **[Zod 4.1.12](https://zod.dev/)** - TypeScript-first schema validation
- **[Yup 1.7.1](https://github.com/jquense/yup)** - Schema validation library

### AI & Machine Learning
- **[@google/generative-ai 0.24.1](https://ai.google.dev/)** - Google Gemini AI integration
- **[OpenAI 6.16.0](https://openai.com/)** - OpenAI API client

### Utilities & Tools
- **[Day.js 1.11.19](https://day.js.org/)** - Date manipulation library
- **[Axios 1.13.2](https://axios-http.com/)** - HTTP client
- **[PapaParse 5.5.3](https://www.papaparse.com/)** - CSV parsing library
- **[browser-image-compression 2.0.2](https://github.com/Donaldcwl/browser-image-compression)** - Client-side image compression

### Drag & Drop
- **[@dnd-kit/core 6.3.1](https://dndkit.com/)** - Drag and drop toolkit
- **[@dnd-kit/sortable 10.0.0](https://docs.dndkit.com/presets/sortable)** - Sortable preset
- **[@dnd-kit/modifiers 9.0.0](https://docs.dndkit.com/api-documentation/modifiers)** - DnD modifiers
- **[@dnd-kit/utilities 3.2.2](https://docs.dndkit.com/api-documentation/utilities)** - DnD utilities

### Performance & Monitoring
- **[web-vitals 3.5.0](https://github.com/GoogleChrome/web-vitals)** - Performance metrics

### Development Tools
- **[ESLint 9](https://eslint.org/)** - Code linting
- **[cross-env 7.0.3](https://github.com/kentcdodds/cross-env)** - Cross-platform environment variables

## 🗄️ Database

**PostgreSQL** (via Supabase)
- Real-time subscriptions and updates
- Row-level security (RLS) policies
- Database migrations managed through Supabase CLI
- Server-side functions and triggers
- Vector database capabilities (if AI features are expanded)

## 🚀 Getting Started

### Prerequisites
- Node.js 20.x or higher
- npm, yarn, pnpm, or bun package manager
- Supabase account and project

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd pos-next
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory with the following variables:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run analyze` - Analyze bundle size

## 📁 Project Structure

```
pos-next/
├── app/                      # Next.js app directory (routes & pages)
│   ├── actions/             # Server actions
│   ├── api/                 # API routes
│   ├── components/          # Shared page components
│   ├── customers/           # Customer management module
│   ├── dashboard/           # Dashboard & analytics
│   ├── expenses/            # Expense tracking
│   ├── inventory/           # Inventory management
│   ├── settings/            # Application settings
│   ├── transactions/        # Transaction history
│   └── hooks/               # Shared hooks
├── components/              # Reusable UI components
│   ├── navigation/          # Navigation components
│   ├── reusables/           # Generic reusable components
│   ├── sales-terminnal/     # POS terminal components
│   ├── sign-in/             # Authentication components
│   └── window-layouts/      # Layout components
├── lib/                     # Shared libraries
├── store/                   # Zustand stores
├── utils/                   # Utility functions
│   └── supabase/            # Supabase client utilities
├── supabase/                # Supabase configuration & migrations
└── public/                  # Static assets
```

## 🔐 Authentication

The application uses Supabase Authentication with:
- Email/password authentication
- JWT-based session management
- Server-side auth with `@supabase/ssr`
- Protected routes via middleware
- Row-level security (RLS) policies

## 🎨 Design System

The application uses a custom design system built with Tailwind CSS:
- Dark theme optimized for extended use
- Consistent color palette and typography
- Responsive layouts for mobile and desktop
- Accessible components following WCAG guidelines
- Custom animations and transitions

## 📝 License

This project is private and proprietary.

## 🤝 Contributing

This is a private project. For authorized contributors, please follow the standard Git workflow:
1. Create a feature branch
2. Make your changes
3. Submit a pull request for review

## 📧 Support

For support and inquiries, please contact the development team.

---

**Built with ❤️ using Next.js and Supabase**
