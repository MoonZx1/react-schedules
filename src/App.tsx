import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";  // นำเข้า Home.tsx
import Deadline from "./pages/Deadline";  // ใช้ชื่อไฟล์ที่ถูกต้อง
import Settings from "./pages/Settings";  // นำเข้า Settings.tsx

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />  {/* หน้าแรก */}
        <Route path="/deadline" element={<Deadline />} />  {/* หน้า Deadline */}
        <Route path="/settings" element={<Settings />} />  {/* หน้า Settings */}
      </Routes>
    </Router>
  );
};

export default App;
