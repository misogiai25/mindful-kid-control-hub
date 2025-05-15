# Mindful Kid Control Hub

A modern parental control and screen time management application built with React, Vite, TypeScript, Supabase, and Tailwind CSS.

## Features
- Parent and child login with role-based access
- Add, edit, and manage child profiles
- PIN-based child login
- Monitor and limit screen time for each child
- Device lock/unlock for children
- Real-time updates using Supabase
- Usage reports and timeline (demo)
- Responsive, modern UI with shadcn-ui and Tailwind CSS

## Tech Stack
- **Frontend:** React, Vite, TypeScript
- **UI:** shadcn-ui, Tailwind CSS
- **Backend:** Supabase (PostgreSQL, Auth, Realtime)

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm (comes with Node.js)

### Installation
1. **Clone the repository:**
   ```sh
   git clone <YOUR_GIT_URL>
   cd mindful-kid-control-hub-main
   ```
2. **Install dependencies:**
   ```sh
   npm install
   ```
3. **Configure Supabase:**
   - Update the Supabase URL and public key in `src/integrations/supabase/client.ts` if you use your own Supabase project.
   - Ensure your Supabase tables (`profiles`, `children`, etc.) and Row Level Security (RLS) policies are set up as required.

4. **Start the development server:**
   ```sh
   npm run dev
   ```
   The app will be available at [https://mindful-kid-control-hub.lovable.app/login]

## Usage

### Parent Login
1. Open the app and select the **Parent Access** tab.
2. Sign up for a new account or log in with your existing credentials.
3. After logging in, you can add, edit, or remove child profiles.
4. Set daily time limits, lock/unlock devices, and monitor usage for each child.

### Adding a Child Profile
1. After logging in as a parent, go to the dashboard.
2. Click the button to add a new child profile.
3. Enter the child's name, age, and other required details.
4. Save the profile. The child can now log in using the name and PIN you set.

### Child Login
1. Open the app and select the **Child Login** tab.
2. Enter the child's name (as set by the parent) and the PIN code.
3. Click **Login** to access the child's dashboard and view allowed time and usage.
