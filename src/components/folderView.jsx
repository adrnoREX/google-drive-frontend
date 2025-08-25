import React, { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Sidebar from "./sidebar";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import FilePreview from "./filePreview";
import DriveOptionsFile from "./driveOptionsFile";
import toast from "react-hot-toast";

function FolderView() {
  const { id } = useParams();
  const folderId = id || "root";
  const queryClient = useQueryClient();

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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-h-[70vh] overflow-y-auto pr-2">
            {files.map((file) => (
              <FileCard key={file.id} file={file} queryClient={queryClient} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FileCard({ file, queryClient }) {
  const [fileName, setFileName] = useState(file.display_name);
  const [editing, setEditing] = useState(false);
  const inputRef = useRef(null);
  const wrapperRef = useRef(null);

  const handleRenameInline = async () => {
    if (!fileName || fileName.trim() === "") return;
    try {
      await axios.put(`http://localhost:8800/files/${file.id}/rename`, {
        newName: fileName,
      });
      toast.success("File renamed successfully");
      setEditing(false);
      queryClient.invalidateQueries(["files"]);
    } catch (err) {
      toast.error("Failed to rename file");
    }
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setEditing(false);
      }
    }
    if (editing) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [editing]);

  const openPreview = () => {
    document.getElementById(`preview_modal_${file.id}`).showModal();
  };

  return (
    <>
      <div className="card bg-base-100 border rounded border-gray-100 shadow-sm hover:shadow-md transition relative">
        <div className="absolute top-2 right-2">
          {!file.isUploading && (
            <DriveOptionsFile
              file={file}
              mode="drive"
              startEditing={() => setEditing(true)}
            />
          )}
        </div>

        <figure className="px-4 pt-6 flex items-center justify-center min-h-[6rem]">
          {file.isUploading ? (
            <div className="flex flex-col items-center justify-center">
              <div className="loading loading-spinner text-primary"></div>
              <p className="text-sm text-gray-500 mt-2"></p>
            </div>
          ) : (
            <div className="mb-2 brightness-50 rounded-lg h-64 w-58">
              <FilePreview file={file} />
            </div>
          )}
        </figure>

        <div className="card-body items-center text-center">
          {file.isUploading ? (
            <h2 className="text-sm text-gray-500 mt-2">Uploading...</h2>
          ) : editing ? (
            <div ref={wrapperRef} className="flex items-center mt-2 w-full">
              <input
                ref={inputRef}
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleRenameInline();
                }}
                className="text-sm font-semibold truncate border-b border-gray-300 focus:outline-none w-full"
              />
              <button
                onClick={handleRenameInline}
                className="ml-2 btn btn-sm btn-primary"
              >
                Apply
              </button>
            </div>
          ) : (
            <h2
              className="card-title text-base truncate w-full cursor-pointer"
              onClick={() => setEditing(true)}
            >
              {fileName}
            </h2>
          )}

          {!file.isUploading && (
            <div className="card-actions mb-4">
              <button
                className="btn bg-gray-500 p-2 px-4 rounded mt-2 hover:bg-gray-600"
                onClick={openPreview}
              >
                Open
              </button>
            </div>
          )}
        </div>
      </div>

      {!file.isUploading && (
        <dialog
          id={`preview_modal_${file.id}`}
          className="modal w-1/2 absolute top-[30%] left-[25%] rounded-2xl"
        >
          <div className="modal-box py-4 px-8">
            <div className="modal-action flex justify-between">
              <h3 className="font-bold text-lg mb-2">{fileName}</h3>
              <form method="dialog">
                <button className="btn">Close</button>
              </form>
            </div>
            <div className="w-[100%] h-[100%] border mb-4 rounded-lg p-2 flex items-center justify-center">
              <FilePreview file={file} />
            </div>
          </div>
        </dialog>
      )}
    </>
  );
}

export default FolderView;
