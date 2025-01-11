"use client";
import React, { useEffect, useState } from "react";
import { environment } from "../env";
import Loader2 from "../components/Loading2";
import info from "../icons/info.svg";
import Sidebar from "../components/Sidebar";

const Dashboard = () => {
  const [logs, setLogs] = useState([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [showAll, setShowAll] = useState(false);

  const handleGetImage = (image_name: string) => {
    return `${environment.backend_url}/api/image/${image_name}`;
  };

  const handleGetLogs = async () => {
    const res = await fetch(`${environment.backend_url}/api/log/get`);
    const data = await res.json();
    setLogs(data.data.logs);
    console.log(data.data.logs);
  };

  useEffect(() => {
    handleGetLogs();
  }, []);
  const limitData = 20;
  const displayedLogs = showAll ? logs : logs.slice(0, limitData);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="ml-64 flex-1 p-8">
        {logs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse border border-gray-200">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 border border-gray-200">อีเมล์</th>
                  <th className="px-4 py-2 border border-gray-200">วัน-เวลา</th>
                  <th className="px-4 py-2 border border-gray-200">รูป</th>
                  <th className="px-4 py-2 border border-gray-200">สถานะ</th>
                </tr>
              </thead>
              <tbody>
                {displayedLogs.map((ele, i) => (
                  <tr key={i} className="hover:bg-gray-50">
         
                    <td className="px-4 py-2 border border-gray-200">
                      <div className="flex items-center">
                        {ele.user.email}
                        <button
                          className="ml-2 px-2 py-1"
                          onClick={() => setSelectedUser(ele.user)}
                        >
                          <img
                            className="min-w-4 transition-transform -translate-y-0 hover:-translate-y-1 aspect-square"
                            src={info.src}
                          />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-2 border border-gray-200">
                      {new Date(ele.timestamp).toISOString().split("T")[0] +
                        " " +
                        new Date(ele.timestamp).toTimeString().split(" ")[0]}
                    </td>
                    <td className="px-4 py-2 border border-gray-200 text-center">
                      <button
                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                        onClick={() =>
                          setSelectedImage(handleGetImage(ele.image_name))
                        }
                      >
                        View
                      </button>
                    </td>
                    <td className="px-4 py-2 border border-gray-200 ">
                      <div className="flex justify-center items-center">
                        <span
                          className={`inline-block w-4 h-4 rounded-full ${
                            ele.status === "true"
                              ? "bg-green-500"
                              : "bg-red-500"
                          }`}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {logs.length > limitData && !showAll && (
              <div className="text-right mt-4">
                <button
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                  onClick={() => setShowAll(true)}
                >
                  ดูทั้งหมด
                </button>
              </div>
            )}
          </div>
        ) : (
          <Loader2 />
        )}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="bg-white rounded-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <img src={selectedImage} alt="Preview" className="w-full h-auto" />
            <div className="p-4 text-right">
              <button
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                onClick={() => setSelectedImage(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Modal */}
      {selectedUser && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setSelectedUser(null)}
        >
          <div
            className="bg-white rounded-lg p-6 w-1/3"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold mb-4">User Information</h2>
            <p>
              <strong>First Name:</strong> {selectedUser.firstname}
            </p>
            <p>
              <strong>Last Name:</strong> {selectedUser.lastname}
            </p>
            <p>
              <strong>Email:</strong> {selectedUser.email}
            </p>
            <p>
              <strong>Role:</strong> {selectedUser.role}
            </p>
            <div className="text-right mt-4">
              <button
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                onClick={() => setSelectedUser(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
