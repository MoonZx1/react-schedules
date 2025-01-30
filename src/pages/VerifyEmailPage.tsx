import { reload } from "firebase/auth";
import { motion } from 'framer-motion';
import React, { useEffect, useState } from "react";
import { FaEnvelope, FaSpinner } from 'react-icons/fa';
import { useNavigate } from "react-router-dom";
import { auth } from "../firebaseConfig";

const VerifyEmailPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkEmailVerification = async () => {
      try {
        const user = auth.currentUser;

        if (user) {
          await reload(user); // รีเฟรชข้อมูลผู้ใช้
          if (user.emailVerified) {
            navigate('/'); // นำทางไปยังหน้า Login
            return;
          }
        }
      } catch (err) {
        console.error("Error during verification check:", err);
        setError("เกิดข้อผิดพลาดในการตรวจสอบสถานะ กรุณาลองใหม่");
      } finally {
        setLoading(false);
      }
    };

    const intervalId = setInterval(() => {
      checkEmailVerification();
    }, 5000); // ตรวจสอบทุก 5 วินาที

    return () => clearInterval(intervalId);
  }, [navigate]);

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-r from-white to-gray-200">
      <motion.div 
        className="text-center p-8 bg-white rounded-lg shadow-lg" 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {loading ? (
          <div className="flex items-center justify-center space-x-2">
            <FaSpinner className="animate-spin text-blue-500" />
            <p className="text-blue-500">กำลังโหลด...</p>
          </div>
        ) : (
          <>
            <motion.div 
              className="flex justify-center mb-4"
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              transition={{ type: "spring", stiffness: 100 }}
            >
              <FaEnvelope className="text-6xl text-blue-500" />
            </motion.div>
            <motion.h1 
              className="text-3xl font-bold mb-4 text-gray-800"
              initial={{ x: -200 }}
              animate={{ x: 0 }}
              transition={{ type: "spring", stiffness: 100 }}
            >
              โปรดยืนยันอีเมลของคุณ
            </motion.h1>
            <motion.p 
              className="text-gray-600 mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
            >
              เราได้ส่งลิงก์ยืนยันไปยังอีเมลของคุณแล้ว กรุณาตรวจสอบและคลิกลิงก์ในอีเมล
            </motion.p>
            {error && <motion.p 
              className="text-red-500 mb-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              {error}
            </motion.p>}
            <motion.p 
              className="text-gray-600"
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              transition={{ type: "spring", stiffness: 100 }}
            >
              หลังยืนยันสำเร็จ ระบบจะนำคุณกลับไปยังหน้าเข้าสู่ระบบ
            </motion.p>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default VerifyEmailPage;