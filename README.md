# TinyChurch Admin

A comprehensive church management system built with Next.js and Supabase, designed to help churches manage their congregations, staff, and organizational operations efficiently.

## Core Features

### Multi-Organization Support
- Complete organization management
- Organization-specific settings and configurations
- Resource usage tracking and limits
- Custom organization roles and permissions

### Advanced Authentication & Authorization
- Role-based access control (Admin, Staff, Ministry Leader, Member, Visitor)
- Super admin capabilities for platform management
- User impersonation for support and debugging
- Secure invitation system for new members

### Comprehensive Audit System
- Detailed activity logging
  - Authentication events
  - User actions
  - System events
  - Security events
- Audit severity tracking (Info, Warning, Error, Critical)
- Organization-specific audit trails

### Member Management
- Member profiles and directory
- Membership status tracking
- Role and permission management
- Custom membership numbers
- Contact information management

## Technical Stack

- **Frontend Framework**: [Next.js 14](https://nextjs.org) with App Router
- **Backend & Database**: [Supabase](https://supabase.com)
  - PostgreSQL database
  - Row Level Security
  - Real-time subscriptions
- **Authentication**: Supabase Auth with SSR support
- **UI & Styling**:
  - [Tailwind CSS](https://tailwindcss.com)
  - [shadcn/ui](https://ui.shadcn.com)
  - [Geist Sans](https://vercel.com/font) font
- **Type Safety**: TypeScript with complete database type generation

## Getting Started

1. **Create Supabase Project**:   ```bash
   # Create a new Supabase project at
   https://database.new   ```

2. **Clone & Install**:   ```bash
   git clone https://github.com/your-username/tinychurch-admin-app.git
   cd tinychurch-admin-app
   npm install   ```

3. **Environment Setup**:   ```bash
   cp .env.example .env.local   ```
   Update the following variables:   ```
   NEXT_PUBLIC_SUPABASE_URL=[YOUR_SUPABASE_PROJECT_URL]
   NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR_SUPABASE_ANON_KEY]   ```

4. **Generate Database Types**:   ```bash
   npm run db:types   ```

5. **Development Server**:   ```bash
   npm run dev   ```
   Visit [http://localhost:3000](http://localhost:3000)

## Project Structure

- `/app` - Next.js 14 App Router pages and layouts
- `/components` - Reusable React components
- `/lib` - Utility functions and business logic
  - `/dal` - Data Access Layer for Supabase
  - `/contexts` - React Context providers
  - `/utils` - Helper functions
- `/public` - Static assets

## Database Schema

The application uses a sophisticated database schema including:

- `organizations` - Church/organization details
- `organization_members` - Member relationships and roles
- `organization_settings` - Configurable settings
- `organization_limits` - Resource usage limits
- `activity_logs` - Audit and activity tracking

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

[Your License] - See LICENSE file for details
