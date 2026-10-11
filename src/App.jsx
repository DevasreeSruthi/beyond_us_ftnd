import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Landing from "./Pages/Landing";
import Login from "./Pages/Login";
import Dashboard from "./Pages/Dashboard";

function Protected({ children }) {
  return localStorage.getItem("beyondus_user") ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;