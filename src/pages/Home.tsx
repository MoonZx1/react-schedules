import { User, getAuth, onAuthStateChanged, signOut } from 'firebase/auth'; // ใช้สำหรับ Logout
import {
  get,
  getDatabase,
  onValue,
  push,
  ref,
  remove,
  set,
  update,
} from 'firebase/database';
import React, { useEffect, useState } from 'react';
import { AiFillEdit, AiFillSave } from 'react-icons/ai';

import { MdCancel, MdDelete } from 'react-icons/md';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Import CSS สำหรับ Toast
import { app } from '../firebaseConfig';
import '../styles/Home.css';

const Home: React.FC = () => {
  const LOCAL_STORAGE_KEY = 'scheduleData';
  const [isAdmin, setIsAdmin] = useState(false); // เพิ่ม State สำหรับตรวจสอบว่าเป็น Admin หรือไม่
  const [email, setEmail] = useState(''); // เพิ่ม State สำหรับอีเมลผู้ใช้
  const [username, setUsername] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const [deadlineTasks, setDeadlineTasks] = useState<
    { description: string; deadline: string; subject: string }[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLogoutLoading, setIsLogoutLoading] = useState(false); // สถานะการออกจากระบบ

  const getInitialSchedule = (): any[][] => {
    const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        if (Array.isArray(parsedData) && parsedData.length === 5) {
          return parsedData.map((day: any[]) =>
            Array(4)
              .fill(null)
              .map((_, i) => ({
                code: day[i]?.code || '',
                subject: day[i]?.subject || '',
                instructor: day[i]?.instructor || '',
                tasks: day[i]?.tasks || [],
              }))
          );
        }
      } catch (error) {
        console.error('Error parsing saved schedule data:', error);
      }
    }
    return Array(5)
      .fill(null)
      .map(() =>
        Array(4).fill({ code: '', subject: '', instructor: '', tasks: [] })
      );
  };

  const [schedule, setSchedule] = useState<any[][]>(getInitialSchedule);
  const [originalSchedule, setOriginalSchedule] = useState<any[][]>([]);
  const [isEditingAllowed, setEditingAllowed] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{
    dayIndex: number;
    timeIndex: number;
  } | null>(null);
  const [newTask, setNewTask] = useState({
    description: '',
    deadline: '',
    deadlineDate: '',
    deadlineHour: '',
    deadlineMinute: '',
  });
  const [remainingTimes, setRemainingTimes] = useState<{
    [key: string]: string;
  }>({});
  const database = getDatabase(app);

  const fetchUserData = async (user: User) => {
    if (user) {
      try {
        setIsLoading(true); // เริ่มโหลด
        console.log('Fetching user data for UID:', user.uid);

        const userRef = ref(database, `users/${user.uid}`);
        const userSnapshot = await get(userRef);

        // ตรวจสอบว่า userSnapshot มีข้อมูลหรือไม่
        if (userSnapshot.exists()) {
          const userData = userSnapshot.val();
          console.log('User data:', userData);

          // ตรวจสอบสถานะ admin
          const adminRef = ref(database, `admins/${user.uid}`);
          const adminSnapshot = await get(adminRef);

          const isAdmin = adminSnapshot.exists();

          // อัปเดต state ทั้งหมดในครั้งเดียว
          setUsername(userData.username);
          setEmail(userData.email);
          setIsAdmin(isAdmin);
          sessionStorage.setItem('isAdmin', isAdmin ? 'true' : 'false');
        } else {
          // เมื่อไม่มีข้อมูลผู้ใช้ใน Firebase
          console.log('ไม่พบข้อมูลผู้ใช้');
          alert('ไม่พบข้อมูลผู้ใช้ในระบบ');
          setIsAdmin(false);
          sessionStorage.removeItem('isAdmin');
        }
      } catch (error) {
        // จับข้อผิดพลาดในการดึงข้อมูลจาก Firebase
        console.error('Error fetching user data:', error);
        alert('ไม่สามารถดึงข้อมูลผู้ใช้จาก Firebase ได้ โปรดลองใหม่อีกครั้ง');
        setIsAdmin(false);
        sessionStorage.removeItem('isAdmin');
      } finally {
        setIsLoading(false); // การโหลดเสร็จสิ้น
      }
    } else {
      setUsername('');
      setEmail('');
      setIsAdmin(false);
      sessionStorage.removeItem('isAdmin');
    }
  };

  useEffect(() => {
    const auth = getAuth(app);
    let currentUid: string | null = null;

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        currentUid = user.uid;
        console.log('User logged in with UID:', currentUid);
        fetchUserData(user);
      } else {
        console.log('User logged out');
        currentUid = null;
        setUsername('');
        setEmail('');
        setIsAdmin(false);
      }
    });

    return () => {
      unsubscribe();
      currentUid = null;
    };
  }, []);

  useEffect(() => {
    const auth = getAuth(app);
    const database = getDatabase(app);
    const fetchUserData = async (user: User) => {
      if (user) {
        try {
          setIsLoading(true); // เริ่มโหลด
          console.log('Fetching user data for UID:', user.uid);

          const userRef = ref(database, `users/${user.uid}`);
          const userSnapshot = await get(userRef);

          console.log('User snapshot exists?', userSnapshot.exists());

          if (userSnapshot.exists()) {
            const userData = userSnapshot.val();
            console.log('User data:', userData);

            // ตั้งค่า username และ email
            setUsername(userData.username);
            setEmail(userData.email);

            // ตรวจสอบสถานะ admin
            console.log('Checking admin status for UID:', user.uid);
            const adminRef = ref(database, `admins/${user.uid}`);
            const adminSnapshot = await get(adminRef);

            console.log('Admin snapshot exists?', adminSnapshot.exists());

            // ตั้งค่า isAdmin เฉพาะเมื่อ UID ตรงกัน
            if (adminSnapshot.exists()) {
              setIsAdmin(true);
              sessionStorage.setItem('isAdmin', 'true');
            } else {
              setIsAdmin(false);
              sessionStorage.removeItem('isAdmin');
            }
          } else {
            console.log('User data not found in database');
            setIsAdmin(false);
            sessionStorage.removeItem('isAdmin');
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setIsAdmin(false);
          sessionStorage.removeItem('isAdmin');
        } finally {
          setIsLoading(false); // การโหลดเสร็จสิ้น
        }
      } else {
        // หากไม่มีผู้ใช้ล็อกอิน รีเซ็ต state ทั้งหมด
        setUsername('');
        setEmail('');
        setIsAdmin(false);
        sessionStorage.removeItem('isAdmin');
      }
    };
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('AuthStateChanged triggered. User:', user);
      if (user) {
        fetchUserData(user);
      } else {
        console.log('User logged out');
        setUsername('');
        setEmail('');
        setIsAdmin(false);
        setEditingAllowed(false); // เพิ่มบรรทัดนี้
        setSelectedCell(null); // เพิ่มบรรทัดนี้
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // เพิ่มฟังก์ชัน formatDeadline ไว้ด้านบนของไฟล์ หรือในตำแหน่งที่เหมาะสม
  const formatDeadline = (isoDate: string) => {
    const date = new Date(isoDate);

    // ใช้ toLocaleString แปลงวันที่
    const formattedDate = date.toLocaleString('th-TH', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    // เพิ่ม "น." หลังเวลาที่แสดง
    return `${formattedDate} น.`;
  };

  useEffect(() => {
    const scheduleRef = ref(database, 'schedules');
    onValue(scheduleRef, (snapshot) => {
      const data = snapshot.val();
      if (data && Array.isArray(data) && data.length === 5) {
        setSchedule(data);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
      } else {
        setSchedule(getInitialSchedule());
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
    });
  }, []);

  const saveDataToFirebase = async () => {
    setIsLoading(true); // เริ่มโหลดข้อมูล
    try {
      const scheduleRef = ref(database, 'schedules');
      const scheduleObject = Object.fromEntries(
        schedule.map((day, index) => [index, day])
      );
      await update(scheduleRef, scheduleObject);
      alert('บันทึกข้อมูลลง Firebase เรียบร้อยแล้ว!');
      setEditingAllowed(false);
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล:', error);
      alert('ไม่สามารถบันทึกข้อมูลได้. โปรดลองอีกครั้ง');
    } finally {
      setIsLoading(false); // สิ้นสุดการโหลดข้อมูล
    }
  };

  const handleEditClick = () => {
    if (!isEditingAllowed) {
      setOriginalSchedule(JSON.parse(JSON.stringify(schedule)));
      setEditingAllowed(true);
    } else {
      saveDataToFirebase();
    }
  };

  const handleCancelEdit = () => {
    setSchedule(originalSchedule);
    setEditingAllowed(false);
  };

  const addTaskToCell = () => {
    // ตรวจสอบให้แน่ใจว่ากรอกข้อมูลครบถ้วน
    if (
      !newTask.description ||
      !newTask.deadlineDate ||
      !newTask.deadlineHour ||
      !newTask.deadlineMinute
    ) {
      toast.error('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    // สร้างวันที่รวมจากวันที่และเวลา
    const combinedDeadline = new Date(
      `${newTask.deadlineDate}T${newTask.deadlineHour}:${newTask.deadlineMinute}:00`
    );

    if (isNaN(combinedDeadline.getTime())) {
      toast.error('วันที่หรือเวลาไม่ถูกต้อง');
      return;
    }

    // คัดลอกข้อมูลตารางเรียน (schedule) ที่มีอยู่
    const updatedSchedule = [...schedule];

    // ตรวจสอบว่า selectedCell มีข้อมูลหรือไม่
    if (selectedCell) {
      const { dayIndex, timeIndex } = selectedCell;
      // ดึงข้อมูล subject จากเซลล์ที่ถูกเลือก
      const selectedSubject =
        updatedSchedule[dayIndex][timeIndex].subject || 'ไม่ระบุ'; // ใช้ชื่อวิชาที่เซลล์มีอยู่ หรือ 'ไม่ระบุ' ถ้าไม่มี

      updatedSchedule[dayIndex][timeIndex].tasks.push({
        description: newTask.description,
        deadline: combinedDeadline.toISOString(),
        subject: selectedSubject, // ใช้ชื่อวิชาจากเซลล์ที่เลือก
        status: 'pending',
      });
    }

    setSchedule(updatedSchedule); // อัปเดต schedule ใหม่

    const scheduleRef = ref(database, 'schedules');

    // แปลง updatedSchedule เป็น object สำหรับ Firebase
    const scheduleObject = Object.fromEntries(
      updatedSchedule.map((day, index) => [index, day])
    );

    // ใช้ update กับ object ที่ถูกแปลงแล้ว
    update(scheduleRef, scheduleObject)
      .then(() => {
        // แสดง toast แจ้งเตือนการเพิ่มงาน
        toast.success(
          `เพิ่มงานในวิชา: ${selectedCell ? updatedSchedule[selectedCell.dayIndex][selectedCell.timeIndex].subject || 'ไม่ระบุ' : 'ไม่ระบุ'} สำเร็จ!` +
            `\nรายละเอียด: ${newTask.description || 'ไม่มีรายละเอียด'}` +
            `\nครบกำหนดเวลา: ${newTask.deadlineDate} เวลา: ${newTask.deadlineHour}:${newTask.deadlineMinute}`
        );
      })
      .catch((error) => {
        console.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล:', error);
        toast.error('ไม่สามารถบันทึกงานลง Firebase ได้');
      });
  };

  // ฟังก์ชันการเลื่อนหน้าจอไปยังฟอร์มกรอกข้อมูล

  const handleCellChange = (
    dayIndex: number,
    timeIndex: number,
    key: string,
    value: string
  ) => {
    const updatedSchedule = schedule.map((day, dIndex) =>
      day.map((cell, tIndex) => {
        if (dIndex === dayIndex && tIndex === timeIndex) {
          return { ...cell, [key]: value };
        }
        return cell;
      })
    );
    setSchedule(updatedSchedule);
  };

  const removeTask = async (
    dayIndex: number,
    timeIndex: number,
    taskIndex: number
  ) => {
    const updatedSchedule = schedule.map((day, dIndex) =>
      day.map((cell, tIndex) => {
        if (dIndex === dayIndex && tIndex === timeIndex) {
          const updatedTasks = cell.tasks.filter(
            (_: any, tIndex: number) => tIndex !== taskIndex
          );
          return { ...cell, tasks: updatedTasks };
        }
        return cell;
      })
    );

    setSchedule(updatedSchedule);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedSchedule));

    const scheduleRef = ref(database, 'schedules');
    try {
      // เปลี่ยนจาก update เป็น set
      await set(scheduleRef, updatedSchedule);;
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการลบงาน:', error);
      alert('ไม่สามารถลบงานจาก Firebase ได้');
    }
  };

  // ดึงข้อมูลงานหมดเวลาจาก Firebase
  useEffect(() => {
    const expiredTasksRef = ref(database, 'expiredTasks');
    const unsubscribe = onValue(expiredTasksRef, (snapshot) => {
      const data = snapshot.val();

      // ตรวจสอบว่า data ไม่เป็น null หรือ undefined ก่อน
      if (data) {
        // แปลงประเภทของ data ให้เป็นอาเรย์ของอ็อบเจ็กต์ที่มี description, deadline, subject
        const updatedExpiredTasks = Object.values(data) as {
          description: string;
          deadline: string;
          subject: string;
        }[];

        // อัปเดต state ด้วยข้อมูลที่ถูกต้อง
        setDeadlineTasks(updatedExpiredTasks);
      }
    });

    return () => unsubscribe(); // ปิดการ subscribe เมื่อ component ถูก unmount
  }, []);

  useEffect(() => {
    const fetchRemainingTimes = async () => {
      const now = new Date().getTime();
      const updatedTimes: { [key: string]: string } = {};
      const expiredTasks: {
        description: string;
        deadline: string;
        subject: string;
      }[] = [];

      const updatedSchedule = [...schedule];

      schedule.forEach((day, dayIndex) => {
        day.forEach((cell, timeIndex) => {
          const remainingTasks: {
            description: string;
            deadline: string;
            subject: string;
          }[] = [];

          cell.tasks?.forEach((task: any, taskIndex: number) => {
            const taskKey = `${dayIndex}-${timeIndex}-${taskIndex}`;
            const deadlineTimestamp = new Date(task.deadline).getTime();
            const timeLeft = deadlineTimestamp - now;

            if (timeLeft > 0) {
              const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
              const hours = Math.floor(
                (timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
              );
              const minutes = Math.floor(
                (timeLeft % (1000 * 60 * 60)) / (1000 * 60)
              );
              const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

              updatedTimes[taskKey] =
                `${days} วัน ${hours} ชั่วโมง ${minutes} นาที ${seconds} วินาที`;
              remainingTasks.push(task);
            } else {
              updatedTimes[taskKey] = 'หมดเวลาแล้ว';
              expiredTasks.push({
                description: task.description,
                deadline: task.deadline,
                subject: cell.subject || 'ไม่ระบุ', // เพิ่ม subject ที่นี่
              });
            }
          });

          updatedSchedule[dayIndex][timeIndex].tasks = remainingTasks;
        });
      });

      setRemainingTimes(updatedTimes);

      // ✅ อัปเดต expiredTasks ใน Firebase
      const expiredTasksRef = ref(database, 'expiredTasks');
      try {
        const snapshot = await get(expiredTasksRef);
        const existingTasks: {
          description: string;
          deadline: string;
          subject: string;
        }[] = snapshot.val() ? Object.values(snapshot.val()) : [];

        // หาตัวใหม่ที่ยังไม่มีใน Firebase
        const newTasks = expiredTasks.filter(
          (task) =>
            !existingTasks.some(
              (existingTask) =>
                existingTask.description === task.description &&
                existingTask.deadline === task.deadline &&
                existingTask.subject === task.subject
            )
        );

        if (newTasks.length > 0) {
          newTasks.forEach((task) => {
            const newTaskRef = push(expiredTasksRef);
            set(newTaskRef, task);
          });
        }

        // ✅ ตั้งค่า expiredTasks ใน state ให้แสดงผล
        setDeadlineTasks([...existingTasks, ...newTasks]); // ใช้ตัวแปรนี้ตรงนี้
      } catch (error) {
        console.error('🚨 Error updating expired tasks:', error);
      }
    };

    fetchRemainingTimes();
    const interval = setInterval(fetchRemainingTimes, 1000);

    return () => clearInterval(interval);
  }, [schedule]);

  const dayNames = ['จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์'];
  const dayColors = ['#FFEDD5', '#D1E8E2', '#E8D6FF', '#FFF4E6', '#D9E9FF'];

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(schedule));
  }, [schedule]);

  const handleLogout = async () => {
    setIsLogoutLoading(true); // กำหนดสถานะว่า กำลังออกจากระบบ
    try {
      await signOut(getAuth());
      //alert('ออกจากระบบสำเร็จ!');
      window.location.href = '/'; // หลังจากออกจากระบบไปหน้าแรก
      sessionStorage.removeItem('isAdmin'); // ลบข้อมูลที่เก็บใน sessionStorage
    } catch (error) {
      console.error('Error during logout:', error);
      alert('ไม่สามารถออกจากระบบได้! กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsLogoutLoading(false); // หยุดสถานะกำลังออกจากระบบเมื่อการทำงานเสร็จสิ้น
    }
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const getInitials = (name: string): string => {
    return name.charAt(0).toUpperCase();
  };

  useEffect(() => {
    const auth = getAuth(app);

    const fetchUserData = async (user: User) => {
      try {
        const userRef = ref(database, `users/${user.uid}`);
        const userSnapshot = await get(userRef);
        if (userSnapshot.exists()) {
          const userData = userSnapshot.val();
          setUsername(userData.username);
          setEmail(userData.email);
        } else {
          alert('ไม่พบข้อมูลผู้ใช้ในฐานข้อมูล');
        }
      } catch (error) {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้:', error);
        alert('ไม่สามารถดึงข้อมูลผู้ใช้ได้. โปรดลองอีกครั้ง');
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchUserData(user);
      } else {
        setUsername('');
        setEmail('');
      }
    });

    return () => unsubscribe();
  }, []);

  const clearSubjectsAndCodes = async () => {
    const clearedSchedule = schedule.map((day) =>
      day.map((cell) => ({
        ...cell,
        code: '',
        subject: '',
      }))
    );
    setSchedule(clearedSchedule);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(clearedSchedule));

    // บันทึกการเปลี่ยนแปลงลง Firebase
    const scheduleRef = ref(database, 'schedules');
    try {
      await update(
        scheduleRef,
        Object.fromEntries(clearedSchedule.map((day, index) => [index, day]))
      );
      alert('ล้างข้อมูลวิชาและรหัสวิชาเรียบร้อยแล้ว!');
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการลบข้อมูล:', error);
      alert('ไม่สามารถลบข้อมูลใน Firebase ได้');
    }
  };

  // ฟังก์ชันลบงานหมดเวลาจาก "⏳ งานหมดเวลา"
  const removeExpiredTask = async (taskIndex: number) => {
    const auth = getAuth();
    const user = auth.currentUser;
    const expiredTasksRef = ref(database, 'expiredTasks');

    if (!user) {
      console.log('🚨 ผู้ใช้ยังไม่ได้ล็อกอิน');
      return;
    }

    // เช็คสิทธิ์ของ User
    const adminRef = ref(database, `admins/${user.uid}`);
    const adminSnapshot = await get(adminRef);
    const isAdmin = adminSnapshot.exists();

    if (!isAdmin) {
      console.log('🚨 ผู้ใช้ไม่มีสิทธิ์ลบ expiredTasks');
      alert('คุณไม่มีสิทธิ์ลบงานหมดเวลา');
      return;
    }

    try {
      const snapshot = await get(expiredTasksRef);
      const data = snapshot.val();

      if (data) {
        const taskKeyToDelete = Object.keys(data)[taskIndex]; // หาคีย์ของงานที่ต้องการลบ

        // ลบงานจาก Firebase
        await remove(ref(database, `expiredTasks/${taskKeyToDelete}`));

        console.log('🗑 ลบงานหมดเวลา index:', taskIndex);

        // รีเฟรชข้อมูลหลังจากลบงานหมดเวลา
        fetchExpiredTasks(); // ดึงข้อมูลใหม่จาก Firebase
      }
    } catch (error) {
      console.error('🚨 ลบงานหมดเวลาไม่สำเร็จ:', error);
    }
  };

  // ฟังก์ชันดึงข้อมูลงานหมดเวลาจาก Firebase
  const fetchExpiredTasks = async () => {
    const expiredTasksRef = ref(database, 'expiredTasks');
    try {
      const snapshot = await get(expiredTasksRef);
      const data = snapshot.val();

      if (data) {
        const updatedExpiredTasks: {
          description: string;
          deadline: string;
          subject: string;
        }[] = Object.values(data).map((task: any) => ({
          description: task.description,
          deadline: task.deadline,
          subject: task.subject,
        }));

        // อัปเดต state ด้วยข้อมูลใหม่จาก Firebase
        setDeadlineTasks(updatedExpiredTasks);
      }
    } catch (error) {
      console.error('🚨 การดึงข้อมูลงานหมดเวลาไม่สำเร็จ:', error);
    }
  };

  return (
    <div className="relative flex flex-col items-center p-4 sm:p-6 h-screen bg-gray-50">
      <ToastContainer />
      {/* ถ้ากำลังออกจากระบบ แสดงข้อความกำลังออกจากระบบ */}
      {isLogoutLoading && (
        <div className="absolute top-0 left-0 right-0 flex justify-center items-center p-6 z-50">
          <div className="bg-white text-gray-800 text-lg font-semibold p-4 rounded-lg shadow-lg opacity-90">
            กำลังออกจากระบบ...
          </div>
        </div>
      )}

      {/* ปุ่ม 3 ขีด (Hamburger Menu) */}
      <button
        onClick={toggleMenu}
        className="absolute top-4 left-4 text-gray-700 focus:outline-none"
      >
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 6h16M4 12h16M4 18h16"
          ></path>
        </svg>
      </button>

      {/* ตัวอักษรแรกของชื่อ */}
      <div className="absolute top-4 right-4 w-12 h-12 rounded-full flex items-center justify-center bg-gray-300 text-white text-lg font-semibold">
        {getInitials(username)}
      </div>

      {/* เมนูย่อย */}
      {menuOpen && (
        <div className="absolute top-16 left-4 bg-white shadow-lg rounded-lg py-2 z-10">
          <button
            onClick={handleLogout}
            className="block px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-left"
          >
            Logout
          </button>
        </div>
      )}

      <h5 className="text-2xl font-semibold p-4">
        ยินดีต้อนรับ {username || email}
      </h5>

      <div className="flex flex-col items-center p-4 sm:p-6 h-screen bg-gray-50">
        {/* ถ้า isLoading เป็น true จะแสดงข้อความกำลังโหลด */}
        {isLoading ? (
          <p>กำลังโหลด...</p> // ข้อความนี้จะแสดงเมื่อมีการโหลด
        ) : (
          <>
            <h1 className="text-lg sm:text-2xl font-semibold mb-4 text-center">
              📅 ตารางเรียนและงาน
            </h1>
            {/* ส่วนแสดงผลบนโทรศัพท์มือถือ */}
            <div className="sm:hidden w-full max-w-full rounded-lg shadow-lg p-4 bg-white border border-gray-300">
              {dayNames.map((day, dayIndex) => (
                <div
                  key={dayIndex}
                  className="p-4 mb-4 rounded-lg"
                  style={{ backgroundColor: dayColors[dayIndex] }}
                >
                  <h3 className="font-semibold text-lg mb-2">{day}</h3>
                  {schedule[dayIndex]?.map((cell, timeIndex) => (
                    <div
                      key={timeIndex}
                      className="mb-4 p-4 border border-gray-200 rounded-lg"
                    >
                      <div className="flex flex-col mb-2">
                        <div className="font-bold">รหัสวิชา</div>
                        <input
                          type="text"
                          value={cell?.code || ''}
                          onChange={(e) =>
                            handleCellChange(
                              dayIndex,
                              timeIndex,
                              'code',
                              e.target.value
                            )
                          }
                          placeholder="รหัสวิชา"
                          disabled={!isEditingAllowed || !isAdmin}
                          className="w-full border p-2 rounded text-xs sm:text-sm"
                        />
                      </div>
                      <div className="flex flex-col mb-2">
                        <div className="font-bold">ชื่อวิชา</div>
                        <input
                          type="text"
                          value={cell?.subject || ''} // ชื่อวิชา
                          onChange={(e) =>
                            handleCellChange(
                              dayIndex,
                              timeIndex,
                              'subject',
                              e.target.value
                            )
                          }
                          placeholder="ชื่อวิชา"
                          disabled={!isEditingAllowed || !isAdmin}
                          className="w-full border p-2 rounded text-xs sm:text-sm"
                        />
                      </div>
                      <button
                        onClick={() =>
                          isAdmin && setSelectedCell({ dayIndex, timeIndex })
                        }
                        disabled={!isAdmin}
                        className="w-full bg-yellow-500 text-white p-3 rounded text-xs sm:text-sm"
                      >
                        เพิ่มงาน ({cell.tasks?.length || 0})
                      </button>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* ส่วนแสดงผลบน iPad และ Desktop */}
            <div className="hidden sm:block w-full max-w-7xl rounded-lg shadow-lg p-4 bg-white border border-gray-300">
              <table className="w-full table-auto sm:table-fixed border-collapse border border-gray-400 text-sm sm:text-base">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="p-2 border border-gray-300">วัน</th>
                    <th className="p-2 border border-gray-300">
                      08:00 - 10:00
                    </th>
                    <th className="p-2 border border-gray-300">
                      10:00 - 12:00
                    </th>
                    <th className="p-2 border border-gray-300">
                      13:00 - 15:00
                    </th>
                    <th className="p-2 border border-gray-300">
                      15:00 - 17:00
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {dayNames.map((day, dayIndex) => (
                    <tr
                      key={dayIndex}
                      className="text-center"
                      style={{ backgroundColor: dayColors[dayIndex] }}
                    >
                      <td className="p-2 border border-gray-300">{day}</td>
                      {schedule[dayIndex]?.map((cell, timeIndex) => (
                        <td
                          key={timeIndex}
                          className="p-2 border border-gray-300"
                          data-label={`ช่วงเวลา ${timeIndex + 1}`}
                        >
                          <input
                            type="text"
                            placeholder="รหัสวิชา"
                            value={cell?.code || ''}
                            onChange={(e) =>
                              handleCellChange(
                                dayIndex,
                                timeIndex,
                                'code',
                                e.target.value
                              )
                            }
                            disabled={!isEditingAllowed || !isAdmin} // ให้กรอกได้เฉพาะ Admin และเปิดโหมดแก้ไข
                            className="w-full border p-2 rounded text-xs sm:text-sm mb-1"
                          />
                          <input
                            type="text"
                            placeholder="ชื่อวิชา"
                            value={cell?.subject || ''}
                            onChange={(e) =>
                              handleCellChange(
                                dayIndex,
                                timeIndex,
                                'subject',
                                e.target.value
                              )
                            }
                            disabled={!isEditingAllowed || !isAdmin} // ให้กรอกได้เฉพาะ Admin และเปิดโหมดแก้ไข
                            className="w-full border p-2 rounded text-xs sm:text-sm"
                          />
                          {/* ปุ่มเพิ่มงาน (แสดงสำหรับทุกคน แต่ disabled หากไม่ใช่ admin) */}
                          <button
                            onClick={() =>
                              isAdmin &&
                              setSelectedCell({ dayIndex, timeIndex })
                            }
                            disabled={!isAdmin}
                            className={`mt-2 bg-yellow-500 text-white p-1 rounded text-xs sm:text-sm ${
                              !isAdmin
                                ? 'opacity-50 cursor-not-allowed'
                                : 'hover:bg-yellow-600'
                            }`}
                          >
                            เพิ่มงาน ({cell.tasks?.length || 0})
                          </button>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {selectedCell && isAdmin && (
              <div className="w-full max-w-md mt-6 p-4 bg-white shadow-lg rounded-lg">
                <h2 className="text-lg font-semibold mb-4">
                  เพิ่มงานใน:{' '}
                  {schedule[selectedCell.dayIndex][selectedCell.timeIndex]
                    ?.subject || ''}
                </h2>

                {/* กรอกชื่อ/รายละเอียดงาน */}
                <input
                  type="text"
                  placeholder="รายละเอียดงาน"
                  value={newTask.description}
                  onChange={(e) =>
                    setNewTask({ ...newTask, description: e.target.value })
                  }
                  className="w-full border p-2 mb-4 rounded"
                />

                {/* เลือกวันที่ */}
                <input
                  type="date"
                  value={newTask.deadlineDate || ''}
                  onChange={(e) =>
                    setNewTask({ ...newTask, deadlineDate: e.target.value })
                  }
                  className="w-full border p-2 mb-4 rounded"
                />

                <select
                  className="w-1/2 border p-2 rounded"
                  value={newTask.deadlineHour || ''}
                  onChange={(e) =>
                    setNewTask({ ...newTask, deadlineHour: e.target.value })
                  }
                >
                  <option value="">เลือกชั่วโมง</option>
                  {Array.from({ length: 24 }, (_, i) =>
                    i.toString().padStart(2, '0')
                  ).map((hour) => (
                    <option key={hour} value={hour}>
                      {hour}
                    </option>
                  ))}
                </select>
                <select
                  className="w-1/2 border p-2 rounded"
                  value={newTask.deadlineMinute || ''}
                  onChange={(e) =>
                    setNewTask({ ...newTask, deadlineMinute: e.target.value })
                  }
                >
                  <option value="">เลือกนาที</option>
                  {Array.from({ length: 60 }, (_, i) =>
                    i.toString().padStart(2, '0')
                  ).map((minute) => (
                    <option key={minute} value={minute}>
                      {minute}
                    </option>
                  ))}
                </select>

                <button
                  onClick={addTaskToCell}
                  className="bg-green-500 text-white p-2 rounded shadow w-full"
                >
                  บันทึกงาน
                </button>
              </div>
            )}

            {/* แสดงงานทั้งหมด */}
            <div className="mt-6 w-full max-w-7xl">
              <h2 className="text-lg sm:text-2xl font-semibold mb-6 text-gray-700">
                📋 งานทั้งหมด
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {schedule.map((day, dayIndex) =>
                  day.flatMap((cell, timeIndex) =>
                    cell.tasks?.map(
                      (
                        task: {
                          description: string;
                          deadline: string;
                          subject?: string;
                        },
                        taskIndex: number
                      ) => {
                        const taskKey = `${dayIndex}-${timeIndex}-${taskIndex}`;
                        return (
                          <div
                            key={taskKey}
                            className="p-4 bg-white shadow-md rounded-lg border text-xs sm:text-sm relative"
                          >
                            <h3 className="font-semibold mb-1">
                              🎨 {task.description}
                            </h3>
                            <p className="text-gray-500 mb-1">
                              📚 วิชา: {task.subject || 'ไม่ระบุ'}
                            </p>
                            <p className="text-gray-500 mb-1">
                              ⏰ ครบกำหนด: {formatDeadline(task.deadline)}
                            </p>
                            <p
                              className={
                                remainingTimes[taskKey]?.includes('หมดเวลา')
                                  ? 'text-red-500 font-bold'
                                  : 'text-green-500 font-bold'
                              }
                            >
                              {remainingTimes[taskKey] || 'กำลังโหลด...'}
                            </p>
                            {isAdmin && (
                              <button
                                onClick={() =>
                                  removeTask(dayIndex, timeIndex, taskIndex)
                                }
                                className="absolute top-2 right-2 text-gray-400 hover:text-gray-500 z-10 w-8 h-8 rounded-full flex items-center justify-center"
                              >
                                <MdDelete size={24} />
                              </button>
                            )}
                          </div>
                        );
                      }
                    )
                  )
                )}
              </div>
            </div>

            {/* แสดงงานหมดเวลา */}
            <div className="mt-6 w-full max-w-7xl">
              <h2 className="text-lg sm:text-2xl font-semibold mb-6 text-gray-700">
                ⏳ งานหมดเวลา
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {deadlineTasks.length === 0 ? (
                  <p className="text-gray-500">ยังไม่มีงานหมดเวลา</p>
                ) : (
                  deadlineTasks.map((task, taskIndex) => (
                    <div
                      key={taskIndex}
                      className="p-4 bg-gray-200 shadow-md rounded-lg border relative"
                    >
                      <h3 className="font-bold text-xl mb-2">
                        🎨 {task.description}
                      </h3>
                      <p className="text-sm text-gray-500 mb-2">
                        📚 วิชา: {task.subject || 'ไม่ระบุ'}
                      </p>
                      <p className="text-sm text-gray-500 mb-4">
                        ⏰ ครบกำหนด: {formatDeadline(task.deadline)}
                      </p>

                      {isAdmin && (
                        <button
                          onClick={() => removeExpiredTask(taskIndex)} // เรียกใช้ฟังก์ชันลบงานหมดเวลา
                          className="absolute top-2 right-2 text-gray-400 hover:text-gray-500 z-10 w-8 h-8  rounded-full flex items-center justify-center"
                        >
                          <MdDelete size={24} />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="fixed bottom-6 right-6 flex flex-col items-end space-y-3 z-50">
              {isAdmin && (
                <>
                  {/* ปุ่มแก้ไขหรือบันทึก */}
                  <button
                    className={`flex items-center justify-center w-14 h-14 rounded-full shadow-md transition-all transform hover:scale-110 ${
                      isEditingAllowed
                        ? 'bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700'
                        : 'bg-gradient-to-r from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700'
                    } text-white`}
                    onClick={handleEditClick}
                  >
                    {isEditingAllowed ? (
                      <AiFillSave size={24} />
                    ) : (
                      <AiFillEdit size={24} />
                    )}
                  </button>

                  {/* ปุ่มยกเลิก */}
                  {isEditingAllowed && (
                    <button
                      className="flex items-center justify-center w-14 h-14 rounded-full shadow-md bg-gradient-to-r from-gray-400 to-gray-600 hover:from-gray-500 hover:to-gray-700 text-white transition-all transform hover:scale-110"
                      onClick={handleCancelEdit}
                    >
                      <MdCancel size={24} />
                    </button>
                  )}

                  {/* ปุ่มลบ */}
                  <button
                    className="flex items-center justify-center w-14 h-14 rounded-full shadow-md bg-gradient-to-r from-red-400 to-red-600 hover:from-red-500 hover:to-red-700 text-white transition-all transform hover:scale-110"
                    onClick={clearSubjectsAndCodes} // เรียกใช้ฟังก์ชัน clearSubjectsAndCodes ที่นี่
                  >
                    <MdDelete size={24} />
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
