# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog],
and this project adheres to [Semantic Versioning].


## [0.1.0] - 2026-01-21

### Added

- **Supabase Backend Integration**
  - Database schema for services, bookings, transactions, availability, and blocked dates
  - Supabase client setup for both client and server components
  - Database types and TypeScript interfaces

- **Appointment Booking Flow**
  - Multi-step booking modal with date picker and time slot selection
  - Customer information form with validation
  - Booking confirmation with reference number
  - Redirect to Paystack payment after booking

- **Email Notifications**
  - Customer booking confirmation emails with beautiful HTML templates
  - Admin notification emails for new bookings
  - Resend email service integration

- **Admin Panel** (`/admin`)
  - Dashboard with booking statistics and revenue overview
  - Bookings management page with search and filter
  - Services management with add/edit functionality
  - Transactions page to view Paystack payments
  - Settings page for availability and blocked dates management

- **API Routes**
  - `/api/services` - Get all services
  - `/api/services/categories` - Get service categories
  - `/api/bookings` - Create and list bookings
  - `/api/bookings/[id]` - Get, update, delete bookings
  - `/api/availability` - Check and manage available time slots
  - `/api/transactions` - View transaction history
  - `/api/webhook/paystack` - Handle Paystack payment webhooks
  - `/api/admin/blocked-dates` - Manage blocked dates

- **shadcn/ui Components**
  - Migrated to shadcn/ui component library
  - Added: Button, Card, Dialog, Dropdown, Form, Input, Label, Select, Separator, Sheet, Table, Tabs, Textarea, Badge, Calendar, Popover, Sonner (toast)

- **Paystack Webhook Integration**
  - Payment success/failure handling
  - Automatic booking confirmation on successful payment
  - Transaction recording in database

### Changed

- Updated all buttons to use shadcn/ui Button component
- Made all CTA buttons functional with proper navigation
- Improved service cards with better styling and responsive design
- Enhanced services page hero section
- Updated social media links to open in new tabs

### Removed

- Old custom Button component (replaced with shadcn/ui)


## [0.0.2] - 2025-12-25

### Added

- Setup project
- Components directory
- Header component
- Simple icons library for social media icons
- Custom button component
- Prettier config to wrap the tailwind classes
- Mobile nav for smaller screens
- Added button variants
- Added services section
- Added a process section
- Testimonial content component
- Added testimonial section
- Added tab variant to button component

### Changed
- Updated the button style
- Improved the responsiveness of the Hero
- Changed the layout of the value section
- Improved the responsiveness of the section component


### Deprecated

### Removed

### Fixed

### Security

## [0.0.1] - 2025-12-25

- initial release

<!-- Links -->
[keep a changelog]: https://keepachangelog.com/en/1.0.0/
[semantic versioning]: https://semver.org/spec/v2.0.0.html

<!-- Versions -->
[unreleased]: https://github.com/Author/Repository/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/Author/Repository/compare/v0.0.2...v0.1.0
[0.0.2]: https://github.com/Author/Repository/compare/v0.0.1...v0.0.2
[0.0.1]: https://github.com/Author/Repository/releases/tag/v0.0.1