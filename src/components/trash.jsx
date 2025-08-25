import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Sidebar from "./sidebar";
import Card from "./card";
import axios from "axios";
import toast from "react-hot-toast";
import { useEffect } from "react";
import { useState } from "react";
import { useRef } from "react";

function Trash() {
  const queryClient = useQueryClient();
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const dropdownRef = useRef(null);

  const { data: files = [], isLoading: filesLoading } = useQuery({
    queryKey: ["trashFiles"],
    queryFn: async () => {
      const res = await axios.get("http://localhost:8800/files/trash");
      return res.data;
    },
  });

  const { data: folders = [], isLoading: foldersLoading } = useQuery({
    queryKey: ["trashFolders"],
    queryFn: async () => {
      const res = await axios.get("http://localhost:8800/folders/trash");
      return res.data;
    },
  });

  const getPublicUrl = (fileName) => {
    const baseUrl =
      "https://lpkjxvwpjccxnfxobibz.supabase.co/storage/v1/object/public/my-bucket/uploads/";
    return baseUrl + fileName;
  };

  const handleEmptyTrash = async () => {
    try {
      await axios.delete("http://localhost:8800/files/trash/empty");
      await axios.delete("http://localhost:8800/folders/trash/empty");
      toast.success("Deleted Permanently");
      queryClient.setQueryData(["trashFiles"], []);
      queryClient.setQueryData(["trashFolders"], []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to empty trash");
    }
  };

  const handleRestoreFolder = async (id) => {
    try {
      await axios.put(`http://localhost:8800/folders/${id}/restore`);
      toast.success("Folder restored");
      queryClient.invalidateQueries(["trashFolders"]);
    } catch (err) {
      console.error(err);
      toast.error("Failed to restore folder");
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (filesLoading || foldersLoading)
    return <div className="px-4">Loading...</div>;

  return (
    <div className="flex">
      <Sidebar />
      <div className="sm:p-4 p-2 w-full">
        <div className="flex px-4 justify-between items-center">
          <h2 className="text-2xl font-semibold">Trash</h2>
          <button className="btn btn-sm btn-error" onClick={handleEmptyTrash}>
            Empty Trash
          </button>
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3">Folders</h3>
          {folders.length === 0 ? (
            <p className="text-gray-500 text-center">No folders in trash</p>
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {folders.map((folder) => (
                <li
                  key={folder.id}
                  className="flex items-center justify-between bg-gray-100 rounded-lg p-3 shadow-sm"
                >
                  <div className="flex items-center gap-2">
                    <img src="/open-folder.png" alt="" className="w-6 h-6" />
                    <span className="font-medium truncate">{folder.name}</span>
                  </div>

                  <div className="relative" ref={dropdownRef}>
                    <button
                      className="rounded-full hover:bg-gray-200 p-1"
                      onClick={() =>
                        setOpenDropdownId(
                          openDropdownId === folder.id ? null : folder.id
                        )
                      }
                    >
                      <img
                        src="/dotsCard.png"
                        alt="options"
                        className="w-5 h-5"
                      />
                    </button>
                    {openDropdownId === folder.id && (
                      <div className="absolute right-0 bg-white shadow-md rounded-md mt-2 w-32 z-50">
                        <button
                          onClick={() => handleRestoreFolder(folder.id)}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                        >
                          Restore
                        </button>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-3">Files</h3>
          {files.length === 0 ? (
            <p className="text-gray-500 text-center">No files in trash</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {files.map((file) => (
                <Card
                  key={file.id}
                  file={file}
                  title={file.display_name}
                  description="File preview"
                  imageUrl={file.preview || getPublicUrl(file.display_name)}
                  mode="trash"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Trash;
