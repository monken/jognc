# AI Coding Agent Instructions

This document provides guidance for AI coding agents working on this codebase. Follow these instructions to ensure consistency and productivity.

## Project Overview

This project is a React application using TypeScript and Vite. It is configured with ESLint for linting and supports hot module replacement (HMR). The project structure includes the following key directories and files:

- **src/**: Contains the main application code, including `App.tsx` and `main.tsx`.
- **public/**: Static assets served by the application.
- **eslint.config.js**: ESLint configuration file.
- **tsconfig.\*.json**: TypeScript configuration files for different environments.
- **vite.config.ts**: Vite configuration file.

## Key Workflows

### Development

- Use `npm run dev` to start the development server with HMR.
- Modify files in `src/` to see live updates in the browser.

### Building

- Use `npm run build` to create a production build in the `dist/` directory.

### Linting

- Run `npm run lint` to check for linting errors.
- Update `eslint.config.js` to customize linting rules.

### Testing

- Add tests in the `src/` directory and configure a testing framework if needed.

## Project-Specific Conventions

- **TypeScript Configurations**: The project uses `tsconfig.app.json` and `tsconfig.node.json` for application and Node.js-specific settings, respectively.
- **ESLint Rules**: Type-aware lint rules are recommended for production. Update `eslint.config.js` to enable stricter rules if necessary.
- **React Compiler**: Not enabled by default due to performance considerations. Refer to the [React Compiler documentation](https://react.dev/learn/react-compiler/installation) for setup instructions.

## External Dependencies

- **Vite Plugins**: The project uses `@vitejs/plugin-react` or `@vitejs/plugin-react-swc` for React-specific optimizations.
- **ESLint Plugins**: Includes `eslint-plugin-react-x` and `eslint-plugin-react-dom` for React-specific linting.

## Examples

### Adding a New Component

1. Create a new file in `src/`, e.g., `src/MyComponent.tsx`.
2. Use the following template:

```tsx
import React from "react";

const MyComponent: React.FC = () => {
  return <div>My New Component</div>;
};

export default MyComponent;
```

3. Import and use the component in `App.tsx`.

### Updating ESLint Rules

1. Open `eslint.config.js`.
2. Add or modify rules as needed. For example:

```js
export default defineConfig([
  {
    files: ["**/*.{ts,tsx}"],
    extends: ["eslint:recommended", "plugin:react/recommended"],
  },
]);
```

## Notes

- Always test changes locally before committing.
- Follow the existing code style and structure to maintain consistency.
