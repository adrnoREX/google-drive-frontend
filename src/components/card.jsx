import React, { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import FilePreview from "./filePreview";
import DriveOptionsFile from "./driveOptionsFile";

function Card({ title, description, imageUrl, file, mode }) {
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
    } catch (err) {
      toast.error("Failed to rename file");
    }
  };

  const startEditing = () => {
    setEditing(true);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
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
      <div
        className="card rounded-xl bg-base-100 h-full image-full w-64 shadow-sm cursor-pointer"
        onDoubleClick={openPreview}
      >
        <div className="card-body bg-white relative">
          <div className="p-4 mb-2 rounded-lg h-64 w-64">
            <FilePreview file={file} />

            {editing ? (
              <div ref={wrapperRef} className="flex items-center mt-2">
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
              <h3
                className="mt-2 text-sm font-semibold truncate cursor-pointer"
                onClick={startEditing}
              >
                {fileName}
              </h3>
            )}
          </div>

          <div className="absolute top-5 right-0">
            <DriveOptionsFile
              file={file}
              startEditing={startEditing}
              mode={mode || "drive"}
              onToggle={(e) => handleToggleDropdown(e)} 
            />
          </div>

          <div className="px-4 pt-2 text-center">
            <h2 className="card-title">{description}</h2>
          </div>

          <div className="text-center mb-6">
            <button
              className="btn bg-gray-500 py-1 px-4 mt-2 rounded hover:bg-gray-800"
              onClick={openPreview}
            >
              Open
            </button>
          </div>
        </div>
      </div>

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
            <FilePreview file={file} className="" />
          </div>
        </div>
      </dialog>
    </>
  );
}

export default Card;
