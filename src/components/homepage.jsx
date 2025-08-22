import React, { useState } from "react";
import Navbar from "./navbar";
import Sidebar from "./sidebar.jsx";
import Signup from "./signup.jsx";

function Homepage() {
  const [showSignup, setShowSignup] = useState(false);

  return (
    <>
      <div className="flex flex-col sm:flex-row">
        <section className="sm:w-auto w-full">
          <Sidebar />
        </section>

        <div className="sm:p-6 p-4 space-y-6 text-center items-center ml-0 sm:ml-20 mt-10 sm:mt-20 justify-center">
          <h1 className="text-4xl sm:text-6xl ">Welcome to Drive</h1>
          <section className="text-3xl sm:text-7xl ">
            Keep Your files safe and private
          </section>
          <section className="text-base sm:text-xl mt-2">
            With Google Drive's end-to-end encrypted cloud storage, no one but
            you and the people you choose can access your files. <br />
            Here you can create your account
          </section>

          <button
            onClick={() => setShowSignup(true)}
            className="bg-black text-white py-2 px-6 rounded mt-4 hover:opacity-90"
          >
            Create an Account
          </button>
        </div>
      </div>

      {showSignup && (
        <Signup
          setShowSignup={setShowSignup}
          setShowLogin={() => {}}
          onAuthed={() => {}}
        />
      )}
    </>
  );
}

export default Homepage;