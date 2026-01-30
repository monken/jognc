import { StrictMode } from "react";
import "./index.css";
import App from "./App.tsx";
import { render } from "preact";
import { GrblProvider } from "./contexts/grbl";

render(
  <StrictMode>
    <GrblProvider><App /></GrblProvider>
  </StrictMode>,
  document.getElementById("root")!,
);
