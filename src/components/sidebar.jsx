import React, { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

function formatBytes(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function Sidebar({ currentFolder, className = "" }) {
  const [showDropdown1, setShowDropdown1] = useState(false);
  const [showDropdown2, setShowDropdown2] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [storage, setStorage] = useState({ used: 0, total: 1 });
  const fileInputRef = useRef(null);
  const dropdownRef = useRef(null);
  const dialogRef = useRef(null);
  const queryClient = useQueryClient();
  const { id } = useParams();

  const createFolder = useMutation({
    mutationFn: async (name) => {
      await axios.post("http://localhost:8800/folders", { name });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["folders"]);
    },
  });

  const handleCreate = () => {
    if (folderName.trim()) {
      createFolder.mutate(folderName);
      setFolderName("");
    }
  };

  const uploadFilesMutation = useMutation({
    mutationFn: async ({ files, parentId }) => {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("files", file);
      });
      if (parentId) formData.append("parentId", parentId);

      const res = await axios.post("http://localhost:8800/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
    onMutate: async ({ files, parentId }) => {
      await queryClient.cancelQueries(["files", parentId || "root"]);
      const prevFiles = queryClient.getQueryData(["files", parentId || "root"]);

      // ✅ Correctly map files
      const newFiles = files.map((file) => ({
        id: Date.now() + Math.random(),
        name: file.name,
        preview: URL.createObjectURL(file),
        isUploading: true,
      }));

      queryClient.setQueryData(["files", parentId || "root"], (old = []) => [
        ...old,
        ...newFiles,
      ]);

      return { prevFiles };
    },
    onSuccess: (_, { parentId }) => {
      // ✅ Refresh only the correct folder
      queryClient.invalidateQueries(["files", parentId || "root"]);
    },
  });

  const openDialog = () => {
    dialogRef.current.showModal();
  };

  const closeDialog = () => {
    dialogRef.current.close();
    setFolderName("");
  };

  const handleToggleDropdown1 = () => {
    setShowDropdown1((prev) => !prev);
  };
  const handleToggleDropdown2 = () => {
    setShowDropdown2((prev) => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown1(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleExternalLinkClick = (e, url) => {
    e.preventDefault();
    setShowDropdown1(false);

    setTimeout(() => {
      window.open(url, "_blank");
    }, 100);
  };

  const handleExternalLinkClick2 = (e, url) => {
    e.preventDefault();
    setShowDropdown2(false);
    setTimeout(() => {
      window.open(url, "_blank");
    }, 100);
  };

  const handleDriveUpload = async (files) => {
    const formData = new FormData();

    Array.from(files).forEach((file) => formData.append("files", file));
    formData.append("parentId", "root");

    try {
      const optimisticFiles = Array.from(files).map((file) => ({
        id: Date.now() + Math.random(),
        name: file.name,
        preview: URL.createObjectURL(file),
        isUploading: true,
      }));

      queryClient.setQueryData(["files", "root"], (old = []) => [
        ...old,
        ...optimisticFiles,
      ]);

      const res = await axios.post("http://localhost:8800/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      queryClient.setQueryData(["files", "root"], (old = []) => [
        ...old.filter((f) => !f.isUploading),
        ...res.data.uploaded,
      ]);
      toast.success("Files uploaded successfully");
    } catch (err) {
      toast.error("Upload failed");

      queryClient.setQueryData(["files", "root"], (old = []) =>
        old.filter((f) => !f.isUploading)
      );
    }
  };

  const handleFolderUpload = async (files, folderId) => {
    if (!folderId) {
      toast.error("No folder selected!");
      return;
    }

    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append("files", file));
    formData.append("parentId", folderId);

    try {
      const optimisticFiles = Array.from(files).map((file) => ({
        id: Date.now() + Math.random(),
        name: file.name,
        preview: URL.createObjectURL(file),
        isUploading: true,
      }));

      queryClient.setQueryData(["files", folderId], (old = []) => [
        ...old,
        ...optimisticFiles,
      ]);

      const res = await axios.post("http://localhost:8800/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      queryClient.setQueryData(["files", folderId], (old = []) => [
        ...old.filter((f) => !f.isUploading),
        ...res.data.uploaded,
      ]);

      toast.success("Files uploaded successfully");
    } catch (err) {
      toast.error("Upload failed");
      queryClient.setQueryData(["files", folderId], (old = []) =>
        old.filter((f) => !f.isUploading)
      );
    }
  };

  useEffect(() => {
    axios
      .get("http://localhost:8800/storage/info")
      .then((res) => setStorage(res.data))
      .catch((err) => console.error(err));
  }, []);

  const percentUsed = (storage.used / storage.total) * 100;

  return (
    <>
      <div
        className={`${className}border-1  border-gray-100 sm:pl-0 pl-1 h-full sm:pr-0 pr-1 sticky sm:w-65 w-10 sm:px-4 px-0 pt-10 pb-8 sm:text-base text-[10px] font-light  rounded`}
      >
        <button
          onClick={handleToggleDropdown1}
          className="sm:py-4 py-2 sm:px-5 px-2 sm:mx-6 sm:pl-4 flex  shadow-sm sm:gap-4 gap-2 sm:border-b-2 sm:border-t-1
           sm:border-t-gray-100 sm:border-b-gray-300 sm:border-l-2 sm:border-r-2 sm:border-gray-200  rounded-2xl text-gray-800 "
        >
          <img
            src="/plus.png"
            className="sm:w-5 w-3 sm:h-5 h-3"
            style={{
              filter: "brightness(0)",
            }}
            alt=""
          />{" "}
          <section className="sm:block hidden">New</section>
        </button>

        {showDropdown1 && (
          <div
            ref={dropdownRef}
            className="absolute top-18 left-4 bg-white rounded shadow-lg border-b-2
             border-t-1 border-t-gray-100 border-b-gray-300 border-l-2 border-r-2 border-gray-200 sm:w-70 w-1/2 z-10 "
          >
            <div className="sidebar-container ">
              <div
                className="px-4 mb-1 mt-4 flex gap-2 hover:bg-gray-100 rounded-md cursor-pointer"
                onClick={openDialog}
              >
                <img src="/plus new.png" alt="" className="w-4 h-4" />
                Create New Folder
              </div>

              {!id ? (
                <>
                  <div className="px-4 mb-2 mt-2 hover:bg-gray-100 rounded-md">
                    <div
                      onClick={() => fileInputRef.current.click()}
                      className="flex gap-2 cursor-pointer"
                    >
                      <img src="/file.png" alt="" className="w-4 h-4" />
                      Upload Files 
                    </div>
                    <input
                      type="file"
                      multiple
                      ref={fileInputRef}
                      className="hidden"
                      onChange={async (e) => {
                        const files = e.target.files;
                        if (files.length === 0) return;
                        await handleDriveUpload(files);
                        e.target.value = null;
                        setShowDropdown1(false);
                      }}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="px-4 mb-2 mt-2 hover:bg-gray-100 rounded-md">
                    <div
                      onClick={() => fileInputRef.current.click()}
                      className="flex gap-2 cursor-pointer"
                    >
                      <img src="/file.png" alt="" className="w-4 h-4" />
                      Upload Files 
                    </div>
                    <input
                      type="file"
                      multiple
                      ref={fileInputRef}
                      className="hidden"
                      onChange={async (e) => {
                        const files = e.target.files;
                        if (files.length === 0) return;
                        await handleFolderUpload(files, id);
                        e.target.value = null;
                        setShowDropdown1(false);
                      }}
                    />
                  </div>
                </>
              )}
            </div>

            <dialog
              ref={dialogRef}
              className="modal absolute top-1/3 left-[45%] w-[22%] rounded-2xl"
            >
              <div className="modal-box p-6 space-y-2">
                <h3 className="font-bold text-lg">Create New Folder</h3>
                <input
                  type="text"
                  value={folderName}
                  placeholder="Folder Name"
                  onChange={(e) => setFolderName(e.target.value)}
                  className="border-2 rounded-md w-full py-2 px-3 mt-3"
                />
                <div className="modal-action flex justify-between mt-6">
                  <form method="dialog" className="modal-backdrop">
                    <button
                      onClick={closeDialog}
                      className="btn hover:bg-gray-200 p-2 rounded-lg"
                    >
                      Cancel
                    </button>
                  </form>
                  <form method="dialog" className="">
                    <button
                      onClick={handleCreate}
                      className="btn btn-primary hover:bg-gray-200 p-2 rounded-lg"
                    >
                      Create
                    </button>
                  </form>
                </div>
              </div>
            </dialog>

            <hr className="border-t-1 border-gray-400" />
            <div className="flex flex-col space-y-2">
              <a
                href="https://docs.google.com/document/u/0/"
                onClick={(e) =>
                  handleExternalLinkClick(
                    e,
                    "https://docs.google.com/document/u/0/"
                  )
                }
                className="px-4 mt-2 flex gap-2 hover:bg-gray-100 rounded-md cursor-pointer"
              >
                <img src="/google-docs.png" alt="" className="w-4 h-4" />
                Google Docs
              </a>
              <a
                href="https://docs.google.com/spreadsheets/u/0/"
                onClick={(e) =>
                  handleExternalLinkClick(
                    e,
                    "https://docs.google.com/spreadsheets/u/0/"
                  )
                }
                className="px-4 flex gap-2 hover:bg-gray-100 rounded-md cursor-pointer"
              >
                <img src="/google-sheets.png" alt="" className="w-4 h-4" />
                Google Sheets
              </a>
              <a
                href="https://docs.google.com/presentation/u/0/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 flex gap-2 hover:bg-gray-100 rounded-md cursor-pointer"
              >
                <img src="/google.png" alt="" className="w-4 h-4" />
                Google Slides
              </a>
              <a
                href="https://docs.google.com/forms/u/0/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 flex gap-2 hover:bg-gray-100 rounded-md cursor-pointer"
              >
                <img src="/google-forms.png" alt="" className="w-4 h-4" />
                Google Forms
              </a>
              <a
                href="https://sites.google.com/new"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 flex gap-2 hover:bg-gray-100 rounded-md cursor-pointer"
              >
                <img src="/google-sites.png" alt="" className="w-4 h-4" />
                Google Sites
              </a>
              <button
                className="text-left px-4 mb-2"
                onClick={handleToggleDropdown2}
                onMouseEnter={() => setShowDropdown2(true)}
              >
                More
              </button>
            </div>
          </div>
        )}

        {showDropdown2 && (
          <div
            onMouseEnter={() => setShowDropdown2(true)}
            onMouseLeave={() => setShowDropdown2(false)}
            className="flex flex-col space-y-2 absolute sm:top-79 top-70 sm:left-3 left-50 mx-1 bg-white rounded shadow-lg border-b-2 border-t-1 border-t-gray-100
                 border-b-gray-300 border-l-2  border-r-2 border-gray-200 sm:w-70 w-1/2 z-10 "
          >
            <a
              href="https://drawings.google.com"
              onClick={(e) =>
                handleExternalLinkClick2(e, "https://drawings.google.com")
              }
              className="px-4 mt-2 flex gap-2 hover:bg-gray-100 rounded-md cursor-pointer"
            >
              <img src="/google-drawings.png" alt="" className="w-4 h-4" />
              Google Drawings
            </a>
            <a
              href="https://www.google.com/maps/d/"
              onClick={(e) =>
                handleExternalLinkClick2(e, "https://www.google.com/maps/d/")
              }
              className="px-4 flex gap-2 hover:bg-gray-100 rounded-md cursor-pointer"
            >
              <img src="/google-maps.png" alt="" className="w-4 h-4" />
              Google Maps
            </a>
            <a
              href="https://vids.new"
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => handleExternalLinkClick2(e, "https://vids.new")}
              className="px-4 flex gap-2 mb-1 hover:bg-gray-100 rounded-md cursor-pointer"
            >
              <img src="/google-vids.png" alt="" className="w-4 h-4" />
              Google Vids
            </a>
            <a
              href="https://script.google.com/home"
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) =>
                handleExternalLinkClick2(e, "https://script.google.com/home")
              }
              className="px-4 flex gap-2 hover:bg-gray-100 rounded-md cursor-pointer"
            >
              <img src="/google-apps-script.png" alt="" className="w-4 h-4" />
              Google App Script
            </a>
            <a
              href="https://colab.research.google.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 flex gap-2 hover:bg-gray-100 rounded-md cursor-pointer"
            >
              <img src="/google-colab.png" alt="" className="w-4 h-4" />
              Google Colaboratory
            </a>
            <hr className="border-t-1 border-gray-400" />
            <a
              href="https://workspace.google.com/marketplace"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 -pt-1 mb-2 hover:bg-gray-100 rounded-md cursor-pointer"
            >
              Connect more apps
            </a>
          </div>
        )}
        <Link to="/" className="">
          <section className="mt-5  sm:mx-2 rounded-2xl p-1 flex hover:bg-gray-300 sm:gap-4 gap-2  sm:px-6">
            <img
              src="/hut.png"
              className="w-4 h-4 mt-1"
              style={{
                filter: "brightness(0)",
              }}
              alt=""
            />
            <section className="sm:block hidden">Home</section>
          </section>
        </Link>
        <Link to="/drive">
          <section className="sm:px-6  sm:mx-2 rounded-2xl p-1 flex sm:gap-4 gap-2 hover:bg-gray-300 mt-1">
            <img
              src="/google-drive.png"
              className="w-4 h-4 mt-1"
              style={{
                filter: "brightness(0)",
              }}
              alt=""
            />
            <section className="sm:block hidden">My Drive</section>
          </section>
        </Link>
        <Link to="/computer">
          <section className="sm:px-6  sm:mx-2  rounded-2xl p-1 flex sm:gap-4 gap-2 hover:bg-gray-300 mt-1">
            <img
              src="/computer.png"
              className="w-4 h-4 mt-1"
              style={{
                filter: "brightness(0)",
              }}
              alt=""
            />
            <section className="sm:block hidden">Computer</section>
          </section>
        </Link>
        <Link to="/trash">
          <section className="sm:px-6  sm:mx-2 rounded-2xl p-1 flex sm:gap-4 gap-2 hover:bg-gray-300 mt-1">
            <img
              src="/trash.png"
              className="w-4 h-4 mt-1"
              style={{
                filter: "brightness(0)",
              }}
              alt=""
            />
            <section className="sm:block hidden">Trash</section>
          </section>
        </Link>
        <Link to="/storage">
          <section className="sm:px-6  sm:mx-2 rounded-2xl p-1 flex sm:gap-4 gap-2 hover:bg-gray-300 mt-1">
            <img
              src="/cloud-storage.png"
              className="w-4 h-4 mt-1"
              style={{
                filter: "brightness(0)",
              }}
              alt=""
            />
            <section className="sm:block hidden">Storage</section>
          </section>
        </Link>
        <section className="sm:block hidden w-64 justify-between">
          <section className="py-4 px-8">
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div
                className="bg-green-500 h-2 rounded-full"
                style={{ width: `${percentUsed}%` }}
              ></div>
            </div>

            <p className="text-xs text-gray-600">
              {formatBytes(storage.used)} of {formatBytes(storage.total)} used
            </p>
          </section>
        </section>
      </div>
    </>
  );
}

export default Sidebar;
