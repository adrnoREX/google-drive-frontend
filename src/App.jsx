import react from "react";
import { Toaster } from "react-hot-toast";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Homepage from "./components/homepage.jsx";
import Drive from "./components/drive.jsx";
import Computer from "./components/computer.jsx";
import Trash from "./components/trash.jsx";
import Storage from "./components/storage.jsx";
import Login from "./components/login.jsx";
import Signup from "./components/signup.jsx";
import Navbar from "./components/navbar.jsx";
import FolderView from "./components/folderView.jsx";

function App() {
  return (
    <>
      <Router>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "white", 
              color: "black",
              padding: "12px 25px",
              borderRadius: "8px",
              border: "1px",
              fontSize: "14px",
              textAlign: "left"
            },
            success: {
              iconTheme: {
                primary: "black",
                secondary: "#fff",
              },
            },
            error: {
              iconTheme: {
                primary: "#f87171", 
                secondary: "#fff",
              },
            },
          }}
        />
        <Navbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/" element={<Homepage />} />
          <Route path="/drive" element={<Drive />} />
          <Route path="/drive/folders/:id" element={<FolderView />} />
          <Route path="/computer" element={<Computer />} />
          <Route path="/trash" element={<Trash />} />
          <Route path="/storage" element={<Storage />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
