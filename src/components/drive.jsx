import React, { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Sidebar from "./sidebar";
import axios from "axios";
import Card from "./card";
import DriveOptionsFolder from "./driveOptionsFolder";
import { useNavigate } from "react-router-dom";

function Drive() {
  const queryClient = useQueryClient();
  const [currentFolder, setCurrentFolder] = useState(null);
  const navigate = useNavigate();

  const { data: files = [], isLoading: isFilesLoading } = useQuery({
    queryKey: ["files", "root"],
    queryFn: async () => {
      const res = await axios.get("http://localhost:8800/files?folderId=root");
      return res.data;
    },
  });

  const { data: folders = [], isLoading: isFoldersLoading } = useQuery({
    queryKey: ["folders", "root"],
    queryFn: async () => {
      const res = await axios.get("http://localhost:8800/folders", {
        params: { parentId: null },
      });
      return res.data;
    },
  });

  const getPublicUrl = (fileName) => {
    const baseUrl =
      "https://lpkjxvwpjccxnfxobibz.supabase.co/storage/v1/object/public/my-bucket/uploads/";
    return baseUrl + fileName;
  };

  return (
    <>
      <div className="flex">
        <Sidebar
          className="hidden"
          currentFolderId={currentFolder}
          onUpload={(file) => handleDriveUpload(file)}
        />

        <div className="flex-1 ">
          <div className="sm:p-6 p-2 sm:text-base text-[10px]">
            <div className="pt-[10px] w-full pl-116 bg-white z-40 px-3 py-2 ">
              <button className="rounded-3xl">
                <section className="flex gap-2 ">
                  <h1 className="sm:text-2xl ml-auto text-[10px]">My Drive</h1>
                </section>
              </button>
            </div>
            <div className="flex-1 flex flex-col h-[calc(100vh-64px)] mt-2">
              <div className="space-y-16">
                <div className="">
                  <div className="mt-8">
                    <label className="pl-120 text-lg font-semibold">
                      Folders
                    </label>
                    <div
                      className="grid grid-cols-1 sm:grid-cols-3 
                      md:grid-cols-4 lg:grid-cols-5 gap-4 mt-4 mb-4 max-h-72 overflow-y-auto pr-2"
                    >
                      {folders?.map((folder) => (
                        <li
                          key={folder.id}
                          onDoubleClick={() =>
                            navigate(`/drive/folders/${folder.id}`)
                          }
                          className="font-medium border border-gray-200 shadow-sm rounded-lg
                           bg-sky-50 p-3 flex items-center justify-between
                            hover:bg-sky-100 cursor-pointer text-xs sm:text-sm"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <img
                              src="/open-folder.png"
                              alt=""
                              className="w-4 h-4 sm:w-6 sm:h-6"
                            />
                            <span className="truncate">{folder.name}</span>
                          </div>
                          <DriveOptionsFolder folder={folder} mode="drive" />
                        </li>
                      ))}
                    </div>
                  </div>
                </div>
                <ul className="absolute left-2 ">
                  <label htmlFor="" className="sm:ml-190 ml-23 font-bold text-xl">
                    Files
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-5 sm:gap-12 mt-6 sm:max-h-80 max-h-250 sm:px-0 px-26 sm:overflow-y-auto overflow-x-auto rounded-3xl p-2 sm:p-4">
                    {files
                      .filter((file) => !file.is_deleted)
                      .map((file) => (
                        <Card
                          key={file.id}
                          file={file}
                          title={file.name}
                          description="File preview"
                          imageUrl={file.preview || getPublicUrl(file.name)}
                        />
                      ))}
                  </div>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Drive;
