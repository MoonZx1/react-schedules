import React, { useEffect, useState } from "react";
import app from "../firebaseConfig";
import { getDatabase, ref, update, onValue } from "firebase/database";
import { AiFillEdit, AiFillSave } from "react-icons/ai"; // ใช้ React Icons สำหรับปุ่ม
import "../styles/Home.css";

const Home: React.FC = () => {
  const LOCAL_STORAGE_KEY = "scheduleData";

  // ฟังก์ชันเพื่อดึงข้อมูลจาก localStorage หรือใช้ค่าเริ่มต้น
  const getInitialSchedule = (): any[][] => {
    const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        if (Array.isArray(parsedData) && parsedData.length === 5) {
          return parsedData;
        }
      } catch (error) {
        console.error("Error parsing saved schedule data:", error);
      }
    }
    return [
      [{ code: "", subject: "", instructor: "", tasks: [] }],
      [{}, {}, {}, {}],
      [{}, {}, {}, {}],
      [{}, {}, {}, {}],
      [{}, {}, {}, {}],
    ];
  };

  const [schedule, setSchedule] = useState<any[][]>(getInitialSchedule);
  const [isEditingAllowed, setEditingAllowed] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{ dayIndex: number; timeIndex: number } | null>(null);
  const [newTask, setNewTask] = useState({ description: "", deadline: "" });

  const database = getDatabase(app);

  // ดึงข้อมูลจาก Firebase
  useEffect(() => {
    const scheduleRef = ref(database, "schedules");
    onValue(scheduleRef, (snapshot) => {
      const data = snapshot.val();
      if (data && Array.isArray(data) && data.length === 5) {
        setSchedule(data);
      } else {
        setSchedule(getInitialSchedule());
      }
    });
  }, []);

  // บันทึกข้อมูลทั้งหมดลง Firebase
  const saveDataToFirebase = async () => {
    try {
      const scheduleRef = ref(database, "schedules");
      await update(scheduleRef, { ...schedule });
      alert("บันทึกข้อมูลลง Firebase เรียบร้อยแล้ว!");
      setEditingAllowed(false);
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการบันทึกข้อมูล:", error);
      alert("ไม่สามารถบันทึกข้อมูลได้");
    }
  };

  // เพิ่มงานใหม่
  const addTaskToCell = () => {
    if (!selectedCell || !newTask.description || !newTask.deadline) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    const { dayIndex, timeIndex } = selectedCell;
    const updatedSchedule = [...schedule];

    if (!updatedSchedule[dayIndex][timeIndex].tasks) {
      updatedSchedule[dayIndex][timeIndex].tasks = [];
    }

    updatedSchedule[dayIndex][timeIndex].tasks.push({ ...newTask, status: "pending" });
    setSchedule(updatedSchedule);
    setNewTask({ description: "", deadline: "" });
    alert("เพิ่มงานสำเร็จ!");
  };

  // อัปเดตข้อมูลเซลล์
  const handleCellChange = (dayIndex: number, timeIndex: number, key: string, value: string) => {
    const updatedSchedule = [...schedule];
    if (!updatedSchedule[dayIndex][timeIndex]) {
      updatedSchedule[dayIndex][timeIndex] = { code: "", subject: "", instructor: "" };
    }
    updatedSchedule[dayIndex][timeIndex][key] = value;
    setSchedule(updatedSchedule);
  };

  // ลบงานจากเซลล์
  const removeTask = (taskIndex: number) => {
    if (!selectedCell) return;
    const { dayIndex, timeIndex } = selectedCell;
    const updatedSchedule = [...schedule];
    updatedSchedule[dayIndex][timeIndex].tasks = updatedSchedule[dayIndex][timeIndex].tasks.filter(
      (_, index) => index !== taskIndex
    );
    setSchedule(updatedSchedule);
  };

  // คำนวณเวลาและการแสดงผลถอยหลัง
  const getTimeLeft = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const timeDiff = deadlineDate.getTime() - now.getTime();
    if (timeDiff <= 0) return null; // ถ้าเวลาเลยกำหนดแล้ว
    const hoursLeft = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutesLeft = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    return { hoursLeft, minutesLeft };
  };

  const dayNames = ["จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์"];
  const dayColors = ["#FFEDD5", "#D1E8E2", "#E8D6FF", "#FFF4E6", "#D9E9FF"];

  // เก็บข้อมูลลงใน localStorage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(schedule));
  }, [schedule]);

  return (
    <div className="flex flex-col items-center p-4 sm:p-5 h-screen bg-gray-50">
      <h1 className="text-2xl sm:text-3xl font-semibold mb-6 text-center">📅 ตารางเรียนและงาน</h1>

      <div className="w-full max-w-7xl rounded-lg shadow-lg p-4 bg-white border border-gray-300">
        <table className="w-full table-auto border-collapse border border-gray-400">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 border border-gray-300">วัน</th>
              <th className="p-2 border border-gray-300">08:00 - 10:00</th>
              <th className="p-2 border border-gray-300">10:00 - 12:00</th>
              <th className="p-2 border border-gray-300">13:00 - 15:00</th>
              <th className="p-2 border border-gray-300">15:00 - 17:00</th>
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
                {schedule[dayIndex].map((cell, timeIndex) => (
                  <td key={timeIndex} className="p-2 border border-gray-300">
                    <input
                      type="text"
                      placeholder="รหัสวิชา"
                      value={cell?.code || ""}
                      onChange={(e) =>
                        handleCellChange(dayIndex, timeIndex, "code", e.target.value)
                      }
                      disabled={!isEditingAllowed}
                      className={`w-full border ${
                        isEditingAllowed ? "border-blue-500" : "border-gray-300"
                      } p-2 rounded mb-1`}
                    />
                    <input
                      type="text"
                      placeholder="ชื่อวิชา"
                      value={cell?.subject || ""}
                      onChange={(e) =>
                        handleCellChange(dayIndex, timeIndex, "subject", e.target.value)
                      }
                      disabled={!isEditingAllowed}
                      className={`w-full border ${
                        isEditingAllowed ? "border-blue-500" : "border-gray-300"
                      } p-2 rounded mb-1`}
                    />
                    <button
                      onClick={() => setSelectedCell({ dayIndex, timeIndex })}
                      className="mt-2 bg-yellow-500 text-white p-1 rounded"
                    >
                      งาน ({cell?.tasks?.length || 0})
                    </button>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ฟอร์มเพิ่มงาน */}
      {selectedCell && (
        <div className="w-full max-w-4xl mt-6 p-4 bg-white shadow-lg rounded-lg">
          <h2 className="text-xl font-semibold mb-4">
            เพิ่มงานใน: {schedule[selectedCell.dayIndex][selectedCell.timeIndex]?.subject || ""}
          </h2>
          <input
            type="text"
            placeholder="รายละเอียดงาน"
            value={newTask.description}
            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
            className="w-full border p-2 mb-4 rounded"
          />
          <input
            type="date"
            value={newTask.deadline}
            onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
            className="w-full border p-2 mb-4 rounded"
          />
          <button
            onClick={addTaskToCell}
            className="bg-green-500 text-white p-2 rounded shadow w-full"
          >
            บันทึกงาน
          </button>
        </div>
      )}

      {/* แสดงงานที่ต้องทำ */}
      {selectedCell && (
        <div className="mt-4">
          <h3 className="font-semibold">งานที่ต้องทำ</h3>
          <ul className="list-disc pl-5">
            {schedule[selectedCell.dayIndex][selectedCell.timeIndex]?.tasks?.map(
              (task, taskIndex) => {
                const { hoursLeft, minutesLeft } = getTimeLeft(task.deadline) || {};
                return (
                  <li key={taskIndex}>
                    {task.description} - {task.deadline}{" "}
                    {hoursLeft != null && (
                      <span className="text-gray-500">
                        (เหลือ {hoursLeft} ชั่วโมง {minutesLeft} นาที)
                      </span>
                    )}
                    <button
                      onClick={() => removeTask(taskIndex)}
                      className="text-red-500 hover:underline"
                    >
                      ลบ
                    </button>
                  </li>
                );
              }
            )}
          </ul>
        </div>
      )}

      <div className="flex justify-between w-full max-w-7xl mt-4">
        <button
          className={`p-3 rounded-lg shadow-md flex items-center space-x-2 ${
            isEditingAllowed
              ? "bg-gray-600 text-white hover:bg-gray-500"
              : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
          onClick={() => setEditingAllowed(!isEditingAllowed)}
        >
          {isEditingAllowed ? <AiFillSave size={20} /> : <AiFillEdit size={20} />}
          <span>{isEditingAllowed ? "บันทึก" : "แก้ไข"}</span>
        </button>
        {isEditingAllowed && (
          <button
            className="p-3 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600"
            onClick={saveDataToFirebase}
          >
            💾 บันทึกลง Firebase
          </button>
        )}
      </div>
    </div>
  );
};

export default Home;
