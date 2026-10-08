# Client-Hub

A modern, minimal, and professional **Client & Project Management Dashboard** for freelance software developers and digital agencies. Built with Next.js 16 (App Router), TypeScript, Tailwind CSS, and Supabase.

---

## 🚀 Key Features

- **Personal Owner Authentication**:
  - Secure login protection for workspace access with persistent sessions.
  - In-app password change functionality (via Supabase Auth or Local Demo Mode).
- **Workspace Custom Branding**:
  - Customize workspace name, subtitle tagline, and upload custom company logos.
  - Drag-and-drop logo upload box with real-time sidebar preview.
- **Collapsible Sidebar**:
  - Smooth animation between full width and compact icon-only mode with floating tooltips.
  - Global `Ctrl + B` (or `Cmd + B`) keyboard shortcut.
  - State persisted across page reloads in `localStorage`.
  - Responsive mobile drawer with blur backdrop.
- **Client Management**:
  - Add, edit, view, and delete clients with safe confirmation dialogs.
  - Track contact info: Email, Phone, Company, WhatsApp, Status, and Notes.
  - 1-click WhatsApp (`https://wa.me/...`), direct email (`mailto:`), and phone links.
- **Projects & Deliverables**:
  - Unified project cards with consistent logo frame aspect ratios.
  - Stored URLs: Live Website, GitHub Repo, Vercel Deployment, Server Console, Admin Panel.
  - Image upload directly from device or via direct URL with live thumbnail preview.
  - Tech stack badges and status indicators (`In Development`, `Live`, `Completed`, `Maintenance`, `Paused`).
- **Outstanding Payments & Receivables**:
  - Automatic balance calculation: `Remaining = Total - Paid`.
  - Financial ledger with instant **Record Payment** action.
  - Filter by payment status (`All`, `Unpaid`, `Partially Paid`, `Paid`).
- **Minimal Dashboard & Metrics**:
  - Real-time KPIs: Total Clients, Active Projects, Invoiced Revenue, Collected Revenue, and Outstanding Receivables.
  - Quick action ribbon to create clients or projects in one click.
- **Tailored UI/UX**:
  - High-end neutral aesthetic with soft slate borders and curated typography.
  - Custom glassmorphic toast notifications.
  - Completely English unified interface.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router with Turbopack)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v3
- **Icons**: React Icons (`react-icons/fi`)
- **Backend / Database**: Supabase PostgreSQL with Row-Level Security (RLS) & local Demo fallback

---

## 📦 Getting Started

1. **Clone the repository**:
   ```bash
   git clone https://github.com/AbdelazizSleem01/Client-Hub.git
   cd Client-Hub
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env.local` and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.
