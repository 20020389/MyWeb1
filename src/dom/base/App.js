import { Skeleton } from "antd";
import axios from "axios";
import { doc, onSnapshot } from "firebase/firestore";
import { createContext, useEffect, useRef, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { firestore } from "../../database/firebase/firebase";
import "./AppStyle.scss";
import MessengerPage from "./messenger/MessengerPage";
import Navbar from "./navbar/Navbar";
import ProfilePage from "./profile/ProfilePage";
import SearchPage from "./search/SearchPage";
import SettingPage from "./setting/SettingPage";

export const MainContext = createContext()

export default function App({ user }) {
   const [loadingChat, setLoadingChat] = useState(true);
   const [online, setOnline] = useState(true)
   const [listChat, setListChat] = useState([]);
   const [newMessage, setNewMessage] = useState(false)
   const mount = useRef(false)

   useEffect(() => {
      mount.current = true
      let firstLoad = true
      let task = undefined

      async function getData(r) {
         const data = (
            await axios.post("/messenger/getlistchat", { data: r.data() })
         ).data.data;
         if (mount.current) {
            // console.log("load", data);
            
            setListChat(data);
            setLoadingChat(false);
         } else {
            console.log("unmounted!");
         }
      }

      const docRef = doc(
         firestore,
         `users/${user.uid}/messengerlist/data`
      );

      const unListen = onSnapshot(docRef, async (r) => {
         if (task) {
            clearInterval(task)
            task = undefined
         }
         if (firstLoad) {
            firstLoad = false
         } else {
            setNewMessage(prev => true)
         }
         await getData(r)
         task = setInterval(async () => {
            await getData(r)
         }, 60000);
      });
      return () => {
         unListen();
         if (task) {
            clearInterval(task)
            task = undefined
         }
         mount.current = false;
      };
   },[])

   useEffect(() => {
      axios.post('/user/setonline', {
         useruid: user.uid,
         online: online
      }).then(r => {
         // console.log(r.data);
      })
      const sendOnline = setInterval(() => {
         axios.post('/user/setonline', {
            useruid: user.uid,
            online: online
         }).then(r => {
            // console.log(r.data);
         })
      }, 30000);

      return () => {
         axios.post('/user/setonline', {
            useruid: user.uid,
            online: false
         })
         clearInterval(sendOnline)
      }
   }, [])

   const value = {
      listChat, loadingChat, online, newMessage, setNewMessage
   }

   return (
      <MainContext.Provider value={value}>
         <Navbar />
         <div className="app">
            <Routes>
               <Route path="/home" element={<div><Skeleton.Image/></div>} />
               <Route path="/profile/:useruid" element={
                  <ProfilePage key={"profile"} user={user}/>
               } />
               <Route path="/friend" element={<div>friend</div>} />
               <Route path="/messenger" element={<MessengerPage />} />
               <Route path="/messenger/:zoomchat" element={<MessengerPage />} />
               <Route path="/messenger/:zoomchat&user=:user" element={<MessengerPage />} />
               <Route path="/setting" element={<SettingPage />} />
               <Route path="/about" element={<div>about</div>} />
               <Route path={`/search`} element={<SearchPage />} />
               <Route path="/" element={<Navigate to="/home" />} />
               <Route path="/login" element={<Navigate to="/home" />} />
               <Route path="/:somestring" element={<div>404 ERROR</div>} />
            </Routes>
         </div>
      </MainContext.Provider>
   );
}
