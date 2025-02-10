import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database'; // นำเข้า getDatabase จาก firebase/database
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: "------firebase config for consolo free---------",
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
const auth = getAuth(app);
const functions = getFunctions(app);
const database = getDatabase(app); // สร้างอินสแตนซ์ของ Database

// Function to lookup account information
const lookupAccount = async () => {
  const user = auth.currentUser;
  if (user) {
    const idToken = await user.getIdToken();
    try {
      const response = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${firebaseConfig.apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            idToken: idToken,
          }),
        }
      );
      if (!response.ok) {
        throw new Error("Network response was not ok" + response.statusText);
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

// Call the function to lookup account information
lookupAccount();

export { app, auth, database, functions }; // ส่งออก database ด้วย
