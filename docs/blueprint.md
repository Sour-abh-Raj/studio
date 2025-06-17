# **App Name**: TaskZen

## Core Features:

- Google Authentication: Sign in with Google using Firebase Auth
- Daily Task List: Display a task list specific to the current day. Each task has a title, status, order, and optional notes.
- Task Management: Enable the creation, editing, and deletion of tasks within the daily list.
- Daily Reset: Automatically create a new, empty task list for each day at midnight local time.
- Timezone Awareness: Ensure daily reset logic uses local time based on user’s browser.
- User Profile: Display user profile information fetched from Firebase Auth, including display name, email, and photo.
- Data persistence: Persist data in Firebase Firestore.
- PWA Support: Ensure the application functions as a Progressive Web App (PWA), installable on desktop and mobile devices.
- Dark Mode Toggle: Allow users to toggle between light and dark mode.
- Offline Support: Provide basic offline support, leveraging Firestore's offline persistence.
- Export/Backup: Allow users to export a day’s tasks/notes as JSON or text.
- Basic Analytics: Track completed tasks per day (done %, etc.) in the profile tab.

## Style Guidelines:

- Primary color: Desaturated blue (#558b9a) to evoke calmness and focus, and avoid drawing too much attention to the app, which should be a productivity aid, not an attention-grabber.
- Background color: Light gray (#f0f2f5), complementing the blue to maintain a serene ambiance. As a very pale tint of the primary hue, the background recedes and puts the interface elements at center stage.
- Accent color: Muted violet (#926AA6) for interactive elements like buttons, providing contrast without being jarring. This color calls to mind the color of ink, alluding to the old tool of diaries or paper task managers.
- Headline font: 'Poppins', a geometric sans-serif, lends a clean and fashionable touch.
- Body font: 'Inter', grotesque-style sans-serif with a modern look.
- Simple, outline-style icons for task status and actions.
- Clean, card-based layout for daily tasks.