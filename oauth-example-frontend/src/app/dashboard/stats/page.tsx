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
  const [logs, setLogs] = useState([
    {
      id: 0,
      image_name: null,
      status: false,
      timestamp: "",
      user: {
        email: "",
        firstname: "",
        id: 0,
        lastname: "",
        role: "",
      },
    },
  ]);
  const [chartData, setChartData] = useState([]);
  const [statusChartData, setStatusChartData] = useState([]);
  const [statusTrendData, setStatusTrendData] = useState([]);
  const [timeFilter, setTimeFilter] = useState("last7days");

  // Fetch Logs
  const handleGetLogs = async () => {
    const res = await fetch(`${environment.backend_url}/api/log/get`);
    const data = await res.json();
    setLogs(data.data.logs);
    processChartData(data.data.logs, "last7days");
    processStatusChartData(data.data.logs);
    processStatusTrendData(data.data.logs, "last7days");
  };

  // Process Data for Status Trend Chart
  const processStatusTrendData = (logs, filter) => {
    const now = new Date();
    const filteredLogs = logs.filter((log) => {
      const logDate = new Date(log.timestamp);
      switch (filter) {
        case "today":
          return logDate.toDateString() === now.toDateString();
        case "last7days":
          return logDate >= new Date(new Date().setDate(now.getDate() - 7));
        case "thisMonth":
          return (
            logDate.getMonth() === now.getMonth() &&
            logDate.getFullYear() === now.getFullYear()
          );
        case "last6months":
          return logDate >= new Date(new Date().setMonth(now.getMonth() - 6));
        case "last12months":
          return logDate >= new Date(new Date().setMonth(now.getMonth() - 12));
        default:
          return true;
      }
    });

    const groupedData = {};

    filteredLogs.forEach((log) => {
      const date = new Date(log.timestamp).toISOString().split("T")[0];
      if (!groupedData[date]) {
        groupedData[date] = {
          date: date,
          success: 0,
          failed: 0,
        };
      }
      console.log(log.status);
      console.log(groupedData);

      if (log.status == "true") {
        groupedData[date].success++;
      } else if (log.status == "false") {
        groupedData[date].failed++;
      }
    });

    const formattedData = Object.values(groupedData).sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );

    setStatusTrendData(formattedData);
  };

  // Filter and Process Data for Chart
  const processChartData = (logs, filter) => {
    const now = new Date();
    const filteredLogs = logs.filter((log) => {
      const logDate = new Date(log.timestamp);
      switch (filter) {
        case "today":
          return logDate.toDateString() === now.toDateString();
        case "last7days":
          return logDate >= new Date(now.setDate(now.getDate() - 7));
        case "thisMonth":
          return (
            logDate.getMonth() === new Date().getMonth() &&
            logDate.getFullYear() === new Date().getFullYear()
          );
        case "last6months":
          return logDate >= new Date(now.setMonth(now.getMonth() - 6));
        case "last12months":
          return logDate >= new Date(now.setMonth(now.getMonth() - 12));
        default:
          return true;
      }
    });

    const groupedData = {};

    filteredLogs.forEach((log) => {
      const date = new Date(log.timestamp);
      const key = date.toISOString().split("T")[0];
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

  // Process Data for Status Chart
  const processStatusChartData = (logs) => {
    const groupedStatus = {
      true: 0,
      false: 0,
    };

    logs.forEach((log) => {
      groupedStatus[log.status] += 1;
    });

    const formattedData = [
      { status: "Success", count: groupedStatus.true },
      { status: "Failed", count: groupedStatus.false },
    ];

    setStatusChartData(formattedData);
  };

  // Handle Dropdown Change
  const handleFilterChange = (filter) => {
    setTimeFilter(filter);
    processChartData(logs, filter);
    processStatusTrendData(logs, filter);
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
    logs
      .map((log) => {
        const timestamp = log.timestamp;
        const date = new Date(timestamp);
        if (isNaN(date.getTime())) {
          // If the timestamp is invalid, return a fallback value (e.g., null or skip it)
          return null;
        }
        return date.toISOString().split("T")[0];
      })
      .filter((date) => date !== null) // Remove any invalid dates
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

        {/* Card Section */}
        <div className="container max-w-6xl px-5 mx-auto my-28">
          <div className="grid bg-white divide-y divide-gray-100 rounded shadow-sm sm:divide-x lg:divide-y-0 sm:grid-cols-2 lg:grid-cols-4">
            {/* Total Logs */}
            <div className="p-5 lg:px-8">
              <div className="text-base text-gray-400">Total Logs</div>
              <div className="flex items-center pt-1">
                <div className="text-2xl font-bold text-gray-900">
                  {logs.length}
                </div>
              </div>
            </div>

            {/* Success Logs */}
            <div className="p-5 lg:px-8 flex items-center">
              <div className="w-4 h-4 rounded-full bg-green-500 mr-3"></div>
              <div>
                <div className="text-base text-gray-400">Success Logs</div>
                <div className="flex items-center pt-1">
                  <div className="text-2xl font-bold text-gray-900">
                    {statusChartData[0]?.count || 0}
                  </div>
                </div>
              </div>
            </div>

            {/* Failed Logs */}
            <div className="p-5 lg:px-8 flex items-center">
              <div className="w-4 h-4 rounded-full bg-red-500 mr-3"></div>
              <div>
                <div className="text-base text-gray-400">Failed Logs</div>
                <div className="flex items-center pt-1">
                  <div className="text-2xl font-bold text-gray-900">
                    {statusChartData[1]?.count || 0}
                  </div>
                </div>
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

        {/* Total Logs Line Chart */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Total Logs Over Time</h2>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#8884d8"
                name="Total Logs"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Success/Failed Trend Line Chart */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">
            Success/Failed Logs Trend
          </h2>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart
              data={statusTrendData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="success"
                stroke="#82ca9d"
                name="Success"
              />
              <Line
                type="monotone"
                dataKey="failed"
                stroke="#d9534f"
                name="Failed"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Page;
