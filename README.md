# Thank Someone

A beautiful web application where anyone can anonymously post a "thank you" note to a stranger they met. Share gratitude, spread positivity, and remind people that small good actions matter.

## Features

- Post anonymous thank-you notes
- Categorization of notes (Help, Kindness, Lost and Found)
- Beautiful card-style display
- Fully responsive design across all devices and screen sizes
- Like functionality
- Infinite scrolling on larger screens
- Filtering by categories
- Smooth animations optimized for each device

## Live Demo

Visit the live site at: [https://your-username.github.io/thank-someone](https://your-username.github.io/thank-someone)

## Setup Instructions

### Prerequisites

- [Node.js](https://nodejs.org/) (for using Firebase tools)
- A [Firebase](https://firebase.google.com/) account

### Step 1: Clone the repository

```bash
git clone https://github.com/your-username/thank-someone.git
cd thank-someone
```

### Step 2: Set up Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Add a web app to your project
4. Copy the Firebase configuration object

### Step 3: Update Firebase configuration

Replace the placeholder configuration in `app.js` with your actual Firebase configuration:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "your-project-id.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project-id.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

### Step 4: Setup Firestore Database

1. In the Firebase Console, go to Firestore Database
2. Create a database (start in test mode for easier setup)
3. Create a collection named `thankyous`

### Step 5: Deploy to GitHub Pages

1. Create a repository on GitHub
2. Push your code to the repository
3. Go to repository settings > Pages
4. Select the main branch as the source
5. Click Save

Your site will be published at `https://your-username.github.io/thank-someone`

## Alternatively: Deploy to Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase init
firebase deploy
```

## Responsive Design

The website is built to be fully responsive and work seamlessly on all devices:

- **Mobile-first approach**: Optimized for mobile devices first, then enhanced for larger screens
- **Fluid typography**: Text sizes adjust automatically based on viewport width
- **Flexible layouts**: Grid and flexbox layouts adapt to any screen size
- **Performance optimizations**: Reduced animations on mobile, infinite scrolling only on desktop
- **Print styles**: Optimized layout when printing the page

## Customization

- Change colors in the CSS file by modifying the CSS variables in the `:root` selector
- Add more categories in the `categorizeMessage` function
- Modify the form fields
- Add social sharing functionality
- Adjust responsive breakpoints in the CSS media queries

## License

[MIT](LICENSE)

## Acknowledgements

- [Animate.css](https://animate.style/) for animations
- [Firebase](https://firebase.google.com/) for backend services
- [Google Fonts](https://fonts.google.com/) for typography 