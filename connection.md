# Client Communication Workflow & Tech Stack (Next.js Architecture)

## Tech Stack Overview
The Creator Command Centre uses a modern nextjs and node react stack to handle both the user interface and the automated background tasks.

### 1. Frontend (The User Interface)
- **React.js:** Used for building reusable UI components (Dashboard, Checklists, Action Buttons).
- **Tailwind CSS:** Utility-first framework for fast, premium, and responsive styling.
- **TypeScript:** Adds strict type checking to JavaScript, preventing errors in complex API payloads.

### 2. Next.js (The Full-Stack Framework)
Next.js acts as the overarching framework that unifies the frontend and backend.
- **Unified Codebase:** Allows writing React UI and backend API routes in the same repository.
- **Server Actions & API Routes:** Securely handles button clicks from the dashboard directly to the server.
- **Server-Side Rendering (SSR):** Ensures client "Magic Link" portals load instantly.

### 3. Node.js (The Runtime Environment)
Next.js backend routes run on a Node.js environment. It provides the heavy lifting for server-side logic:
- **Secure API Management:** Safely holds secret API keys for Meta (WhatsApp), Twilio, and ElevenLabs.
- **Background Automation:** Runs server-side tasks to detect ghosting clients based on database timestamps.

---

## Workflow: The Creator Dashboard (UI)
**Component:** `ClientDashboard.tsx`
This is the interface where the creator logs their progress.

### Inputs Required:
- **Project/Client Selection:** Dropdown to select the active client.
- **Update Summary Box:** A `<textarea>` where the creator writes a general summary of the work done.
- **Dynamic Checklist:** A list input allowing the creator to add/remove specific tasks completed (e.g., [x] Designed Homepage, [x] Setup Database).

### Action Buttons:
- `[Send Update]`: Triggers the standard progress report workflow.
- `[Send Warning]`: Triggers the escalation workflow for unresponsive clients.

---

## Backend: API Routes (Next.js App Router)

### Endpoint A: Sending an Update
**Route:** `POST /api/communications/send-update`

**Workflow:**
1. Frontend sends payload: `{ clientId, updateSummary, checklist: ["Task 1", "Task 2"] }`.
2. Backend (Node.js engine) receives data and formats it into a professional message string.
3. Backend triggers the external API (WhatsApp/Twilio) to send the message.
4. Backend updates the database (MongoDB): Sets `last_update_sent` timestamp.

**Generated Message Format:**
> **Project Update**
> Hi [Client Name],
> 
> [updateSummary inserted here]
> 
> ✅ **Completed Tasks:**
> - [Task 1]
> - [Task 2]
> 
> Please review the attached deliverables and let me know if we are good to proceed!

---

### Endpoint B: Sending a Warning
**Route:** `POST /api/communications/send-warning`

**Workflow:**
1. Frontend sends payload: `{ clientId }`.
2. Backend queries the database to fetch the *last sent update summary and checklist* that is still pending approval.
3. Backend formats the data into an urgent warning string.
4. Backend triggers the external API to send the message.
5. Backend updates the database: Increments the `warning_level` counter.

**Generated Message Format:**
> ⚠️ **Pending Review Reminder**
> Hi [Client Name],
> 
> We recently sent over an update regarding the following deliverables:
> - [Task 1 from database]
> - [Task 2 from database]
> 
> We have not yet received a review or response from your side. Please note that to maintain quality, further development is **paused** until these items are reviewed. 
> 
> Please let me know if you need any clarification!

---

## Integration & Database Steps
1. **API Integration (`lib/messaging.js`):** Create a utility function running on Node.js to handle the HTTP request to the Meta WhatsApp API or Twilio.
2. **Database Tracking (`lib/db.js`):** Ensure your MongoDB `Projects` collection has fields for:
   - `status` (e.g., "In Progress", "Pending Review", "Paused")
   - `last_update_sent_at` (Date)
   - `pending_checklist` (Array of Strings)