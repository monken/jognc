import "./index.css";
import App from "./App.tsx";
import { render } from "preact";
import { GrblProvider } from "./contexts/grbl";

render(
  <GrblProvider>
    <App />
  </GrblProvider>,
  document.getElementById("root")!,
);
