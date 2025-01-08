import { initializeApp, getApps } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyBR6LnU2kXC-AFF7GC9rvBZgutRkMFKW6U",
  authDomain: "react-schedules.firebaseapp.com",
  databaseURL: "https://react-schedules-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "react-schedules",
  storageBucket: "react-schedules.firebasestorage.app",
  messagingSenderId: "100724799492",
  appId: "1:100724799492:web:04b0cd15e808dd87d89d51",
  measurementId: "G-X7L13Y35SC"
};

// ตรวจสอบว่ามี Firebase App ถูกสร้างแล้วหรือไม่
const app = initializeApp(firebaseConfig);

export default app;