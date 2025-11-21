# PayTo Frontend

A modern, responsive web application for comprehensive financial management built with Next.js 15, React 19, and TypeScript. Designed for Argentine businesses to manage invoices, payments, collections, and financial analytics with AFIP integration.

![PayTo Dashboard](../docs/images/dashboard.png)
*Comprehensive financial dashboard with real-time KPIs*

## 🎯 Overview

PayTo Frontend is a full-featured financial management dashboard that provides:

- **Invoice Management**: Create, track, and manage invoices with real-time status updates
- **Payment & Collection Tracking**: Register and monitor payments with company isolation
- **Financial Dashboard**: Real-time KPIs, analytics, and financial reports
- **Multi-Company Support**: Seamless switching between multiple companies
- **AFIP Integration**: Electronic invoice validation and certificate management
- **Network Management**: B2B connections and invoice sharing
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Real-time Notifications**: Stay updated with invoice and payment events

## 🛠 Tech Stack

### Frontend Framework
- **Next.js 15** - React framework with App Router and server components
- **React 19** - Latest React with improved performance
- **TypeScript** - Type-safe JavaScript development
- **Tailwind CSS 4** - Utility-first CSS framework

### UI Components & Libraries
- **Radix UI** - Unstyled, accessible component primitives
- **Lucide React** - Beautiful icon library
- **Recharts** - Composable charting library
- **React Hook Form** - Performant form management
- **Sonner** - Toast notifications
- **Three.js** - 3D graphics (for animations)

### Development Tools
- **ESLint** - Code quality and style
- **TypeScript** - Static type checking
- **Tailwind CSS** - Responsive design utilities

## 📋 Features

![PayTo Network Management](../docs/images/network.png)
*Network management and invoice tracking interface*

### Dashboard
- Real-time financial KPIs (Receivable, Payable, VAT Balance)
- Period-based analytics (24h, 7d, 28d, 3m, 12m, all-time)
- Invoices to pay and collect with pagination
- Pending tasks management
- Financial trend charts

### Invoice Management
- **Create Invoices**: Issue and receive invoices with full details
- **Invoice Tracking**: Real-time status updates and history
- **Approval Workflows**: Multi-level approval system
- **Credit/Debit Notes**: Manage NC and ND documents
- **PDF Generation**: Download invoices as PDF
- **Bulk Operations**: Manage multiple invoices at once

### Payment & Collection System
- **Payment Registration**: Record payments with automatic status updates
- **Collection Tracking**: Monitor collections with withholding details
- **Multi-Currency**: Support for ARS, USD, EUR
- **Retention Management**: Automatic retention calculations
- **Payment History**: Complete payment audit trail

### Financial Analytics
- **Accounts Receivable**: Track invoices to collect
- **Accounts Payable**: Monitor invoices to pay
- **VAT Management**: Real-time VAT balance calculations
- **Overdue Tracking**: Identify overdue invoices
- **Financial Reports**: Period-based financial summaries
- **Charts & Graphs**: Visual representation of financial data

### Multi-Company Management
- **Company Switching**: Seamless switching between companies
- **Member Management**: Invite and manage team members
- **Role-Based Access**: Admin, Manager, Viewer roles
- **Company Settings**: Configure company preferences
- **Fiscal Data**: AFIP certificate and fiscal information

### Network & Collaboration
- **B2B Connections**: Connect with other companies
- **Invoice Sharing**: Share invoices with network partners
- **Connection Requests**: Send and receive connection requests
- **Shared Access**: Grant invoice access to partners

### AFIP Integration
- **Certificate Management**: Upload and manage AFIP certificates
- **Electronic Invoices**: Validate invoices with AFIP
- **CAE Tracking**: Monitor CAE authorization status
- **Real-time Sync**: Synchronize with AFIP in real-time
- **Error Handling**: Clear error messages and guidance

### User Experience
- **Responsive Design**: Mobile-first approach
- **Dark Mode**: Theme switching support
- **Accessibility**: WCAG compliant components
- **Loading States**: Skeleton screens for better UX
- **Error Handling**: User-friendly error messages
- **Toast Notifications**: Real-time feedback

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ or higher
- npm or yarn package manager
- Backend API running (see payto-back README)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd payto-front
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **Setup environment**
```bash
cp .env.example .env.local
```

4. **Configure API endpoint**
Edit `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

5. **Start development server**
```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
npm start
```

## 📁 Project Structure

```
payto-front/
├── app/
│   ├── (auth)/                     # Authentication pages
│   ├── company/[id]/               # Company-specific pages
│   │   ├── page.tsx                # Dashboard
│   │   ├── invoices/               # Invoice management
│   │   ├── accounts-receivable/    # Receivable invoices
│   │   ├── accounts-payable/       # Payable invoices
│   │   ├── analytics/              # Financial analytics
│   │   ├── members/                # Team management
│   │   ├── network/                # B2B connections
│   │   └── settings/               # Company settings
│   ├── dashboard/                  # Main dashboard
│   ├── layout.tsx                  # Root layout
│   └── globals.css                 # Global styles
├── components/
│   ├── ui/                         # Reusable UI components
│   ├── dashboard/                  # Dashboard components
│   ├── invoices/                   # Invoice components
│   ├── accounts/                   # Financial components
│   ├── analytics/                  # Analytics components
│   ├── auth/                       # Authentication components
│   ├── layouts/                    # Layout components
│   └── shared/                     # Shared components
├── services/                       # API service layer
├── contexts/                       # React contexts
├── hooks/                          # Custom React hooks
├── lib/                            # Utility functions
├── styles/                         # Style utilities
└── public/                         # Static assets
```

## 🎨 UI Components

### Core Components
- **Card** - Container component
- **Button** - Action button
- **Input** - Text input field
- **Select** - Dropdown selection
- **Dialog** - Modal dialog
- **Tabs** - Tab navigation
- **Table** - Data table
- **Checkbox** - Checkbox input
- **Textarea** - Multi-line text input

### Specialized Components
- **InvoiceCard** - Invoice display card
- **PaymentCollectionCard** - Payment/collection card
- **SummaryCards** - KPI summary cards
- **EntityForm** - Entity creation/editing form
- **DatePicker** - Date selection component
- **Sidebar** - Navigation sidebar
- **Navbar** - Top navigation bar

## 🔐 Authentication

The application uses token-based authentication:

1. Register or login with credentials
2. Token is stored securely in localStorage
3. Token is included in all API requests
4. Automatic logout on token expiration

## 🎯 Key Pages

### Dashboard (`/dashboard`)
Main entry point showing financial overview and quick actions.

### Company Dashboard (`/company/[id]`)
Company-specific dashboard with KPIs and recent activity.

### Invoices (`/company/[id]/invoices`)
Create, view, and manage invoices.

### Accounts Receivable (`/company/[id]/accounts-receivable`)
Track invoices to collect with payment status.

### Accounts Payable (`/company/[id]/accounts-payable`)
Monitor invoices to pay with payment tracking.

### Analytics (`/company/[id]/analytics`)
Financial analytics and reporting.

### Members (`/company/[id]/members`)
Manage company team members and permissions.

### Network (`/company/[id]/network`)
B2B connections and invoice sharing.

### Settings (`/company/[id]/settings`)
Company configuration and AFIP certificate management.

## 🔄 State Management

The application uses:
- **React Context** - Global state (auth, company)
- **React Hooks** - Local component state
- **Custom Hooks** - Reusable logic

## 🎨 Styling

- **Tailwind CSS** - Utility-first CSS framework
- **CSS Variables** - Theme customization
- **Responsive Design** - Mobile-first approach
- **Dark Mode** - Theme switching support

## 📱 Responsive Breakpoints

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

## 🔗 API Integration

The frontend communicates with the backend API through service classes:

- `companyService` - Company operations
- `invoiceService` - Invoice management
- `paymentService` - Payment operations
- `collectionService` - Collection tracking
- `authService` - Authentication
- `notificationService` - Notifications

## 🚨 Error Handling

The application handles errors gracefully:
- API errors are caught and displayed to users
- Toast notifications for user feedback
- Fallback UI for loading states
- Validation error messages

## 📊 Performance Optimizations

- **Code Splitting** - Automatic with Next.js
- **Image Optimization** - Next.js Image component
- **Lazy Loading** - Dynamic imports for components
- **Caching** - Strategic caching of API responses
- **Memoization** - React.memo for expensive components

## 🧪 Development

### Code Quality
```bash
# Run linter
npm run lint

# Format code
npm run format
```

### Browser Support
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 🚀 Deployment

### Production Build
```bash
npm run build
npm start
```

### Vercel Deployment (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Docker Deployment
```bash
docker build -t payto-front .
docker run -p 3000:3000 payto-front
```

### Environment Configuration
Ensure these variables are set in production:
```env
NEXT_PUBLIC_API_URL=https://api.payto.com/api
NODE_ENV=production
```

## ⚡ Performance Optimization

### Code Splitting
- Automatic with Next.js App Router
- Dynamic imports for heavy components
- Route-based code splitting

### Image Optimization
- Next.js Image component for automatic optimization
- WebP format support
- Responsive image sizes
- Lazy loading by default

### Caching Strategy
- Static generation for static pages
- Incremental Static Regeneration (ISR)
- Client-side caching with SWR
- Browser caching headers

### Bundle Optimization
- Tree-shaking of unused code
- Minification in production
- CSS purging with Tailwind
- Font optimization

## 🔒 Security Best Practices

- **HTTPS Only**: Always use HTTPS in production
- **API Token Storage**: Secure token storage in httpOnly cookies
- **CORS Configuration**: Proper CORS headers from backend
- **Input Validation**: Client-side validation with server-side verification
- **XSS Prevention**: React's built-in XSS protection
- **CSRF Protection**: Token-based CSRF protection
- **Content Security Policy**: Implement CSP headers
- **Dependency Updates**: Regular security updates

## 🧪 Testing

### Unit Tests
```bash
npm run test
```

### E2E Tests
```bash
npm run test:e2e
```

### Coverage Report
```bash
npm run test:coverage
```

## 📊 Monitoring

### Error Tracking
- Implement Sentry for error tracking
- Monitor API response times
- Track user interactions

### Analytics
- Google Analytics integration
- User behavior tracking
- Performance metrics

## 📚 Documentation

For detailed information:
- Component documentation: See `components/` folder
- Service documentation: See `services/` folder
- Utility functions: See `lib/` folder
- Custom hooks: See `hooks/` folder

## 🤝 Contributing

1. Create a feature branch from `develop`
2. Make your changes following code style
3. Run linter: `npm run lint`
4. Test your changes: `npm run test`
5. Submit a pull request with description

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
1. Check existing issues on GitHub
2. Review the documentation
3. Contact the development team

---

**Last Updated**: November 2025
**Version**: 1.0.0
**Next.js Version**: 15.x
**React Version**: 19.x
**Node.js**: 18+
