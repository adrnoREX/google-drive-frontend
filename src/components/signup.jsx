import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import api from "../api";

const Signup = ({ setShowSignup, setShowLogin, onAuthed }) => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phnumber: "",
    dob: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setMessage("");

    const { name, email, password, phnumber, dob } = form;
    if (!name || !email || !password || !phnumber || !dob) {
      setMessage("Please fill all fields");
      return;
    }

    try {
      await api.post("/signup", form);
      toast.success("User registered successfully!");
      setForm({ name: "", email: "", password: "", phnumber: "", dob: "" });
      setShowSignup(false); 
      if (onAuthed) onAuthed();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.error || "Failed to signup. Try again.");
    }
  };

  const switchToLogin = () => {
    setShowSignup(false); 
    setShowLogin(true); 
  };

  return (
    <div className="fixed inset-0 pl-150 pt-10 z-50 backdrop-blur-sm">
      <div className="bg-white w-105 p-8 rounded shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-center">Signup</h2>
        
        <button
          onClick={() => setShowSignup(false)}
          className="absolute top-12 right-42 mx-87 text-gray-500 hover:text-gray-700 font-bold"
        >
          ✕
        </button>
        {message && <p className="mb-4 text-red-500 text-center">{message}</p>}

        <form onSubmit={handleSignup} className=" space-y-4">
          <div className="flex flex-col space-y-2">
            <label htmlFor="">Name</label>
            <input
              type="text"
              name="name"
              placeholder="Enter your name"
              value={form.name}
              onChange={handleChange}
              className="border-2 outline-none border-gray-500 p-2 rounded"
            />
            <label htmlFor="">Email</label>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className="border-2 outline-none border-gray-500 p-2 rounded"
            />
            <label htmlFor="">Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              className="border-2 outline-none border-gray-500 p-2 rounded"
            />
            <label htmlFor="">Contact</label>
            <input
              type="text"
              name="phnumber"
              placeholder="Enter your contact"
              value={form.phnumber}
              onChange={handleChange}
              className="border-2 outline-none border-gray-500 p-2 rounded"
            />
            <label htmlFor="">Date of birth</label>
            <input
              type="date"
              name="dob"
              placeholder="Date of Birth"
              value={form.dob}
              onChange={handleChange}
              className="border-2 outline-none border-gray-500 p-2 rounded"
            />
            <button
              type="submit"
              className="bg-gray-950 mt-2 text-white py-2 rounded hover:bg-black"
            >
              Signup
            </button>
            <p className="flex mt-2">
              Already have an account?{" "}
              <span
                onClick={switchToLogin}
                className="text-blue-500 mx-1 cursor-pointer hover:underline"
              >
                Login
              </span>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;
