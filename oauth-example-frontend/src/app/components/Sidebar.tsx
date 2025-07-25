import Link from 'next/link';
import React from 'react'

const Sidebar = () => {
  return (
    <div className="w-64 bg-gray-800 text-white fixed h-full flex flex-col">
      <div className="p-4 text-xl font-bold border-b border-gray-700">
        Dashboard
      </div>
      <nav className="flex-grow">
        <ul className="p-4 space-y-2">
          <li>
            <Link
              href="/dashboard/stats?source=dashboard"
              className="block px-4 py-2 rounded hover:bg-gray-700"
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              href="/dashboard?source=dashboard-stats"
              className="block px-4 py-2 rounded hover:bg-gray-700"
            >
              Logs
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}

export default Sidebar