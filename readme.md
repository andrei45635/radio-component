# Radio Player Web Component

A customizable, themable web component for streaming internet radio stations built with Lit and TypeScript.

![Radio Player Screenshot](public/radio-player.png)

## Features

- 🎵 Stream online radio stations
- 🎨 Multiple theme options (light, dark, neon, cyberpunk)
- 📻 Station search and filtering
- 📋 Add custom radio stations
- 🔊 Volume control with fade transitions
- 📊 Audio visualizer
- 💾 Persistent settings (volume, mute state)
- 🌙 Dark mode detection
- 📱 Responsive design

## Installation

### Using npm

```bash
npm install radio-player-component
```

### Manual Installation

1. Download the `radio-player.js` file from the dist directory
2. Include it in your HTML:

```html
<script type="module" src="path/to/radio-player.js"></script>
```

## Usage

Add the component to your HTML:

```html
<radio-player theme="dark"></radio-player>
```

### Load Stations Programmatically

```javascript
const player = document.querySelector('radio-player');
player.stations = [
  {
    name: "My Radio Station",
    url: "https://stream.example.com/station.mp3",
    logo: "https://example.com/logo.png" // Optional
  },
  // Add more stations...
];
```

### Theme Options

The component supports four themes:

- `light` - Light theme (default)
- `dark` - Dark theme
- `neon` - Neon green theme
- `cyberpunk` - Cyberpunk pink theme

```html
<radio-player theme="neon"></radio-player>
```

You can change the theme dynamically:

```javascript
const player = document.querySelector('radio-player');
player.theme = 'cyberpunk';
```

### Events

The component emits the following events:

- `play` - When playback starts
- `pause` - When playback pauses
- `station-change` - When the station changes (with station data)

```javascript
const player = document.querySelector('radio-player');

player.addEventListener('play', () => {
  console.log('Playback started');
});

player.addEventListener('pause', () => {
  console.log('Playback paused');
});

player.addEventListener('station-change', (e) => {
  console.log('Station changed to:', e.detail.station.name);
});
```

## Station Data Format

Each station should have the following format:

```javascript
{
  name: "Station Name",     // Required
  url: "stream-url.mp3",    // Required
  logo: "logo-url.png"      // Optional
}
```

## API Reference

### Properties

| Property | Attribute | Type | Default | Description |
|----------|-----------|------|---------|-------------|
| `stations` | - | `Station[]` | `[]` | Array of radio stations |
| `theme` | `theme` | `'light'/'dark'/'neon'/'cyberpunk'` | `'light'` | Visual theme |

### Methods

| Method | Description |
|--------|-------------|
| `togglePlay()` | Toggle play/pause state |
| `toggleMute()` | Toggle mute state |

### Styling

The component uses Shadow DOM for encapsulation, but you can adjust the outer container using standard CSS:

```css
radio-player {
  max-width: 500px;
  margin: 2rem auto;
}
```

## Sample Implementation

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Radio Player Demo</title>
  <script type="module" src="radio-player.js"></script>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    
    .theme-selector {
      display: flex;
      justify-content: center;
      margin-bottom: 20px;
    }
    
    button {
      margin: 0 5px;
      padding: 8px 16px;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <h1>Radio Player Demo</h1>
  
  <div class="theme-selector">
    <button onclick="changeTheme('light')">Light</button>
    <button onclick="changeTheme('dark')">Dark</button>
    <button onclick="changeTheme('neon')">Neon</button>
    <button onclick="changeTheme('cyberpunk')">Cyberpunk</button>
  </div>
  
  <radio-player theme="light"></radio-player>
  
  <script>
    function changeTheme(theme) {
      document.querySelector('radio-player').theme = theme;
    }
    
    // Optional: Add some fallback stations
    window.addEventListener('DOMContentLoaded', () => {
      const player = document.querySelector('radio-player');
      
      // You can set default stations if needed
      // player.stations = [...];
    });
  </script>
</body>
</html>
```

## Fallback Stations

The component will try to load stations from the radio-browser.info API. If that fails, it will attempt to load them from a local file at `/utils/stations.json`. You can provide this file with the following format:

```json
[
  {
    "name": "Station 1",
    "url": "https://example.com/stream1.mp3",
    "logo": "https://example.com/logo1.png"
  },
  {
    "name": "Station 2",
    "url": "https://example.com/stream2.mp3",
    "logo": "https://example.com/logo2.png"
  }
]
```

## Building From Source

### Prerequisites

- Node.js and npm

### Setup

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Build the component:

```bash
npm run build
```

4. Run the dev server:

```bash
npm run dev
```

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Troubleshooting

### Audio Not Playing

- Check browser console for errors
- Some radio streams may have CORS restrictions
- Make sure the stream URL is valid and accessible
- Browser might be blocking autoplay - ensure user interaction before playing

### Visualizer Not Working

- CORS issues can prevent the visualizer from working
- Some browsers require HTTPS for AudioContext
- Check the console for specific errors

## License

MIT License

## Credits

- Radio station data provided by [Radio Browser API](https://www.radio-browser.info/)
- Built with [Lit](https://lit.dev/)