import React, { useEffect, useState } from "react";
import Sidebar from "./sidebar";
import axios from "axios";

function formatBytes(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function Storage() {
  const [storage, setStorage] = useState({ used: 0, total: 1 });

  useEffect(() => {
    axios
      .get("http://localhost:8800/storage/info")
      .then((res) => setStorage(res.data))
      .catch((err) => console.error(err));
  }, []);

  const percentUsed = (storage.used / storage.total) * 100;

  return (
    <div className="flex">
      <Sidebar />
      <div className="sm:p-4 p-2 w-full">
        <section className="text-2xl px-4 mb-6">Storage</section>

        <div className="px-4">
          <div className="w-full bg-gray-200 rounded-full h-5">
            <div
              className="bg-green-500 h-5 rounded-full"
              style={{ width: `${percentUsed}%` }}
            ></div>
          </div>

          <p className="mt-2 text-gray-700 text-sm">
            {formatBytes(storage.used)} used of {formatBytes(storage.total)} (
            {percentUsed.toFixed(2)}%)
          </p>
        </div>
      </div>
    </div>
  );
}

export default Storage;