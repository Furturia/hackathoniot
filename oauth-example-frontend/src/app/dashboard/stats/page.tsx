"use client";
import Sidebar from "@/app/components/Sidebar";
import { environment } from "@/app/env";
import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const Page = () => {
  const [logs, setLogs] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [timeFilter, setTimeFilter] = useState("last7days");

  // Fetch Logs
  const handleGetLogs = async () => {
    const res = await fetch(`${environment.backend_url}/api/log/get`);
    const data = await res.json();
    setLogs(data.data.logs);
    processChartData(data.data.logs, "last7days");
  };

  // Filter and Process Data for Chart
  const processChartData = (logs, filter) => {
    const now = new Date();
    const filteredLogs = logs.filter((log) => {
      const logDate = new Date(log.timestamp);
      switch (filter) {
        case "today":
          return logDate.toDateString() === now.toDateString(); // Same day
        case "last7days":
          return logDate >= new Date(now.setDate(now.getDate() - 7)); // Last 7 days
        case "thisMonth":
          return (
            logDate.getMonth() === new Date().getMonth() &&
            logDate.getFullYear() === new Date().getFullYear()
          ); // This month
        case "last6months":
          return logDate >= new Date(now.setMonth(now.getMonth() - 6)); // Last 6 months
        case "last12months":
          return logDate >= new Date(now.setMonth(now.getMonth() - 12)); // Last 12 months
        default:
          return true; // Default: All logs
      }
    });

    const groupedData = {};

    filteredLogs.forEach((log) => {
      const date = new Date(log.timestamp);
      const key = date.toISOString().split("T")[0]; // Format as YYYY-MM-DD
      if (!groupedData[key]) {
        groupedData[key] = 0;
      }
      groupedData[key]++;
    });

    const formattedData = Object.keys(groupedData)
      .sort()
      .map((key) => ({
        date: key,
        count: groupedData[key],
      }));

    setChartData(formattedData);
  };

  // Handle Dropdown Change
  const handleFilterChange = (filter) => {
    setTimeFilter(filter);
    processChartData(logs, filter);
  };

  useEffect(() => {
    handleGetLogs();
  }, []);

  const timeOptions = [
    { label: "Today", value: "today" },
    { label: "Last 7 Days", value: "last7days" },
    { label: "This Month", value: "thisMonth" },
    { label: "Last 6 Months", value: "last6months" },
    { label: "Last 12 Months", value: "last12months" },
  ];

  const now = new Date();

  // Logs Today
  const logsToday = logs.filter((log) => {
    const logDate = new Date(log.timestamp);
    return logDate.toDateString() === now.toDateString();
  }).length;

  // Logs This Month
  const logsThisMonth = logs.filter((log) => {
    const logDate = new Date(log.timestamp);
    return (
      logDate.getMonth() === now.getMonth() &&
      logDate.getFullYear() === now.getFullYear()
    );
  }).length;

  // Average Logs
  const uniqueDays = new Set(
    logs.map((log) => new Date(log.timestamp).toISOString().split("T")[0])
  ).size;
  const averageLogs = (logs.length / uniqueDays).toFixed(1);

  // Calculate Percentage Change (Mock Implementation)
  const calculatePercentageChange = (type) => {
    switch (type) {
      case "total":
        return 10; // Example: +10%
      case "today":
        return 5; // Example: +5%
      case "month":
        return 8; // Example: +8%
      case "average":
        return 3; // Example: +3%
      default:
        return 0;
    }
  };


  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <div className="ml-64 flex-1 p-8">
        <h1 className="text-2xl font-bold mb-4">Log Statistics</h1>

        {/* นี่คือ component ที่ copy มา ช่วยเติมข้อมูลทางสถิติเกี่ยวกับ logs state */}
        <div className="container max-w-6xl px-5 mx-auto my-28">
          <div className="grid bg-white divide-y divide-gray-100 rounded shadow-sm sm:divide-x lg:divide-y-0 sm:grid-cols-2 lg:grid-cols-4">
            {/* Total Logs */}
            <div className="p-5 lg:px-8 ">
              <div className="text-base text-gray-400 ">Total Logs</div>
              <div className="flex items-center pt-1">
                <div className="text-2xl font-bold text-gray-900 ">
                  {logs.length}
                </div>
                <span className="flex items-center px-2 py-0.5 mx-2 text-sm text-green-600 bg-green-100 rounded-full">
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M18 15L12 9L6 15"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    ></path>
                  </svg>
                  <span>+{calculatePercentageChange("total")}%</span>
                </span>
              </div>
            </div>

            {/* Logs Today */}
            <div className="p-5 lg:px-8 ">
              <div className="text-base text-gray-400 ">Logs Today</div>
              <div className="flex items-center pt-1">
                <div className="text-2xl font-bold text-gray-900 ">
                  {logsToday}
                </div>
                <span className="flex items-center px-2 py-0.5 mx-2 text-sm text-green-600 bg-green-100 rounded-full">
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M18 15L12 9L6 15"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    ></path>
                  </svg>
                  <span>+{calculatePercentageChange("today")}%</span>
                </span>
              </div>
            </div>

            {/* Logs This Month */}
            <div className="p-5 lg:px-8 ">
              <div className="text-base text-gray-400 ">Logs This Month</div>
              <div className="flex items-center pt-1">
                <div className="text-2xl font-bold text-gray-900 ">
                  {logsThisMonth}
                </div>
                <span className="flex items-center px-2 py-0.5 mx-2 text-sm text-green-600 bg-green-100 rounded-full">
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M18 15L12 9L6 15"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    ></path>
                  </svg>
                  <span>+{calculatePercentageChange("month")}%</span>
                </span>
              </div>
            </div>

            {/* Average Logs */}
            <div className="p-5 lg:px-8 ">
              <div className="text-base text-gray-400 ">Average Logs / Day</div>
              <div className="flex items-center pt-1">
                <div className="text-2xl font-bold text-gray-900 ">
                  {averageLogs}
                </div>
                <span className="flex items-center px-2 py-0.5 mx-2 text-sm text-green-600 bg-green-100 rounded-full">
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M18 15L12 9L6 15"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    ></path>
                  </svg>
                  <span>+{calculatePercentageChange("average")}%</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Dropdown for Time Filter */}
        <div className="mb-6">
          <select
            className="border border-gray-300 rounded px-4 py-2"
            value={timeFilter}
            onChange={(e) => handleFilterChange(e.target.value)}
          >
            {timeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Line Chart */}
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="count" stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Page;