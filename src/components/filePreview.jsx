import React from "react";

const FilePreview = ({ file, title }) => {
  if (!file || !file.mime_type || !file.id) return null;

  const mime = file.mime_type;
  const src = `http://localhost:8800/preview/${file.id}`;

  return (
    <figure className="brightness-80 opacity-86 saturate-50 p-2">
      {mime.startsWith("image/") && (
        <img
          src={src}
          alt={title || file.display_name}
          className="object-cover rounded max-h-[100vh] h-50 w-full"
        />
      )}

      {mime.startsWith("video/") && (
        <video
          src={src}
          controls
          className="object-cover rounded max-h-[100vh] h-50 w-full"
        />
      )}

      {mime.startsWith("audio/") && (
        <audio controls className="w-full">
          <source src={src} type={mime} />
          Your browser does not support the audio tag.
        </audio>
      )}

      {mime === "application/pdf" && (
        <embed
          src={src}
          type="application/pdf"
          className="object-cover rounded max-h-[100vh] h-50 w-full"
        />
      )}

      {(mime.startsWith("text/") ||
        mime === "application/json" ||
        mime === "application/xml" ||
        mime === "text/csv") && (
        <iframe
          src={src}
          title={file.display_name}
          className="object-cover rounded max-h-[100vh] h-50 w-full bg-gray-50 p-2"
        />
      )}

      {!(
        mime.startsWith("image/") ||
        mime.startsWith("video/") ||
        mime.startsWith("audio/") ||
        mime === "application/pdf" ||
        mime.startsWith("text/") ||
        mime === "application/json" ||
        mime === "application/xml" ||
        mime === "text/csv"
      ) && (
        <div className="flex flex-col text-center items-center justify-center px-8 w-full h-50 max-h-[100vh] border rounded bg-gray-100">
          <span className="text-sm font-medium text-gray-600">
             {file.display_name}
          </span>
        </div>
      )}
    </figure>
  );
};

export default FilePreview;