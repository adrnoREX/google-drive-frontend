import { createContext, useState, useEffect } from "react";
import api from "../api";

export const authContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(null);

  const fetchUser = async () => {
    try {
      const { data } = await api.get("/me", {
        withCredentials: true
      });
      setCurrentUser(data.user);
    } catch {
      setCurrentUser(null);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <authContext.Provider value={{ currentUser, setCurrentUser, fetchUser, token, setToken, }}>
      {children}
    </authContext.Provider>
  );
};
