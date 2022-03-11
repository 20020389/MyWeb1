import axios from "axios";
import { AnimatePresence } from "framer-motion";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import AvatarCompoment from "../../custom/avatar/AvatarCompoment";
import { useMobileMode, useUserData } from "../AppProvider";
import { motion } from "framer-motion";
import "./ProfilePageStyle.scss";

const ProfilePage = ({ user = { uid: undefined } }) => {
   const mount = useRef(false);
   const [userData, setUserData] = useState(null);
   const [showEditProfile, setShowEditProfile] = useState(false);
   const [mobilemode] = useMobileMode();
   const [admin, setAdmin] = useState(false);
   const param = useParams();

   useEffect(() => {
      if (!mount.current) {
         mount.current = true;
      }
      return () => {
         mount.current = false;
         console.log("unmount Profile");
      };
   }, []);

   useEffect(() => {
      console.log(param);
      if (param.useruid) {
         axios
            .get(
               `${process.env.REACT_APP_SERVER}/getdata/user?uid=${param.useruid}`
            )
            .then((r) => {
               console.log(r);
               setUserData(r.data.userdata);
            });
      }
      if (param.useruid === user.uid) {
         setAdmin(true);
      } else {
         setAdmin(false);
      }
   }, [param.useruid]);

   const submitEdit = useCallback(() => {}, []);

   return (
      <>
         {userData ? (
            <div className="profile-base">
               <header>
                  <AvatarCompoment
                     width={!mobilemode ? 110 : 80}
                     height={!mobilemode ? 110 : 80}
                     strokeWidth={!mobilemode ? 3 : 2}
                     src={userData.avatar}
                     color={"rgba(128, 128, 128, 0.5)"}
                  />
                  <h4>{userData.name}</h4>
               </header>
               {admin && (
                  <>
                     <button
                        onClick={() => {
                           setShowEditProfile(true);
                        }}
                        className="bt profile-edit__btn"
                     >
                        <ion-icon src="/icon/pen.svg" />
                        <span>Edit Profile</span>
                     </button>
                     <AnimatePresence>
                        {showEditProfile && (
                           <>
                              <motion.div
                                 initial={{
                                    bottom: 20,
                                    right: 30,
                                    width: 0,
                                    height: 0,
                                    borderRadius: "100%",
                                 }}
                                 transition={{
                                    duration: 0.3,
                                 }}
                                 animate={{
                                    bottom: 0,
                                    right: 0,
                                    width: "100%",
                                    height: "100%",
                                    borderRadius: 0,
                                 }}
                                 exit={{
                                    bottom: 20,
                                    right: 30,
                                    width: 0,
                                    height: 0,
                                    borderRadius: "100%",
                                    transition: {
                                       duration: 0.3,
                                       delay: 0.3,
                                    },
                                 }}
                                 className="profile-edit"
                                 onClick={(e) => {
                                    if (e.target.className === "profile-edit") {
                                       setShowEditProfile(false);
                                    }
                                 }}
                              >
                                 <motion.form
                                    initial={{
                                       opacity: 0,
                                       visibility: "hidden",
                                    }}
                                    animate={{
                                       opacity: 1,
                                       visibility: "visible",
                                       transition: {
                                          delay: 0.3,
                                          duration: 0.3,
                                       },
                                    }}
                                    exit={{
                                       opacity: 0,
                                       visibility: "hidden",
                                       transition: {
                                          delay: 0,
                                          duration: 0.3,
                                       },
                                    }}
                                    className="profile-form"
                                    onSubmit={submitEdit}
                                 >
                                    <header>
                                       <AvatarCompoment
                                          width={!mobilemode ? 110 : 80}
                                          height={!mobilemode ? 110 : 80}
                                          strokeWidth={!mobilemode ? 3 : 2}
                                          src={userData.avatar}
                                          color={"rgba(128, 128, 128, 0.5)"}
                                       />
                                       <h4>{userData.name}</h4>
                                    </header>
                                 </motion.form>
                              </motion.div>
                           </>
                        )}
                     </AnimatePresence>
                  </>
               )}
            </div>
         ) : null}
      </>
   );
};

export default memo(ProfilePage);
