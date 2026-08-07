import { useEffect, useState } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Dashbord from "./pages/Dashbord";

import Roadmap from "./pages/Roadmap";
import Scorer from "./pages/Scorer";
import ResumeBuilder from "./pages/ResumeBuilder";
import Pricing from "./pages/Pricing";
import InterviewStart from "./pages/InterviewStart";
import InterviewPage from "./pages/InterviewPage";
import InterviewReport from "./pages/InterviewReport";
import { getCurrentUser } from "./api/user.api";
import { setResume } from "./redux/resumeSlice";
import { getResume } from "./api/resume.api";
import { useDispatch } from "react-redux";




import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch()

  useEffect(() => {

   const getUser = async () => {
    const data = await getCurrentUser()
    setUser(data?.user)

    setLoading(false)

   }
   getUser()

  

  }, []);

  useEffect(()=>{
     const fetchResume = async () => {
       if (!user) return;
       const response = await getResume();
       dispatch(setResume(response.data));
     };

     fetchResume();
  },[user, dispatch]);



  if (loading) {
    return (
      <div className="fixed top-0 left-0 w-full z-[9999]">
        <div className="h-1 bg-white animate-pulse w-full" />
      </div>
    );
  }

  return (
    <>
      <ToastContainer theme="dark" position="bottom-right" />
      <Routes>

      <Route
        path="/"
        element={
          user
            ? <Navigate to="/dashboard" replace />
            : <Home setUser={setUser} />
        }
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute user={user}>
            <Dashbord user={user} setUser={setUser} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/interview"
        element={
          <ProtectedRoute user={user}>
            <InterviewStart user={user} setUser={setUser} />
          </ProtectedRoute>
        }
      />

      <Route
        path="/interview/:id"
        element={
          <ProtectedRoute user={user}>
            <InterviewPage user={user} setUser={setUser} />
          </ProtectedRoute>
        }
      />

      <Route
        path="/interview/:id/report"
        element={
          <ProtectedRoute user={user}>
            <InterviewReport user={user} setUser={setUser} />
          </ProtectedRoute>
        }
      />

      <Route
        path="/resume"
        element={
          <ProtectedRoute user={user}>
            <ResumeBuilder setUser={setUser} />
          </ProtectedRoute>
        }
      />

      <Route
        path="/roadmap"
        element={
          <ProtectedRoute user={user}>
            <Roadmap user={user} setUser={setUser} />
          </ProtectedRoute>
        }
      />

      <Route
        path="/scorer"
        element={
          <ProtectedRoute user={user}>
            <Scorer user={user} setUser={setUser} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pricing"
        element={
          <ProtectedRoute user={user}>
            <Pricing user={user} setUser={setUser} />
          </ProtectedRoute>
        }
      />



    </Routes>
    </>
  );
}

export default App;