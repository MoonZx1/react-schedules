import React, { useEffect, useState } from "react";
import "../styles/Home.css";

const Home: React.FC = () => {
  const LOCAL_STORAGE_KEY = "scheduleData";
  const THEME_KEY = "themeMode";

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

  const [schedule, setSchedule] = useState<any[][]>(getInitialSchedule);
  const [isEditingAllowed, setEditingAllowed] = useState(false);
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem(THEME_KEY) || "light");

  const saveAllData = () => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(schedule));
    setEditingAllowed(false);
    alert("บันทึกข้อมูลเรียบร้อยแล้ว!");
  };

  const enableEditing = () => {
    setEditingAllowed(true);
  };

  const handleCellChange = (dayIndex: number, timeIndex: number, key: string, value: string) => {
    if (!isEditingAllowed) return;
    const updatedSchedule = [...schedule];
    if (!updatedSchedule[dayIndex][timeIndex]) {
      updatedSchedule[dayIndex][timeIndex] = { code: "", subject: "", time: "", instructor: "" };
    }
    updatedSchedule[dayIndex][timeIndex][key] = value;
    setSchedule(updatedSchedule);
  };

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem(THEME_KEY, newTheme);
  };

  useEffect(() => {
    document.body.style.backgroundColor = theme === "dark" ? "#2d3748" : "#f9fafb"; 
    document.body.style.color = theme === "dark" ? "#e2e8f0" : "#000000";  
  }, [theme]);

  useEffect(() => {
    const savedData = getInitialSchedule();
    setSchedule(savedData);
  }, []);

  const dayColors = [
    "#FFEDD5", 
    "#D1E8E2", 
    "#E8D6FF", 
    "#FFF4E6", 
    "#D9E9FF", 
  ];

  return (
    <div
      className={`flex flex-col items-center p-4 sm:p-5 relative h-screen ${
        theme === "dark" ? "bg-gray-800 text-gray-100" : "bg-gray-50 text-black"
      }`}
    >
      <div className="absolute top-4 left-4 z-10 flex items-center space-x-4">
        <button
          className="p-3 bg-blue-500 text-white rounded-md shadow-md hover:bg-blue-600"
          onClick={() => setMenuOpen(!isMenuOpen)}
        >
          ☰
        </button>
        <button
          className="p-3 bg-gray-700 text-white rounded-md shadow-md hover:bg-gray-600"
          onClick={toggleTheme}
        >
          {theme === "light" ? "🌙" : "☀️"}
        </button>
        {isMenuOpen && (
          <div
            className={`absolute top-12 left-0 ${
              theme === "dark" ? "bg-gray-700" : "bg-white"
            } border border-gray-400 rounded-lg shadow-lg w-48`}
          >
            <ul className="flex flex-col">
              <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">หน้าแรก</li>
              <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">ตารางเรียน</li>
              <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">ตั้งค่า</li>
            </ul>
          </div>
        )}
      </div>

      <h1 className="text-2xl sm:text-3xl font-semibold mb-4 sm:mb-6 text-center">📅 ตารางเรียน</h1>

      <div className="flex flex-grow w-full max-w-7xl">
        <div
          className={`flex-grow rounded-lg shadow-lg p-3 sm:p-4 border ${
            theme === "dark" ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300"
          }`}
        >
          <div className="overflow-x-auto max-h-[80vh]">
            <table className="min-w-full border border-gray-500 rounded-lg">
              <thead>
                <tr
                  className={`text-center ${
                    theme === "dark" ? "bg-gray-600 text-black" : "bg-gray-100 text-gray-600"
                  }`}
                >
                  <th className="px-4 sm:px-6 py-2 sm:py-4 text-sm sm:text-lg font-medium">วัน</th>
                  <th className="px-4 sm:px-6 py-2 sm:py-4 text-sm sm:text-lg font-medium">
                    08:00 - 10:00
                  </th>
                  <th className="px-4 sm:px-6 py-2 sm:py-4 text-sm sm:text-lg font-medium">
                    10:00 - 12:00
                  </th>
                  <th className="px-4 sm:px-6 py-2 sm:py-4 text-sm sm:text-lg font-medium">
                    13:00 - 15:00
                  </th>
                  <th className="px-4 sm:px-6 py-2 sm:py-4 text-sm sm:text-lg font-medium">
                    15:00 - 17:00
                  </th>
                </tr>
              </thead>
              <tbody>
                {["จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์"].map((day, dayIndex) => (
                  <tr
                    key={dayIndex}
                    className={`text-center ${
                      theme === "dark" ? "hover:bg-gray-600" : "hover:bg-gray-50"
                    }`}
                    style={{ backgroundColor: dayColors[dayIndex] }}
                  >
                    <td
                      className={`px-4 sm:px-6 py-2 sm:py-4 font-medium ${
                        theme === "dark" ? "text-black" : "text-gray-700"
                      }`}
                    >
                      {day}
                    </td>
                    {schedule[dayIndex].map((cell, timeIndex) => (
                      <td
                        key={timeIndex}
                        className={`relative px-2 sm:px-6 py-2 sm:py-4 border ${
                          theme === "dark" ? "border-gray-600" : "border-gray-200"
                        }`}
                      >
                        <div className="flex flex-col">
                          <input
                            type="text"
                            value={cell?.subject || ""}
                            placeholder="ชื่อวิชา"
                            disabled={!isEditingAllowed}
                            onChange={(e) =>
                              handleCellChange(dayIndex, timeIndex, "subject", e.target.value)
                            }
                            className={`w-full h-12 p-2 border ${
                              isEditingAllowed
                                ? theme === "dark"
                                  ? "border-blue-400 text-black"
                                  : "border-blue-400 text-black"
                                : theme === "dark"
                                ? "border-gray-600"
                                : "border-gray-300"
                            } rounded-md focus:ring-2 ${
                              theme === "dark" ? "focus:ring-blue-500" : "focus:ring-blue-200"
                            }`}
                          />
                          <input
                            type="text"
                            value={cell?.instructor || ""}
                            placeholder="ชื่ออาจารย์"
                            disabled={!isEditingAllowed}
                            onChange={(e) =>
                              handleCellChange(dayIndex, timeIndex, "instructor", e.target.value)
                            }
                            className={`w-full h-12 mt-2 p-2 border ${
                              isEditingAllowed
                                ? theme === "dark"
                                  ? "border-blue-400 text-black"
                                  : "border-blue-400 text-black"
                                : theme === "dark"
                                ? "border-gray-600"
                                : "border-gray-300"
                            } rounded-md focus:ring-2 ${
                              theme === "dark" ? "focus:ring-blue-500" : "focus:ring-blue-200"
                            }`}
                          />
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="fixed bottom-4 right-4 flex flex-col space-y-3 sm:bottom-6 sm:right-6">
        <button
          className={`p-3 rounded-full shadow-md ${
            isEditingAllowed
              ? theme === "dark"
                ? "bg-gray-500 text-gray-300 cursor-not-allowed"
                : "bg-gray-400 text-gray-600 cursor-not-allowed"
              : theme === "dark"
              ? "bg-blue-600 hover:bg-blue-500 text-white"
              : "bg-blue-500 hover:bg-blue-600 text-white"
          }`}
          onClick={enableEditing}
          disabled={isEditingAllowed}
        >
          🖊️
        </button>
        <button
          className={`p-3 rounded-full shadow-md ${
            isEditingAllowed
              ? theme === "dark"
                ? "bg-green-700 hover:bg-green-600 text-white"
                : "bg-green-500 hover:bg-green-600 text-white"
              : theme === "dark"
              ? "bg-gray-600 text-gray-400 cursor-not-allowed"
              : "bg-gray-400 text-gray-600 cursor-not-allowed"
          }`}
          onClick={saveAllData}
          disabled={!isEditingAllowed}
        >
          💾
        </button>
      </div>
    </div>
  );
};

export default Home;
