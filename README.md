# StyleFusion - Micro-SaaS UI

A minimal micro-SaaS application for AI-powered photo style transfer and fusion.

## Features

- **Style Selection**: Browse and select from 8 different artistic styles
- **Photo Upload**: Upload two photos for style fusion
- **Result Preview**: View and download your generated styled image

## Tech Stack

- **Vite** - Fast build tool and dev server
- **React** - UI library
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icons

## Project Structure

```
src/
├── components/
│   ├── Home.tsx       # Style selection grid
│   ├── Upload.tsx     # Photo upload interface
│   └── Result.tsx     # Result preview and download
├── assets/
│   └── styles/        # Custom styles (if needed)
├── App.tsx            # Main app with view routing
├── main.tsx           # Entry point
└── index.css          # Global styles
```

## Getting Started

```bash
npm install
npm run dev
```

## Views

### Home
- Grid of 8 style cards with gradient previews
- Hover effects and smooth transitions
- Click to select a style and proceed to upload

### Upload
- Upload interface for two photos
- Image preview before processing
- Validation to ensure both photos are uploaded
- Generate button to proceed to results

### Result
- Placeholder for generated fusion image
- Download button for saving the result
- "Create Another" button to start over

## Design Principles

- Clean, modern interface with subtle gradients
- Smooth transitions and hover effects
- Mobile-responsive grid layouts
- Clear visual hierarchy
- Production-ready styling

## Future Enhancements

- Backend API integration for actual image processing
- Database for storing user generations
- User authentication
- Payment integration
- Advanced style customization options
