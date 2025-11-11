# LinkIt EJS Frontend

This is the converted EJS-based frontend for LinkIt, originally built with React.

## Structure

```
frontend2/
├── views/                 # EJS templates
│   ├── partials/         # Reusable EJS partials
│   │   ├── navbar.ejs    # Navigation bar
│   │   ├── footer.ejs    # Footer
│   │   ├── linkitLogo.ejs # Logo component
│   │   └── darkButton.ejs # Dark mode toggle
│   ├── layout.ejs        # Main layout template
│   ├── landing.ejs       # Landing page
│   ├── login.ejs         # Login page
│   ├── register.ejs      # Registration page
│   ├── dashboard.ejs     # User dashboard
│   ├── publicProfile.ejs # Public profile page
│   └── rankings.ejs      # Rankings page
├── public/               # Static assets
│   ├── css/             # Stylesheets
│   │   └── style.css    # Main CSS file
│   ├── js/              # JavaScript files
│   │   └── main.js      # Main client-side JavaScript
│   └── images/          # Images and icons
└── README.md            # This file
```

## Features

- **Server-side rendering** with EJS templates
- **Responsive design** using Tailwind CSS
- **Dark mode support** with client-side toggle
- **Authentication** with JWT cookies
- **Form handling** with server-side validation
- **Dynamic content** with EJS templating
- **Static asset serving** from Express

## Key Changes from React

1. **Templates**: React components converted to EJS templates
2. **State Management**: React state replaced with server-side data passing
3. **Routing**: React Router replaced with Express routes
4. **Authentication**: JWT stored in httpOnly cookies instead of localStorage
5. **Form Handling**: Server-side form processing with redirects
6. **Styling**: Preserved Tailwind CSS classes and custom styles

## Usage

The frontend is served by the Express backend server. All routes are handled by the backend:

- `/` - Landing page
- `/login` - Login page
- `/register` - Registration page
- `/dashboard` - User dashboard (protected)
- `/profile/:username` - Public profile page
- `/rankings` - Rankings page
- `/logout` - Logout (redirects to home)

## Client-side JavaScript

The `main.js` file handles:
- Dark mode toggle
- Mobile menu toggle
- Form interactions
- API calls for dynamic content
- Utility functions

## Styling

- Uses Tailwind CSS via CDN
- Custom CSS in `style.css`
- Responsive design maintained
- Dark mode support preserved


