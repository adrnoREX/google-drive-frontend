import React from "react";
import {
  FaFile,
  FaFilePdf,
  FaFileWord,
  FaFileExcel,
  FaFileArchive,
  FaFileImage,
  FaFileVideo,
  FaFileAudio,
} from "react-icons/fa";

const FilePreview = ({ file, title }) => {
  if (!file || !file.mime_type || !file.id) return null;

  const mime = file.mime_type;
  const src = `http://localhost:8800/preview/${file.id}`;

  if (mime.startsWith("image/")) {
    return (
      <img
        src={src}
        alt={title || file.display_name}
        className="object-cover rounded max-h-[100vh] h-50 w-full"
      />
    );
  }

  if (mime.startsWith("video/")) {
    return <FaFileVideo size={48} className="text-blue-500 mx-auto" />;
  }

  if (mime.startsWith("audio/")) {
    return <FaFileAudio size={48} className="text-purple-500 mx-auto" />;
  }

  if (mime === "application/pdf") {
    return <FaFilePdf size={48} className="text-red-500 mx-auto" />;
  }

  if (
    mime === "application/msword" ||
    mime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return <FaFileWord size={48} className="text-blue-700 mx-auto" />;
  }

  if (
    mime === "application/vnd.ms-excel" ||
    mime === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  ) {
    return <FaFileExcel size={48} className="text-green-600 mx-auto" />;
  }

  if (
    mime.includes("zip") ||
    mime.includes("rar") ||
    mime.includes("x-msdownload") 
  ) {
    return <FaFileArchive size={48} className="text-yellow-600 mx-auto" />;
  }

  if (
    mime.startsWith("text/") ||
    mime === "application/json" ||
    mime === "application/xml" ||
    mime === "text/csv"
  ) {
    return <FaFile size={48} className="text-gray-600 mx-auto" />;
  }

  return (
    <div className="flex flex-col text-center items-center justify-center px-8 w-full h-40 border rounded bg-gray-100">
      <FaFile size={48} className="text-gray-400 mb-2" />
      <span className="text-xs font-medium text-gray-600 truncate">
        {file.display_name}
      </span>
    </div>
  );
};

export default FilePreview;