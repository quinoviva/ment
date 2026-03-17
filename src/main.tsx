
  import { createRoot } from "react-dom/client";
  import App from "./app/App.tsx";
  import "./styles/index.css";
  import "./firebase/firebase"; // Import to ensure Firebase initialization runs

  createRoot(document.getElementById("root")!).render(<App />);
  