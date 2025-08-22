import React, { useState } from "react";
import Searchbar from "./searchbar";
import Login from "./login";
import Signup from "./signup";
import api from "../api";
import toast from "react-hot-toast";
import { useAuth } from "../context/useAuth";

function Navbar() {
  const { currentUser, setCurrentUser, fetchUser } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  const handleLogout = async () => {
    try {
      await api.post("/logout");
      setCurrentUser(null);
      setMenuOpen(false);
      toast.success("Logged out");
    } catch {
      toast.error("Logout failed");
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row w-full bg-white border-b border-gray-300">
        <div className="flex items-center justify-between px-4 py-2 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <img src="/drive.png" className="w-10 h-10" alt="Drive" />
            <h1 className="text-lg sm:text-xl font-semibold">Cloud Drive</h1>
          </div>

          <button
            className="sm:hidden flex items-center justify-center w-8 h-8 border rounded"
            onClick={() => setMobileMenu((prev) => !prev)}
          >
            ☰
          </button>
        </div>

        <div className="hidden sm:flex flex-1 items-center justify-between px-6 py-2">
          <section className="flex-1 max-w-md">
            <Searchbar />
          </section>

          <div className="flex items-center gap-6">
            <div className="flex gap-4">
              <a
                href="https://support.google.com/drive/answer/2450387?hl=en"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src="/question.png" className="w-6 h-6" alt="Help" />
              </a>
              <a
                href="https://drive.google.com/drive/u/0/settings"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src="/setting.png" className="w-6 h-6" alt="Settings" />
              </a>
              <a
                href="https://gemini.google.com/app"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src="/gemini-color.png" className="w-6 h-6" alt="Gemini" />
              </a>
              <img src="/dots.png" className="w-6 h-6" alt="More" />
            </div>

            {!currentUser ? (
              <div className="flex gap-2">
                <button
                  className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 text-sm"
                  onClick={() => {
                    setShowLogin(true);
                    setShowSignup(false);
                  }}
                >
                  Login
                </button>
                <button
                  className="bg-white text-black hover:bg-gray-200 border border-gray-300 px-3 py-2 rounded text-sm"
                  onClick={() => {
                    setShowSignup(true);
                    setShowLogin(false);
                  }}
                >
                  Signup
                </button>
              </div>
            ) : (
              <div className="relative">
                <div
                  onClick={() => setMenuOpen((v) => !v)}
                  className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center cursor-pointer"
                >
                  {currentUser.email
                    ? currentUser.email.charAt(0).toUpperCase()
                    : "U"}
                </div>
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-44 bg-white text-gray-800 rounded shadow z-50">
                    <div className="px-3 py-2 text-sm border-b truncate">
                      {currentUser.email}
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {mobileMenu && (
          <div className="sm:hidden flex flex-col gap-3 px-4 py-2 border-t">
            <Searchbar />
            {!currentUser ? (
              <div className="flex flex-col gap-2">
                <button
                  className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 text-sm"
                  onClick={() => {
                    setShowLogin(true);
                    setShowSignup(false);
                    setMobileMenu(false);
                  }}
                >
                  Login
                </button>
                <button
                  className="bg-white text-black hover:bg-gray-200 border border-gray-300 px-3 py-2 rounded text-sm"
                  onClick={() => {
                    setShowSignup(true);
                    setShowLogin(false);
                    setMobileMenu(false);
                  }}
                >
                  Signup
                </button>
              </div>
            ) : (
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-3 py-2 rounded text-sm"
              >
                Logout
              </button>
            )}
          </div>
        )}
      </div>

      {showSignup && (
        <div className="absolute left-[46%]">
          <Signup
            setShowSignup={setShowSignup}
            setShowLogin={setShowLogin}
            onAuthed={() => {
              fetchUser();
              setShowSignup(false);
            }}
          />
        </div>
      )}
      {showLogin && (
        <div className="absolute top-[30%] left-[30%]">
          <Login
            setShowLogin={setShowLogin}
            setShowSignup={setShowSignup}
            onAuthed={() => {
              fetchUser();
              setShowLogin(false);
            }}
          />
        </div>
      )}
    </>
  );
}

export default Navbar;