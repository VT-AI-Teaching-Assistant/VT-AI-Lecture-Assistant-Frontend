# AI Lecture Assistant - Virginia Tech

A modern, responsive web application built with React and Tailwind CSS that provides a comprehensive learning management interface with AI integration for Virginia Tech students.

## 🚀 Features

### Core Pages
- **Profile Page**: Student information display with academic statistics
- **Home Page**: Piazza-style dashboard with announcements and discussions
- **AI Chat**: Interactive AI assistant for coursework help
- **Lectures**: Course materials with notes, quizzes, and recordings
- **Grades**: Assignment tracking with detailed statistics
- **FAQ**: Expandable questions and answers with search functionality

### Design Features
- **Virginia Tech Branding**: Official colors and professional academic aesthetic
- **Responsive Design**: Mobile-friendly layout that works across all devices
- **Modern UI**: Clean, minimalist interface with smooth transitions
- **Interactive Elements**: Hover effects, loading states, and dynamic content

## 🎨 Design System

### Colors
- **VT Maroon**: `#630031` - Primary brand color
- **VT Orange**: `#FF6600` - Secondary accent color
- **VT Gray**: `#54585A` - Text and UI elements
- **VT Light Gray**: `#F5F5F5` - Background elements

### Components
- Custom button styles (`btn-primary`, `btn-secondary`)
- Card layouts for consistent content presentation
- Sidebar navigation with active states
- Responsive grid systems

## 🛠 Technology Stack

- **React 18**: Modern React with hooks and functional components
- **React Router**: Client-side routing for single-page application
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Heroicons**: Beautiful SVG icons
- **PostCSS**: CSS processing and optimization

## 📦 Installation & Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm start
   ```

3. **Open in Browser**
   Navigate to `http://localhost:3000` 

## 📱 Pages Overview

### 1. Profile Page (`/profile`)
- Student profile picture and basic information
- Academic statistics (GPA, credits, courses completed)
- Current enrolled courses with credit information
- Clean, professional layout

### 2. Home Page (`/`)
- **Announcements Section**: Faculty announcements with priority levels
- **Discussions Section**: Student forum with Piazza-style functionality
- Search and filter capabilities
- Interactive voting and reply system

### 3. AI Chat (`/chat`)
- Real-time chat interface with AI assistant
- Message history with timestamps
- Markdown support for formatted responses
- Copy functionality for AI responses
- Typing indicators and smooth scrolling

### 4. Lectures Page (`/lectures`)
- List of all course lectures with metadata
- Three action buttons per lecture:
  - **Notes**: View detailed lecture notes
  - **Quiz**: Placeholder for quiz functionality
  - **Recording**: Placeholder for video recordings
- Statistics cards showing total lectures and duration

### 5. Lecture Notes (`/lectures/:id/notes`)
- Clean, readable layout for individual lecture notes
- Markdown rendering for formatted content
- Print-friendly styling
- Copy and print functionality
- Navigation back to lectures list

### 6. Grades Page (`/grades`)
- Comprehensive grade tracking table
- Filter by assignment type (Assignment, Quiz, Project, Exam)
- Search functionality
- Color-coded grade indicators
- Statistics showing average, highest grade, and total assignments
- Detailed feedback for each assignment

### 7. FAQ Page (`/faq`)
- Expandable question and answer format
- Category-based filtering
- Search functionality across questions and answers
- Expand/collapse all controls
- Color-coded categories
- Contact information for additional help

## 🎯 Key Features

### Responsive Design
- Mobile-first approach with breakpoints for tablets and desktops
- Collapsible sidebar navigation on mobile devices
- Flexible grid layouts that adapt to screen size
- Touch-friendly interface elements

### Interactive Elements
- Smooth hover transitions and animations
- Loading states and feedback
- Dynamic content filtering and searching
- Real-time updates in chat interface

### Accessibility
- Semantic HTML structure
- Proper contrast ratios
- Keyboard navigation support
- Screen reader friendly

### Performance
- Optimized bundle size
- Lazy loading where appropriate
- Efficient state management
- Fast development server with hot reloading

## 🔧 Customization

### Adding New Pages
1. Create component in `src/pages/`
2. Add route to `src/App.js`
3. Update navigation in `src/components/Layout.js`

### Modifying Data
- Update mock data in `src/data/mockData.js`
- Structure supports easy API integration

### Styling Changes
- Modify Tailwind config in `tailwind.config.js`
- Update CSS variables in `src/index.css`
- Add custom components in CSS layers

## 📊 Mock Data

The application includes comprehensive dummy data:
- Student profile information
- Course announcements and discussions
- Chat conversation history
- Lecture materials and notes
- Grade records with feedback
- FAQ questions and answers

All data is structured to support future API integration.

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Static Hosting
The built files in the `build/` directory can be deployed to:
- Netlify
- Vercel
- GitHub Pages
- AWS S3 + CloudFront
- Any static hosting service

## 🔮 Future Enhancements

- Real AI integration for chat functionality
- User authentication and authorization
- Backend API integration
- File upload capabilities
- Real-time notifications
- Mobile app version
- Advanced analytics and reporting

## 📝 License

This project is built for educational purposes and demonstrates modern web development practices for academic applications.

## 🎓 Virginia Tech Integration

The application is designed specifically for Virginia Tech with:
- Official branding and color scheme
- Academic workflow optimization
- Course structure alignment
- University-specific terminology
- "Ut Prosim" motto integration

---

**Built with ❤️ for Virginia Tech students** 