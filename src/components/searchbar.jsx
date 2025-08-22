import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

function Searchbar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const handleSearch = async (e) => {
    const searchTerm = e.target.value;
    setQuery(searchTerm);

    if (searchTerm.trim() === "") {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    try {
      const res = await axios.get(
        `http://localhost:8800/files/search?q=${searchTerm}`
      );
      setResults(res.data);
      setShowDropdown(true);
    } catch (err) {
      console.error("Search error:", err);
    }
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

  return (
    <div className="relative sm:w-96 w-20" ref={dropdownRef}>
      <input
        type="text"
        value={query}
        onChange={handleSearch}
        placeholder="Search in Drive"
        className=" outline-none px-4 py-2 border w-150 rounded-3xl"
      />

      {showDropdown && results.length > 0 && (
        <ul className="absolute left-0 right-0 bg-white border w-150 border-gray-200 mt-2 rounded-lg shadow-lg max-h-60 overflow-y-auto z-50">
          {results.map((file) => (
            <li
              key={file.id}
              className="px-4 py-2 cursor-pointer hover:bg-gray-100"
              onClick={() => {
                setQuery(file.display_name);
                setShowDropdown(false);
              }}
            >
              {file.display_name}{" "}
              <span className="text-xs text-gray-500">
                ({file.mime_type?.split("/")[1] || "file"})
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Searchbar;