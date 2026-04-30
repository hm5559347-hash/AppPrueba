import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

const read = (key) => {
  try { return sessionStorage.getItem(key); } catch { return null; }
};
const readJSON = (key) => {
  try { const v = sessionStorage.getItem(key); return v ? JSON.parse(v) : null; } catch { return null; }
};

export const AuthProvider = ({ children }) => {
  const [authed, setAuthed] = useState(() => read("clinic_authed") === "1");
  const [specialist, setSpecialistState] = useState(() => readJSON("clinic_specialist"));
  const [branch, setBranchState] = useState(() => readJSON("clinic_branch"));

  const login = () => {
    sessionStorage.setItem("clinic_authed", "1");
    setAuthed(true);
  };
  const logout = () => {
    sessionStorage.removeItem("clinic_authed");
    sessionStorage.removeItem("clinic_branch");
    setAuthed(false);
    setBranchState(null);
  };

  const setSpecialist = (sp) => {
    sessionStorage.setItem("clinic_specialist", JSON.stringify(sp));
    setSpecialistState(sp);
  };
  const clearSpecialist = () => {
    sessionStorage.removeItem("clinic_specialist");
    setSpecialistState(null);
  };

  const setBranch = (br) => {
    sessionStorage.setItem("clinic_branch", JSON.stringify(br));
    setBranchState(br);
  };
  const clearBranch = () => {
    sessionStorage.removeItem("clinic_branch");
    setBranchState(null);
  };

  return (
    <AuthContext.Provider value={{
      authed, login, logout,
      specialist, setSpecialist, clearSpecialist,
      branch, setBranch, clearBranch,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
