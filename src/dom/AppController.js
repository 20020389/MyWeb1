import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import auth from "../database/firebase/firebase";
import VerifiPage from "./login/verfify/VerifiPage";
import "./AppControllerStyle.scss";
import LoadingCompoment from "./custom/loading/LoadingCompoment";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import LoginPage from "./login/LoginPage";
import App from "./base/App";
import axios from "axios";

const AppContext = createContext();

export default function AppController({ login, app }) {
   const [loading, setLoading] = useState(true);
   const [user, setUser] = useState(null);
   const [userData, setUserData] = useState(null);
   const [verified, setVerified] = useState(false);
   const [mobilemode, setMobileMode] = useState(false)
   const navigate = useNavigate();

   useEffect(() => {
      const listenAuth = onAuthStateChanged(auth, async (currentUser) => {
         if (currentUser) {
            console.log("verify", currentUser.emailVerified);
            if (currentUser.emailVerified) {
               setLoading((prev) => (prev = true));
               setVerified((prev) => (prev = true));
               axios.get(`/getdata/user?uid=${currentUser.uid}`).then((res) => {
                  setUser(currentUser);
                  setUserData(res.data.userdata);
                  setLoading(false);
               });
            } else {
               setUser(currentUser);
               setVerified((prev) => (prev = false));
               setLoading(false);
            }
         } else {
            setUser(null);
            setUserData(null);
            setLoading(false);
            setVerified(false);
            navigate("login");
         }
      });

      console.log("verify state", verified);

      return () => {
         listenAuth();
      };
   }, []);

   useEffect(() => {
      const resizeWindow = () => {
         if (!mobilemode && window.innerWidth <= 500) {
            setMobileMode(true);
         } else if (mobilemode && window.innerWidth > 500) {
            setMobileMode(false);
         }
      };

      resizeWindow();

      window.addEventListener("resize", resizeWindow);

      return () => {
         window.removeEventListener("resize", resizeWindow);
      };
   });

   const value = {
      user,
      setUser,
      userData,
      setUserData,
      setLoading,
      mobilemode
   };

   // signOut(auth)

   return (
      <AppContext.Provider value={value}>
         {!loading ? ( //loading hay k
            user ? ( //đăng nhập hay chưa
               verified ? ( // xác minh email sau đăng ký hay chưa
                  <App user={user}/>
               ) : (
                  <VerifiPage />
               )
            ) : (
               <Routes>
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/" element={<Navigate to="/login" />} />
                  <Route path="/:str1" element={<Navigate to="/login" />} />
                  <Route
                     path="/:str1/:str2"
                     element={<Navigate to="/login" />}
                  />
               </Routes>
            )
         ) : (
            <div className="loadding-base">
               <LoadingCompoment
                  width="200"
                  height="200"
                  strokeWidth="15"
                  zoom={2}
               />
            </div>
         )}
      </AppContext.Provider>
   );
}

export { AppContext };
