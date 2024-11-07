// src/pages/Home.tsx
import React from 'react';
import "../styles/Home.css";

const Home: React.FC = () => {
  return (
    <div className="p-5">
      <h1 className="text-2xl font-bold mb-4">ตารางเรียน</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 border-separate rounded-lg" style={{ borderSpacing: "10px" }}>
          <thead>
            <tr>
              <th className="px-4 py-5 border-b border-gray-200 rounded-md bg-red-200 sparkle">Mo</th>
              <th className="px-4 py-5 border-b border-gray-200 rounded-md bg-yellow-200 sparkle">Tu</th>
              <th className="px-4 py-5 border-b border-gray-200 rounded-md bg-green-200 sparkle">We</th>
              <th className="px-4 py-5 border-b border-gray-200 rounded-md bg-blue-200 sparkle">Th</th>
              <th className="px-4 py-5 border-b border-gray-200 rounded-md bg-purple-200 sparkle">Fr</th>
            </tr>
          </thead>
          <tbody>
            <tr className="text-center">
              <td className="px-4 py-5 border border-gray-200 rounded-md"></td>
              <td className="px-4 py-5 border border-gray-200 rounded-md"></td>
              <td className="px-4 py-5 border border-gray-200 rounded-md"></td>
              <td className="px-4 py-5 border border-gray-200 rounded-md"></td>
              <td className="px-4 py-5 border border-gray-200 rounded-md"></td>
            </tr>
            <tr className="text-center">
              <td className="px-4 py-5 border border-gray-200 rounded-md"></td>
              <td className="px-4 py-5 border border-gray-200 rounded-md"></td>
              <td className="px-4 py-5 border border-gray-200 rounded-md"></td>
              <td className="px-4 py-5 border border-gray-200 rounded-md"></td>
              <td className="px-4 py-5 border border-gray-200 rounded-md"></td>
            </tr>
            <tr className="text-center">
              <td className="px-4 py-5 border border-gray-200 rounded-md"></td>
              <td className="px-4 py-5 border border-gray-200 rounded-md"></td>
              <td className="px-4 py-5 border border-gray-200 rounded-md"></td>
              <td className="px-4 py-5 border border-gray-200 rounded-md"></td>
              <td className="px-4 py-5 border border-gray-200 rounded-md"></td>
            </tr>
            <tr className="text-center">
              <td className="px-4 py-5 border border-gray-200 rounded-md"></td>
              <td className="px-4 py-5 border border-gray-200 rounded-md"></td>
              <td className="px-4 py-5 border border-gray-200 rounded-md"></td>
              <td className="px-4 py-5 border border-gray-200 rounded-md"></td>
              <td className="px-4 py-5 border border-gray-200 rounded-md"></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Home;
