import React, { useState } from "react";
import api from "../api";
import toast from "react-hot-toast";

const Login = ({ setShowLogin, setShowSignup, onAuthed }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.error("Enter email & password");
    try {
      await api.post("/login", { email, password });
      toast.success("Logged in successfully!");
      setShowLogin(false);
      onAuthed && onAuthed();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to login");
    }
  };

  const switchToSignup = () => {
    setShowLogin(false);
    setShowSignup(true);
  };

  return (
    <div className="fixed inset-0 pt-40 pl-150 z-50 backdrop-blur-sm">
      <div className="bg-white w-85 p-8 rounded shadow-md ">
        <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>
        <button
          onClick={() => setShowLogin(false)}
          className="absolute mx-69 top-42 right-80 text-gray-500 hover:text-gray-700 font-bold"
        >
          ✕
        </button>
        <form onSubmit={handleLogin} className="flex flex-col space-y-2">
          <label>Email</label>
          <input
            className="border-2 border-gray-500 outline-none p-2 rounded"
            value={email}
            placeholder="Enter your email"
            onChange={(e) => setEmail(e.target.value)}
          />
          <label>Password</label>
          <input
            className="border-2 border-gray-500 outline-none p-2 rounded"
            placeholder="Enter your password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="bg-gray-950 mt-2 text-white py-2 rounded hover:bg-black">
            Login
          </button>
          <div className="flex mt-2">
            Create an account?
            <span
              onClick={switchToSignup}
              className="text-blue-500 mx-1 cursor-pointer hover:underline"
            >
              Signup
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
