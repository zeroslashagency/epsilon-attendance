import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initializeContainer } from "@/di/container";

initializeContainer().then(() => {
    createRoot(document.getElementById("root")!).render(<App />);
});
