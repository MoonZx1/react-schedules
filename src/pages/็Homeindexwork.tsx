import { signOut } from 'firebase/auth'; // ใช้สำหรับ Logout
import {
  get,
  getDatabase,
  onValue,
  push,
  ref,
  set,
  update,
} from 'firebase/database';
import React, { useEffect, useState } from 'react';
import { AiFillEdit, AiFillSave } from 'react-icons/ai';
import { MdCancel, MdDelete } from 'react-icons/md';
import { app, auth } from '../firebaseConfig';
import '../styles/Home.css';

const Home: React.FC = () => {
  const LOCAL_STORAGE_KEY = 'scheduleData';

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
  const [newTask, setNewTask] = useState({ description: '', deadline: '' });
  const [deadlineTasks, setDeadlineTasks] = useState<
    { description: string; deadline: string }[]
  >([]);
  const [remainingTimes, setRemainingTimes] = useState<{
    [key: string]: string;
  }>({});
  const database = getDatabase(app);

  const groupTasksBySubject = (schedule) => {
    const groupedTasks = {};

    schedule.forEach((day) => {
      day.forEach((cell) => {
        const subject = cell.subject || 'วิชาไม่ระบุ';
        if (!groupedTasks[subject]) {
          groupedTasks[subject] = [];
        }

        if (cell.tasks) {
          groupedTasks[subject] = [...groupedTasks[subject], ...cell.tasks];
        }
      });
    });

    return groupedTasks;
  };

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
      alert('ไม่สามารถบันทึกข้อมูลได้');
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
    if (
      !selectedCell ||
      !newTask.description ||
      !newTask.deadlineDate ||
      !newTask.deadlineHour ||
      !newTask.deadlineMinute
    ) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    // รวมวันที่และเวลา
    const combinedDeadline = new Date(
      `${newTask.deadlineDate}T${newTask.deadlineHour}:${newTask.deadlineMinute}`
    );

    if (isNaN(combinedDeadline.getTime())) {
      alert('วันที่หรือเวลาไม่ถูกต้อง');
      return;
    }

    const { dayIndex, timeIndex } = selectedCell;

    // อัปเดต schedule ใน State
    const updatedSchedule = schedule.map((day, dIndex) =>
      day.map((cell, tIndex) => {
        if (dIndex === dayIndex && tIndex === timeIndex) {
          return {
            ...cell,
            tasks: [
              ...(cell.tasks || []),
              {
                ...newTask,
                deadline: combinedDeadline.toISOString(),
                status: 'pending',
              },
            ],
          };
        }
        return cell;
      })
    );

    // อัปเดต State
    setSchedule(updatedSchedule);

    // บันทึกลง Firebase
    const scheduleRef = ref(database, 'schedules');
    update(
      scheduleRef,
      Object.fromEntries(updatedSchedule.map((day, index) => [index, day]))
    )
      .then(() => {
        alert('เพิ่มงานสำเร็จและบันทึกลง Firebase แล้ว!');
      })
      .catch((error) => {
        console.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล:', error);
        alert('ไม่สามารถบันทึกข้อมูลลง Firebase ได้');
      });

    // บันทึกลง LocalStorage
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedSchedule));

    // รีเซ็ตฟอร์ม
    setNewTask({
      description: '',
      deadlineDate: '',
      deadlineHour: '',
      deadlineMinute: '',
    });
  };

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

  const removeTask = (taskIndex: number) => {
    if (!selectedCell) return;
    const { dayIndex, timeIndex } = selectedCell;

    // อัปเดต schedule ใน State
    const updatedSchedule = schedule.map((day, dIndex) =>
      day.map((cell, tIndex) => {
        if (dIndex === dayIndex && tIndex === timeIndex) {
          return {
            ...cell,
            tasks: Array.isArray(cell.tasks)
              ? cell.tasks.filter((_, index: number) => index !== taskIndex)
              : [],
          };
        }
        return cell;
      })
    );

    setSchedule(updatedSchedule);

    // บันทึกลง LocalStorage
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedSchedule));

    // อัปเดต Firebase
    const scheduleRef = ref(database, 'schedules');
    update(
      scheduleRef,
      Object.fromEntries(updatedSchedule.map((day, index) => [index, day]))
    )
      .then(() => {
        alert('ลบงานสำเร็จ!');
      })
      .catch((error) => {
        console.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล:', error);
        alert('ไม่สามารถลบงานจาก Firebase ได้');
      });
  };

  useEffect(() => {
    const fetchTasks = async () => {
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

          cell.tasks?.forEach((task, taskIndex) => {
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
                subject: cell.subject || 'ไม่ระบุ',
              });
            }
          });

          updatedSchedule[dayIndex][timeIndex].tasks = remainingTasks;
        });
      });

      setRemainingTimes(updatedTimes);

      // บันทึก expiredTasks ลง Firebase
      const expiredTasksRef = ref(database, 'expiredTasks');
      try {
        const snapshot = await get(expiredTasksRef);
        const data = snapshot.val();
        const existingTasks = data ? Object.values(data) : [];

        const newTasks = expiredTasks.filter(
          (task) =>
            !existingTasks.some(
              (existingTask: any) =>
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

        setDeadlineTasks([...existingTasks, ...newTasks]);
      } catch (error) {
        console.error('Error fetching expired tasks:', error);
      }
    };

    fetchTasks();
    const interval = setInterval(fetchTasks, 1000); // ดึงข้อมูลทุก 30 วินาที

    return () => clearInterval(interval);
  }, [schedule]);

  const dayNames = ['จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์'];
  const dayColors = ['#FFEDD5', '#D1E8E2', '#E8D6FF', '#FFF4E6', '#D9E9FF'];

  const clearLocalStorage = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setSchedule(getInitialSchedule());
    alert('ล้างข้อมูลสำรองเรียบร้อยแล้ว!');
  };

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(schedule));
  }, [schedule]);

  // ฟังก์ชัน Logout
  const handleLogout = async () => {
    try {
      await signOut(auth); // ใช้ auth จาก firebaseConfig
      alert('ออกจากระบบสำเร็จ!');
      window.location.href = '/'; // เปลี่ยนเส้นทางไปที่หน้า Login
    } catch (error) {
      console.error('Error during logout:', error); // แสดงข้อความเมื่อเกิดข้อผิดพลาด
      alert('ไม่สามารถออกจากระบบได้!');
    }
  };
  
  return (
    <div className="relative flex flex-col items-center p-4 sm:p-6 h-screen bg-gray-50">
      {/* ปุ่ม Logout */}
      <button
        onClick={handleLogout} // เมื่อคลิกจะเรียกใช้ handleLogout
        className="absolute top-4 left-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-red-600 focus:outline-none"
      >
        Logout
      </button>

      <div className="flex flex-col items-center p-4 sm:p-6 h-screen bg-gray-50">
        <h1 className="text-lg sm:text-2xl font-semibold mb-4 text-center">
          📅 ตารางเรียนและงาน
        </h1>
        {/* ส่วนแสดงผลบนโทรศัพท์มือถือ */}
        <div className="sm:hidden w-full max-w-7xl rounded-lg shadow-lg p-4 bg-white border border-gray-300">
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
                  {/* กรอกข้อมูลรหัสวิชา */}
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
                      placeholder="กรอกรหัสวิชา"
                      disabled={!isEditingAllowed} // ให้กรอกได้เฉพาะเมื่อเปิดโหมดแก้ไข
                      className="w-full border p-2 rounded text-xs sm:text-sm"
                    />
                  </div>

                  {/* กรอกข้อมูลชื่อวิชา */}
                  <div className="flex flex-col mb-2">
                    <div className="font-bold">ชื่อวิชา</div>
                    <input
                      type="text"
                      value={cell?.subject || ''}
                      onChange={(e) =>
                        handleCellChange(
                          dayIndex,
                          timeIndex,
                          'subject',
                          e.target.value
                        )
                      }
                      placeholder="กรอกชื่อวิชา"
                      disabled={!isEditingAllowed} // ให้กรอกได้เฉพาะเมื่อเปิดโหมดแก้ไข
                      className="w-full border p-2 rounded text-xs sm:text-sm"
                    />
                  </div>

                  {/* ปุ่มเพิ่มงาน */}
                  <button
                    onClick={() => setSelectedCell({ dayIndex, timeIndex })}
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
                        disabled={!isEditingAllowed}
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
                        disabled={!isEditingAllowed}
                        className="w-full border p-2 rounded text-xs sm:text-sm"
                      />
                      <button
                        onClick={() => setSelectedCell({ dayIndex, timeIndex })}
                        className="mt-2 bg-yellow-500 text-white p-1 rounded text-xs sm:text-sm"
                      >
                        งาน ({cell.tasks?.length || 0})
                      </button>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal สำหรับเพิ่มงาน */}
        {selectedCell && (
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

            {/* เลือกเวลาแบบ Dropdown */}
            <div className="flex gap-2 mb-4">
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
            </div>

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
                cell.tasks?.map((task, taskIndex) => {
                  const taskKey = `${dayIndex}-${timeIndex}-${taskIndex}`;
                  return (
                    <div
                      key={taskKey}
                      className="p-4 bg-white shadow-md rounded-lg border text-xs sm:text-sm"
                    >
                      <h3 className="font-semibold mb-1">
                        🎨 {task.description}
                      </h3>
                      <p className="text-gray-500 mb-1">
                        📚 วิชา: {cell.subject || 'ไม่ระบุ'}
                      </p>
                      <p className="text-gray-500 mb-1">
                        ⏰ ครบกำหนด: {formatDeadline(task.deadline)}{' '}
                      </p>
                      <p
                        className={
                          remainingTimes[taskKey]?.includes('หretวลา')
                            ? 'text-red-500 font-bold'
                            : 'text-green-500 font-bold'
                        }
                      >
                        {remainingTimes[taskKey] || 'กำลังโหลด...'}
                      </p>
                    </div>
                  );
                })
              )
            )}
          </div>
        </div>

        <div className="mt-6 w-full max-w-7xl">
          <h2 className="text-lg sm:text-2xl font-semibold mb-6 text-gray-700">
            ⏳ งานหมดเวลา
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {deadlineTasks.length === 0 ? (
              <p className="text-gray-500">ยังไม่มีงานหมดเวลา</p>
            ) : (
              deadlineTasks.map((task, index) => (
                <div
                  key={index}
                  className="p-4 bg-gray-200 shadow-md rounded-lg border"
                >
                  <h3 className="font-bold">🎨{task.description}</h3>
                  <p className="text-sm text-gray-500">
                    📚 วิชา: {task.subject}
                  </p>
                  <p className="text-sm text-gray-500">
                    <span>⏰ ครบกำหนด: {formatDeadline(task.deadline)}</span>
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="fixed bottom-6 right-6 flex flex-col items-end space-y-3 z-50">
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

          {isEditingAllowed && (
            <button
              className="flex items-center justify-center w-14 h-14 rounded-full shadow-md bg-gradient-to-r from-gray-400 to-gray-600 hover:from-gray-500 hover:to-gray-700 text-white transition-all transform hover:scale-110"
              onClick={handleCancelEdit}
            >
              <MdCancel size={24} />
            </button>
          )}

          <button
            className="flex items-center justify-center w-14 h-14 rounded-full shadow-md bg-gradient-to-r from-red-400 to-red-600 hover:from-red-500 hover:to-red-700 text-white transition-all transform hover:scale-110"
            onClick={clearLocalStorage}
          >
            <MdDelete size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
