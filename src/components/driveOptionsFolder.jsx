import React, { useRef, useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { useQueryClient } from "@tanstack/react-query";

function DriveOptionsFolder({ folder, startEditing, mode = "drive" }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const queryClient = useQueryClient();

  const handleToggleDropdown = () => {
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

  const handleFolderCopy = async (folder) => {
    try {
      const res = await axios.post(
        `http://localhost:8800/folders/${folder.id}/copy`
      );

      if (res.data?.folder) {
        queryClient.setQueryData(
          ["folders", folder.parent_id || "root"],
          (oldFolders = []) => [...oldFolders, res.data.folder]
        );

        toast.success("Folder copied successfully");
      } else {
        toast.error("Failed to copy folder");
      }
    } catch (err) {
      console.error("Folder copy error:", err);
      toast.error("Failed to copy folder");
    }
  };

  const handleFolderDelete = async (folder) => {
    try {
      const res = await axios.put(
        `http://localhost:8800/folders/${folder.id}/delete`
      );

      if (res.data?.folder) {
        const deletedFolder = res.data.folder;

        queryClient.setQueryData(
          ["folders", folder.parent_id || "root"],
          (oldFolders = []) => oldFolders.filter((f) => f.id !== folder.id)
        );

        queryClient.setQueryData(["trashFolders"], (oldTrash = []) => [
          ...oldTrash,
          deletedFolder,
        ]);

        toast.success("Folder moved to trash");
      } else {
        toast.error("Failed to delete folder");
      }
    } catch (err) {
      console.error("Folder delete error:", err);
      toast.error("Failed to delete folder");
    }
  };

  const handleFolderRestore = async (folder) => {
    try {
      const res = await axios.put(
        `http://localhost:8800/folders/${folder.id}/restore`
      );

      if (res.data?.folder) {
        const restoredFolder = res.data.folder;

        queryClient.setQueryData(["trashFolders"], (oldTrash = []) =>
          oldTrash.filter((f) => f.id !== folder.id)
        );

        queryClient.setQueryData(
          ["folders", folder.parent_id || "root"],
          (oldFolders = []) => [...oldFolders, restoredFolder]
        );

        toast.success("Folder restored successfully");
      } else {
        toast.error("Failed to restore folder");
      }
    } catch (err) {
      console.error("Folder restore error:", err);
      toast.error("Failed to restore folder");
    }
  };

  const handleFolderRename = async (folder) => {
    const newName = prompt("Enter new folder name:", folder.display_name);

    if (!newName || newName.trim() === "") return;

    try {
      const res = await axios.put(
        `http://localhost:8800/folders/${folder.id}/rename`,
        {
          newName,
        }
      );

      if (res.data?.folder) {
        const updatedFolder = res.data.folder;

        queryClient.setQueryData(
          ["folders", folder.parent_id || "root"],
          (oldFolders = []) =>
            oldFolders.map((f) => (f.id === folder.id ? updatedFolder : f))
        );

        toast.success("Folder renamed successfully");
      } else {
        toast.error("Failed to rename folder");
      }
    } catch (err) {
      console.error("Folder rename error:", err);
      toast.error("Failed to rename folder");
    }
  };

  return (
    <div className="relative">
      <button onClick={handleToggleDropdown}>
        <img src="/dotsCard.png" alt="options" className="w-6 h-6" />
      </button>
      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute bg-white right-0 top-8 p-2 rounded-lg shadow-lg z-50 w-48 max-h-60 overflow-y-auto"
        >
          {mode === "drive" ? (
            <>
              <span
                onClick={() => handleFolderRename(folder)}
                className="block cursor-pointer hover:bg-gray-100 p-2 rounded"
              >
                Rename
              </span>
              <span
                onClick={() => handleFolderCopy(folder)}
                className="block cursor-pointer hover:bg-gray-100 p-2 rounded"
              >
                Make a copy
              </span>
              <span
                onClick={() => handleFolderDelete(folder)}
                className="block cursor-pointer hover:bg-gray-100 p-2 rounded"
              >
                Trash
              </span>
            </>
          ) : (
            <span
              onClick={() => handleFolderRestore(folder)}
              className="block cursor-pointer hover:bg-gray-100 p-2 rounded"
            >
              Restore
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default DriveOptionsFolder;
