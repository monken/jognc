# jogNC

A modern, lightweight web interface for controlling GRBL-based CNC machines (specifically targeting FluidNC) via WebSocket. Built with [Preact](https://preactjs.com/), [Vite](https://vitejs.dev/), and [Tailwind CSS](https://tailwindcss.com/).

## Features

- **Real-time Status**: View machine coordinates (mPos), spindle speed, feed rate, and current state (Idle, Run, Alarm, etc.).
- **Jogging Controls**: Manual machine movement functionality.
- **State Management**: Visual feedback for machine states (Alarm, Hold, Jog, Run) with color-coded indicators.
- **WebSocket Communication**: Direct, low-latency connection to the CNC controller.
- **Mobile Friendly**: Responsive design suitable for tablets and touchscreens next to your machine.

## Tech Stack

- **Framework**: Preact (via `@preact/preset-vite`)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Build Tool**: Vite

## Getting Started

### Prerequisites

- Node.js (Latest LTS recommended)
- A GRBL/FluidNC controller accessible via network

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd jog
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Development

Start the development server:

```bash
npm run dev
```

By default, in development mode, the application attempts to connect to `http://fluidnc.local/`. You can modify this in `src/contexts/grbl/provider.tsx` if your controller is at a different address.

### Building for Production

Build the application for deployment:

```bash
npm run build
```

The output will be in the `dist/` directory. These files can be uploaded to the SPIFFS/LittleFS of an ESP32 running FluidNC or served via a static web server that proxies WebSocket connections to the controller.

## Project Structure

- `src/components`: UI components (Jog controls, Alarm, Coordinates, etc.)
- `src/contexts`: Global state management (GRBL connection and state)
- `src/lib`: Utilities for WebSocket communication and GRBL message parsing
- `src/assets`: Static assets

## License

[MIT](LICENSE)
