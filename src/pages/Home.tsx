import React, { useState, useEffect } from "react";
import "../styles/Home.css";

const Home: React.FC = () => {
  const LOCAL_STORAGE_KEY = "scheduleData";

  // ฟังก์ชันสำหรับดึงข้อมูลตารางเรียนจาก Local Storage
  const getInitialSchedule = (): any[][] => {
    const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedData) {
      return JSON.parse(savedData);
    }
    return [
      [{ code: "", subject: "", time: "", instructor: "" }, {}, {}, {}],
      [{}, {}, {}, {}],
      [{}, {}, {}, {}],
      [{}, {}, {}, {}],
      [{}, {}, {}, {}],
    ];
  };

  // สถานะของตารางเรียนและสถานะการแก้ไข
  const [schedule, setSchedule] = useState<any[][]>(getInitialSchedule);
  const [isEditingAllowed, setEditingAllowed] = useState(false);

  // ฟังก์ชันบันทึกข้อมูล
  const saveAllData = () => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(schedule));
    setEditingAllowed(false);
    alert("บันทึกข้อมูลเรียบร้อยแล้ว!");
  };

  // ฟังก์ชันเปิดโหมดแก้ไข
  const enableEditing = () => {
    setEditingAllowed(true);
  };

  // ฟังก์ชันเปลี่ยนแปลงข้อมูลในเซลล์
  const handleCellChange = (dayIndex: number, timeIndex: number, key: string, value: string) => {
    if (!isEditingAllowed) return;
    const updatedSchedule = [...schedule];
    if (!updatedSchedule[dayIndex][timeIndex]) {
      updatedSchedule[dayIndex][timeIndex] = { code: "", subject: "", time: "", instructor: "" };
    }
    updatedSchedule[dayIndex][timeIndex][key] = value;
    setSchedule(updatedSchedule);
  };

  // โหลดข้อมูลตารางเมื่อแอปเริ่มต้น
  useEffect(() => {
    const savedData = getInitialSchedule();
    setSchedule(savedData);
  }, []);

  return (
    <div className="p-5">
      <h1 className="text-3xl font-semibold mb-6 text-center text-blue-600">📅 ตารางเรียน</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-500 rounded-lg shadow-lg" style={{ borderSpacing: "10px" }}>
          <thead>
          <tr className="text-center bg-gray-100 align-middle">
          <th className="px-6 py-4 text-lg font-medium text-gray-600">วัน</th>
          <th className="px-6 py-4 text-lg font-medium text-gray-600"></th>
          <th className="px-6 py-4 text-lg font-medium text-gray-600">08:00 - 10:00</th>
          <th className="px-6 py-4 text-lg font-medium text-gray-600">08:00 - 10:00</th>
          <th className="px-6 py-4 text-lg font-medium text-gray-600"></th>
          </tr>

          </thead>
          <tbody>
            {["จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์"].map((day, dayIndex) => (
              <tr key={dayIndex} className="text-center">
                <td className="px-6 py-4 bg-gray-50">{day}</td>
                {schedule[dayIndex].map((cell, timeIndex) => (
                  <td key={timeIndex} className="relative px-6 py-4 border border-gray-200">
                    <div className="flex flex-col space-y-3">
                      {/* รหัสวิชา */}
                      <div className="flex items-center">
                        <span className="mr-2 text-blue-500">📘</span>
                        <input
                          type="text"
                          value={cell?.code || ""}
                          placeholder="รหัสวิชา"
                          disabled={!isEditingAllowed}
                          onChange={(e) => handleCellChange(dayIndex, timeIndex, "code", e.target.value)}
                          className={`w-full p-2 border ${isEditingAllowed ? "border-blue-400" : "border-gray-300"} rounded-md`}
                        />
                      </div>
                      {/* ชื่อวิชา */}
                      <div className="flex items-center">
                        <span className="mr-2 text-green-500">📚</span>
                        <input
                          type="text"
                          value={cell?.subject || ""}
                          placeholder="ชื่อวิชา"
                          disabled={!isEditingAllowed}
                          onChange={(e) => handleCellChange(dayIndex, timeIndex, "subject", e.target.value)}
                          className={`w-full p-2 border ${isEditingAllowed ? "border-blue-400" : "border-gray-300"} rounded-md`}
                        />
                      </div>
                      {/* เวลาเรียน */}
                      <div className="flex items-center">
                        <span className="mr-2 text-yellow-500">⏰</span>
                        <input
                          type="text"
                          value={cell?.time || ""}
                          placeholder="เวลาเรียน"
                          disabled={!isEditingAllowed}
                          onChange={(e) => handleCellChange(dayIndex, timeIndex, "time", e.target.value)}
                          className={`w-full p-2 border ${isEditingAllowed ? "border-blue-400" : "border-gray-300"} rounded-md`}
                        />
                      </div>
                      {/* ชื่ออาจารย์ */}
                      <div className="flex items-center">
                        <span className="mr-2 text-purple-500">👨‍🏫</span>
                        <input
                          type="text"
                          value={cell?.instructor || ""}
                          placeholder="ชื่ออาจารย์"
                          disabled={!isEditingAllowed}
                          onChange={(e) => handleCellChange(dayIndex, timeIndex, "instructor", e.target.value)}
                          className={`w-full p-2 border ${isEditingAllowed ? "border-blue-400" : "border-gray-300"} rounded-md`}
                        />
                      </div>
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ปุ่มแก้ไข และบันทึก */}
      <div className="mt-6 flex justify-center space-x-6">
        <button
          className={`px-6 py-2 text-white rounded-md shadow-md ${isEditingAllowed ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500"}`}
          onClick={enableEditing}
          disabled={isEditingAllowed}
        >
          แก้ไข 🖊️
        </button>
        <button
          className={`px-6 py-2 text-white rounded-md shadow-md ${isEditingAllowed ? "bg-green-500" : "bg-gray-400 cursor-not-allowed"}`}
          onClick={saveAllData}
          disabled={!isEditingAllowed}
        >
          บันทึก 💾
        </button>
      </div>
    </div>
  );
};

export default Home;
