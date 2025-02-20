import { getApp, getApps, initializeApp } from "firebase/app";
import { User, getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getFunctions } from "firebase/functions";

// Firebase config
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
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp(); // ถ้ามีแอปอยู่แล้วให้ใช้แอปนั้น

// สร้างอินสแตนซ์ของ Firebase Services
const auth = getAuth(app);
const functions = getFunctions(app);
const database = getDatabase(app);

// ฟังก์ชันดึงข้อมูลบัญชีผู้ใช้
const lookupAccount = async () => {
  const user: User | null = auth.currentUser;
  if (user) {
    try {
      const idToken = await user.getIdToken();
      const response = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${firebaseConfig.apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ idToken: idToken }),
        }
      );
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }
      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.error("Error looking up account:", error);
    }
  } else {
    console.log("No user is signed in.");
  }
};

// เรียกฟังก์ชัน lookupAccount
lookupAccount();

export { app, auth, database, functions }; // ส่งออกบริการที่ใช้

