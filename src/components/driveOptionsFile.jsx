import React, { useRef, useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../context/useAuth";

function DriveOptionsFile({ file, startEditing, mode }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isPublic, setIsPublic] = useState(true);
  const [emails, setEmails] = useState("");
  const [shareLink, setShareLink] = useState("");
  const dropdownRef = useRef(null);
  const queryClient = useQueryClient();
  const { currentUser } = useAuth();
  const [dropdownPosition, setDropdownPosition] = useState("right");

  const handleToggleDropdown = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (rect.right + 240 > window.innerWidth) {
      setDropdownPosition("left");
    } else {
      setDropdownPosition("right");
    }
    setShowDropdown((prev) => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDownload = async (fileId, fileName) => {
    const toastId = toast.loading("Preparing download...");

    try {
      const response = await fetch(
        `http://localhost:8800/files/${fileId}/download`
      );

      if (!response.ok) {
        const errorJson = await response.json().catch(() => ({}));
        console.error("Backend error:", errorJson.error || "Unknown error");
        toast.dismiss(toastId); 
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = fileName || "download";
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);

      toast.dismiss(toastId);
    } catch (err) {
      console.error("Download error:", err);
      toast.dismiss(toastId); 
      toast.error("Download failed");
    }
  };

  const handleCopy = async () => {
    try {
      const res = await axios.post(
        `http://localhost:8800/files/${file.id}/copy`
      );

      if (res.data?.file) {
        queryClient.setQueryData(
          ["files", file.folder_id || "root"],
          (oldFiles = []) => [
            ...oldFiles,
            res.data.file, 
          ]
        );

        toast.success("File copied successfully");
      } else {
        toast.error("Failed to copy file");
      }
    } catch (err) {
      console.error("Copy error:", err);
      toast.error("Failed to copy file");
    }
  };

  const handleDelete = async () => {
    try {
      const res = await axios.put(
        `http://localhost:8800/files/${file.id}/delete`
      );

      if (res.data?.file) {
        const deletedFile = res.data.file;

        queryClient.setQueryData(
          ["files", file.folder_id || "root"],
          (oldFiles = []) => oldFiles.filter((f) => f.id !== file.id)
        );

        queryClient.setQueryData(["trashFiles"], (oldTrash = []) => [
          ...oldTrash,
          deletedFile,
        ]);

        toast.success("File moved to trash");
      } else {
        toast.error("Failed to delete file");
      }
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete file");
    }
  };

  const handleRestore = async () => {
    try {
      const res = await axios.put(
        `http://localhost:8800/files/${file.id}/restore`
      );
      if (res.data?.file) {
        queryClient.setQueryData(["trashFiles"], (old = []) =>
          old.filter((f) => f.id !== file.id)
        );
        queryClient.setQueryData(["files"], (old = []) => [
          ...old,
          res.data.file,
        ]);
        toast.success("File restored successfully");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to restore file");
    }
  };

  const handleShare = async () => {
    if (!currentUser) return toast.error("You must login");
    try {
      const res = await axios.post(
        "http://localhost:8800/share",
        {
          fileId: file.id,
          isPublic,
          sharedWith: isPublic
            ? null
            : emails
                .split(",")
                .map((e) => e.trim())
                .filter(Boolean),
        },
        {
          withCredentials: true,
        }
      );

      if (res.data?.link) {
        setShareLink(res.data.link);
        toast.success("Share link created!");
      } else {
        toast.error("Failed to create share link");
      }
    } catch (err) {
      console.error("Share error:", err);
      toast.error("Error while creating share link");
    }
  };

  return (
    <div className="relative">
      <button onClick={(e) => handleToggleDropdown(e)}>
        <img src="/dotsCard.png" alt="" className="w-6 h-6" />
      </button>
      {showDropdown && (
        <div
          ref={dropdownRef}
          className={`absolute bg-gray-50 top-0 p-2 rounded shadow-lg z-10 w-60 space-y-1 ${
            dropdownPosition === "right" ? "left-full ml-2" : "right-full mr-2"
          }`}
        >
          {mode === "drive" ? (
            <>
              <span
                onClick={() => {
                  console.log("Downloading file:", file.id, file.display_name);
                  handleDownload(file.id, file.display_name);
                }}
                className="block cursor-pointer hover:bg-gray-200 p-1 rounded"
              >
                Download
              </span>
              <span
                onClick={() => {
                  if (startEditing) startEditing();
                }}
                className="block cursor-pointer hover:bg-gray-200 p-1 rounded"
              >
                Rename
              </span>
              <span
                onClick={() => {
                  setShowDropdown(false);
                  setShowShareModal(true);
                }}
                className="block cursor-pointer hover:bg-gray-200 p-1 rounded"
              >
                Share
              </span>
              <span
                onClick={handleCopy}
                className="block cursor-pointer hover:bg-gray-200 p-1 rounded"
              >
                Make a Copy
              </span>
              <span
                onClick={handleDelete}
                className="block cursor-pointer hover:bg-gray-200 p-1 rounded"
              >
                Trash
              </span>
            </>
          ) : (
            <span
              onClick={handleRestore}
              className="block cursor-pointer hover:bg-gray-200 p-1 rounded"
            >
              Restore
            </span>
          )}
        </div>
      )}

      {showShareModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-opacity-50 z-50">
          <div className="bg-white rounded-xl p-6 w-[400px] shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Share File</h2>

            <div className="mb-3">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={isPublic}
                  onChange={() => setIsPublic(true)}
                />
                Anyone with the link
              </label>
              <label className="flex items-center gap-2 mt-2">
                <input
                  type="radio"
                  checked={!isPublic}
                  onChange={() => setIsPublic(false)}
                />
                Restricted (specific emails)
              </label>
            </div>

            {!isPublic && (
              <input
                type="text"
                placeholder="Enter emails separated by commas"
                value={emails}
                onChange={(e) => setEmails(e.target.value)}
                className="w-full border rounded p-2 mb-3"
              />
            )}

            <div className="flex justify-end gap-2">
              <button
                className="px-3 py-1 border rounded"
                onClick={() => setShowShareModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-3 py-1 bg-blue-600 text-white rounded"
                onClick={handleShare}
              >
                Create Link
              </button>
            </div>

            {shareLink && (
              <div className="mt-4">
                <p className="text-sm font-medium">Shareable Link:</p>
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="text"
                    value={shareLink}
                    readOnly
                    className="w-full border rounded p-2 text-sm"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(shareLink);
                      toast.success("Link copied!");
                    }}
                    className="px-2 py-1 bg-gray-200 rounded"
                  >
                    Copy
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default DriveOptionsFile;
