import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { ref, set } from 'firebase/database'; // นำเข้า ref และ set จาก firebase/database
import React, { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { auth, database } from '../firebaseConfig'; // นำเข้า auth และ database

const Signup: React.FC = () => {
  const [form, setForm] = useState({
    name: '', // เพิ่มฟิลด์ name
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    upperCase: false,
    lowerCase: false,
    number: false,
    specialChar: false,
  });
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);
  const [showPasswordStrength, setShowPasswordStrength] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value,
    });

    if (name === 'password') {
      checkPasswordStrength(value);
      setShowPasswordStrength(true);
    }

    if (name === 'confirmPassword') {
      validateConfirmPassword(value, form.password);
    }
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const checkPasswordStrength = (password: string) => {
    const requirements = {
      length: password.length >= 8,
      upperCase: /[A-Z]/.test(password),
      lowerCase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      specialChar: /[@#$%^&*!+=\-]/.test(password),
    };

    setPasswordRequirements(requirements);

    const score =
      Object.values(requirements).filter((requirement) => requirement).length;

    setPasswordStrength(score);
  };

  const getPasswordStrengthLabel = (score: number) => {
    switch (score) {
      case 0:
      case 1:
        return 'แย่';
      case 2:
        return 'ปานกลาง';
      case 3:
        return 'ดี';
      case 4:
      case 5:
        return 'ดีมาก';
      default:
        return '';
    }
  };

  const getPasswordStrengthColor = (score: number) => {
    switch (score) {
      case 0:
      case 1:
        return 'bg-red-500';
      case 2:
        return 'bg-yellow-500';
      case 3:
        return 'bg-blue-500';
      case 4:
      case 5:
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const validateConfirmPassword = (confirmPassword: string, password: string) => {
    if (confirmPassword !== password) {
      setConfirmPasswordError('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน');
    } else {
      setConfirmPasswordError(null);
    }
  };

  const isFormValid = () => {
    const isEmailValid = validateEmail(form.email);
    const isPasswordValid = passwordStrength >= 4;
    const isConfirmPasswordValid = form.confirmPassword === form.password;
    const isNameValid = form.name.trim() !== ''; // ตรวจสอบว่าชื่อไม่เป็นค่าว่าง

    return isEmailValid && isPasswordValid && isConfirmPasswordValid && isNameValid;
  };

  const handleSignup = async () => {
    setError(null);

    if (!validateEmail(form.email)) {
      setError('กรุณาใช้อีเมลที่ถูกต้อง');
      return;
    }

    if (passwordStrength < 4) {
      setError('กรุณาใส่รหัสผ่านที่ปลอดภัยตามเงื่อนไขที่กำหนด');
      return;
    }

    if (confirmPasswordError) {
      setError('กรุณาตรวจสอบรหัสผ่านและยืนยันรหัสผ่านให้ตรงกัน');
      return;
    }

    if (form.name.trim() === '') {
      setError('กรุณาใส่ชื่อของคุณ');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );
      const user = userCredential.user;

      // บันทึกชื่อผู้ใช้ใน Firebase Realtime Database
      await set(ref(database, 'users/' + user.uid), {
        username: form.name,
        email: user.email,
      });

      await sendEmailVerification(user);
      alert('สมัครสมาชิกสำเร็จ! กรุณาตรวจสอบอีเมลเพื่อยืนยันบัญชีของคุณ');
      navigate('/verify-email');
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        setError('มีบัญชีที่ใช้อีเมลนี้อยู่แล้ว');
      } else {
        setError('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center mb-6">สมัครสมาชิก</h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <input
          type="text"
          name="name"
          placeholder="ชื่อ"
          className="w-full px-4 py-2 border rounded-md mb-4"
          value={form.name}
          onChange={handleInputChange}
        />
        <input
          type="email"
          name="email"
          placeholder="อีเมล"
          className="w-full px-4 py-2 border rounded-md mb-4"
          value={form.email}
          onChange={handleInputChange}
        />
        <div className="relative mb-4">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="รหัสผ่าน"
            className="w-full px-4 py-2 border rounded-md"
            value={form.password}
            onChange={handleInputChange}
            onFocus={() => { setShowPasswordRequirements(true); setShowPasswordStrength(true); }}
            onBlur={() => { setShowPasswordRequirements(false); setShowPasswordStrength(false); }}
          />
          <button
            type="button"
            className="absolute right-2 top-2 text-gray-600"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
          {showPasswordRequirements && (
            <div className="mt-2 text-sm text-gray-600">
              <p>เงื่อนไขรหัสผ่าน:</p>
              <ul className="list-disc list-inside">
                <li className={passwordRequirements.length ? 'text-green-500' : 'text-red-500'}>
                  อย่างน้อย 8 ตัวอักษร
                </li>
                <li className={passwordRequirements.upperCase ? 'text-green-500' : 'text-red-500'}>
                  มีตัวพิมพ์ใหญ่ (A-Z)
                </li>
                <li className={passwordRequirements.lowerCase ? 'text-green-500' : 'text-red-500'}>
                  มีตัวพิมพ์เล็ก (a-z)
                </li>
                <li className={passwordRequirements.number ? 'text-green-500' : 'text-red-500'}>
                  มีตัวเลข (0-9)
                </li>
                <li className={passwordRequirements.specialChar ? 'text-green-500' : 'text-red-500'}>
                  มีอักขระพิเศษ (@#$%^&*!+=)
                </li>
              </ul>
              {showPasswordStrength && (
                <>
                  <div className="mt-2 flex items-center space-x-1">
                    {[...Array(5)].map((_, index) => (
                      <div
                        key={index}
                        className={`w-1/5 h-1 rounded ${index < passwordStrength ? getPasswordStrengthColor(passwordStrength) : 'bg-gray-300'}`}
                      ></div>
                    ))}
                  </div>
                  <div className="mt-1 text-center">
                    <span className="text-sm text-gray-700">{getPasswordStrengthLabel(passwordStrength)}</span>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
        <div className="relative mb-4">
          <input
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            placeholder="ยืนยันรหัสผ่าน"
            className="w-full px-4 py-2 border rounded-md"
            value={form.confirmPassword}
            onChange={handleInputChange}
          />
          <button
            type="button"
            className="absolute right-2 top-2 text-gray-600"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>
        <button
          className={`w-full py-2 text-white rounded-md ${
            loading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'
          }`}
          onClick={handleSignup}
          disabled={loading || !isFormValid()}
        >
          {loading ? 'กำลังโหลด...' : 'สมัครสมาชิก'}
        </button>
        <p className="text-center mt-4">
          มีบัญชีแล้ว?{' '}
          <span
            className="text-blue-500 cursor-pointer hover:underline"
            onClick={() => navigate('/')}
          >
            เข้าสู่ระบบ
          </span>
        </p>
      </div>
    </div>
  );
};

export default Signup;