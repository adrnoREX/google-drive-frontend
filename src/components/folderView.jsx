import React from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Sidebar from "./sidebar";
import { useQuery } from "@tanstack/react-query";
import FilePreview from "./filePreview";
import DriveOptionsFile from "./driveOptionsFile";

function FolderView() {
  const { id } = useParams();
  const folderId = id || "root";

  const {
    data: files = [],
    isLoading: filesLoading,
    isError: filesError,
  } = useQuery({
    queryKey: ["files", folderId],
    queryFn: async () => {
      const res = await axios.get(
        `http://localhost:8800/files?folderId=${folderId ?? "root"}`
      );
      return res.data;
    },
    enabled: folderId !== undefined,
  });

  return (
    <div className="flex">
      <Sidebar />
      <div className="p-6 w-full">
        <h3 className="text-lg font-medium mb-4">Files</h3>
        {filesLoading ? (
          <p className="text-gray-500">Loading files...</p>
        ) : files.length === 0 ? (
          <p className="text-gray-500">No files here</p>
        ) : (
          <div className="grid grid-cols-1  sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-h-[70vh] overflow-y-auto pr-2">
            {files.map((file) => (
              <div
                key={file.id}
                className="card bg-base-100 border rounded border-gray-100 shadow-sm hover:shadow-md transition relative"
              >
                <div className="absolute top-2 right-2">
                  <DriveOptionsFile file={file} mode="drive" />
                </div>

                <figure className="px-4 pt-6">
                  <FilePreview file={file} title={file.display_name} />
                </figure>

                <div className="card-body items-center text-center">
                  <h2 className="card-title text-base truncate w-full">
                    {file.display_name}
                  </h2>
                  <p className="text-sm text-gray-500">File preview</p>
                  <div className="card-actions mb-4">
                    <button className="btn btn-primary btn-sm">Open</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default FolderView;