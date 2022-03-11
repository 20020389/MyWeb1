import { signOut } from "firebase/auth";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import auth, { firestore } from "../../../database/firebase/firebase";
import { AppContext } from "../../AppController";
import AvatarCompoment from "../../custom/avatar/AvatarCompoment";
import "./NavbarStyle.scss";
import { Tooltip } from "bootstrap";
import { Avatar, Badge, notification } from "antd";
import randomkey from "../messenger/messengerwith/randomkey";
import { useNewMessage, useProvider, useTooltip } from "../AppProvider";
import * as notifyAudio from "./notification__audio.mp3";

const routeList = [
   "home",
   "profile",
   "friend",
   "messenger",
   "setting",
   "about",
];

function openTooltip(show, delay) {
   var tooltipTriggerList = [].slice.call(
      document.querySelectorAll('[data-bs-toggle="tooltip"]')
   );
   var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
      if (show) {
         return new Tooltip(tooltipTriggerEl, {
            delay: {
               show: delay,
            },
         });
      } else {
         return undefined;
      }
   });
}

export default function Navbar(props) {
   const appController = useContext(AppContext);
   const searchbox = useRef();
   const menuRef = useRef();
   const mount = useRef(false);
   const [messageNotify, setMessageNotify] = useState(0);
   const [mobilemode, setMobileMode] = useState(false);
   const [showmenu, setShowMenu] = useState(false);
   const path = useLocation();
   const navigate = useNavigate();

   const [listChat, loadingChat, online] = useProvider();
   const [newMessage, setNewMessage] = useNewMessage();

   const tooltip = useTooltip(0.5, 500, 1000);

   useEffect(() => {
      // openTooltip(true);
      return () => {
         mount.current = false;
      };
   }, []);

   function getIndex(link) {
      link = link.slice(1, link.length);
      for (let i = 0; i < routeList.length; i++) {
         if (
            link === routeList[i] ||
            link.toString().indexOf(routeList[i] + "/") !== -1
         ) {
            return i;
         }
      }
      return -1;
   }

   useEffect(() => {
      const index = getIndex(path.pathname);
      const listBtn = menuRef.current.childNodes;
      for (let i = 0; i < listBtn.length; i++) {
         if (i !== index) {
            listBtn[i].classList.remove("active");
            const icon = listBtn[i].querySelector("ion-icon");
            let name = icon.name;
            if (name) {
               if (name.indexOf("-outline") === -1) {
                  name += "-outline";
                  icon.name = name;
               }
            }
         } else {
            listBtn[i].classList.add("active");
            const icon = listBtn[i].querySelector("ion-icon");
            let name = icon.name;
            if (name) {
               name = name.replace("-outline", "");
               icon.name = name;
            }
         }
      }
      setShowMenu(false);
   }, [path]);

   const openNotification = useCallback(
      (placement, user, avatar, text, zoomid) => {
         const key = randomkey(5);
         notification.open({
            message: user,
            icon: (
               <>
                  <Avatar src={avatar} />
                  <audio
                     autoPlay
                     style={{ display: "none" }}
                     src={notifyAudio.default}
                  ></audio>
               </>
            ),
            description: text,
            key: key,
            style: {
               zoom: mobilemode ? 0.7 : 1,
               cursor: "pointer",
            },
            placement,
            onClick: (e) => {
               if (zoomid) {
                  notification.close(key);
                  navigate(`messenger/${zoomid}`);
               }
            },
         });
      },
      [mobilemode]
   );

   useEffect(() => {
      const data = listChat;
      // console.log("(navbar.js 131)", listChat);
      let number = 0;
      for (let i in data) {
         if (!data[i].seen) {
            number++;
            console.log(data[i]);
         }
      }
      setMessageNotify(number);
      if (!loadingChat) {
         if (!mount.current) {
            mount.current = true;
         } else if (newMessage) {
            const index = getIndex(path.pathname);
            setNewMessage(false);
            if (data.length > 0 && !data[0].seen && index != 3) {
               openNotification(
                  "bottomLeft",
                  data[0].data.name,
                  data[0].data.avatar,
                  data[0].last.text,
                  data[0].id
               );
            }
         }
      }
      return () => {};
   }, [listChat, loadingChat]);

   useEffect(() => {
      const resizeWindow = () => {
         if (window.innerWidth <= 550 && window.innerWidth > 500) {
            searchbox.current.style.width = "160px";
         } else if (window.innerWidth > 550) {
            searchbox.current.style.width = "180px";
         }
         /*          if (window.innerWidth <= 1000 && window.innerWidth > 500) {
            openTooltip(true, 100)
         } else {
            openTooltip(true, 10000)
         } */
         if (!mobilemode && window.innerWidth <= 500) {
            setMobileMode(true);
         } else if (mobilemode && window.innerWidth > 500) {
            setMobileMode(false);
            setShowMenu(false);
         }
      };

      resizeWindow();

      window.addEventListener("resize", resizeWindow);

      return () => {
         window.removeEventListener("resize", resizeWindow);
      };
   });

   const searchAction = (e) => {
      if (e.which === 13) {
         if (searchbox.current.value.length > 0) {
            navigate(`/search?p=${searchbox.current.value}`);
         }
      }
   };

   return (
      <>
         <div className="topbar">
            <div className="topbar__left">
               {mobilemode && (
                  <button className="topbar__left__showmenu">
                     <Badge dot={messageNotify > 0} size="small">
                        <ion-icon name="menu"></ion-icon>
                     </Badge>
                     <input
                        checked={showmenu !== undefined ? showmenu : false}
                        type="checkbox"
                        onChange={(e) => {
                           setShowMenu(e.target.checked);
                        }}
                     />
                  </button>
               )}
               <span
                  className="topbar__left__logo"
                  onClick={() => navigate("/home")}
               >
                  Top<span>Cherry</span>
               </span>
               <div className="searchbox">
                  <label htmlFor="searchbox">
                     <ion-icon name="search"></ion-icon>
                  </label>
                  {mobilemode ? null : (
                     <input
                        ref={searchbox}
                        id="searchbox"
                        type="text"
                        placeholder="Search..."
                        autoComplete="off"
                        onBlur={(e) => {
                           setTimeout(() => {
                              e.target.value = "";
                           }, 300);
                        }}
                        onKeyDown={searchAction}
                     />
                  )}
               </div>
               {mobilemode /* show btn showmenu when sreen < 500 */ ? (
                  <div className="searchbox searchbox--fixed">
                     <label htmlFor="searchbox">
                        <ion-icon name="search"></ion-icon>
                     </label>
                     <input
                        ref={searchbox}
                        id="searchbox"
                        type="text"
                        placeholder="Search..."
                        onFocus={(e) => {
                           e.target.parentNode.classList.add("show");
                        }}
                        onBlur={(e) => {
                           e.target.parentNode.classList.remove("show");
                           setTimeout(() => {
                              e.target.value = "";
                           }, 300);
                        }}
                        onKeyDown={searchAction}
                     />
                  </div>
               ) : null}
            </div>
            <div className="topbar__right">
               <div className="topbar__right__notify">
                  <button>
                     <ion-icon name="notifications" />
                  </button>
               </div>
               <span>{appController.userData.name}</span>
               <Badge
                  dot={online}
                  size="default"
                  style={{ zoom: `${mobilemode ? 1 : 1.2}` }}
                  offset={[-4, "81%"]}
                  color="green"
               >
                  <AvatarCompoment
                     src={appController.userData.avatar}
                     className="topbar__right__avatar"
                     width={mobilemode ? 30 : 36}
                     height={mobilemode ? 30 : 36}
                     color="#6c757d5e"
                  />
               </Badge>
            </div>
         </div>
         <div className={`leftbar${showmenu ? " show" : ""}`}>
            <ul ref={menuRef} className="leftbar__list">
               <Link
                  to="/home"
                  className="leftbar__list__item active"
                  name="home"
                  onMouseMove={tooltip.hover}
                  onMouseLeave={tooltip.blur}
               >
                  <div>
                     <div>
                        <ion-icon name="home-outline"></ion-icon>
                     </div>
                     <span>Dashboard</span>
                  </div>
               </Link>
               <Link
                  to={`/profile/${appController.user.uid}`}
                  className="leftbar__list__item"
                  name="profile"
                  onMouseMove={tooltip.hover}
                  onMouseLeave={tooltip.blur}
               >
                  <div>
                     <div>
                        <ion-icon src={`${process.env.REACT_APP_SERVER}/icon/profile.svg`} />
                     </div>
                     <span>Profile</span>
                  </div>
               </Link>
               <Link
                  to="/friend"
                  className="leftbar__list__item"
                  data-bs-toggle="tooltip"
                  data-bs-placement="right"
                  name="friend"
                  onMouseMove={tooltip.hover}
                  onMouseLeave={tooltip.blur}
               >
                  <div>
                     <div>
                        <ion-icon src={`${process.env.REACT_APP_SERVER}/icon/friend.svg`} />
                     </div>
                     <span>Friend</span>
                  </div>
               </Link>
               <Link
                  to="/messenger"
                  className="leftbar__list__item"
                  name="messenger"
                  onMouseMove={tooltip.hover}
                  onMouseLeave={tooltip.blur}
               >
                  <div>
                     <Badge
                        count={messageNotify}
                        className="messenger-badge"
                        size="small"
                     >
                        <ion-icon name="chatbubbles-outline"></ion-icon>
                     </Badge>
                     <span>Messenger</span>
                  </div>
               </Link>
               <Link
                  to="/setting"
                  className="leftbar__list__item"
                  name="setting"
                  onMouseMove={tooltip.hover}
                  onMouseLeave={tooltip.blur}
               >
                  <div>
                     <div>
                        <ion-icon name="settings-outline"></ion-icon>
                     </div>
                     <span>Setting</span>
                  </div>
               </Link>
               <Link
                  to="about"
                  className="leftbar__list__item"
                  name="about"
                  onMouseMove={tooltip.hover}
                  onMouseLeave={tooltip.blur}
               >
                  <div>
                     <div>
                        <ion-icon src={`${process.env.REACT_APP_SERVER}/icon/question.svg`} />
                     </div>
                     <span>About</span>
                  </div>
               </Link>
            </ul>
            <a
               className="leftbar__list__item"
               name="logout"
               onMouseMove={tooltip.hover}
               onMouseLeave={tooltip.blur}
               onClick={(e) => {
                  signOut(auth);
               }}
            >
               <div>
                  <div>
                     <ion-icon src={`${process.env.REACT_APP_SERVER}/icon/logout.svg`} />
                  </div>
                  <span>Logout</span>
               </div>
            </a>
            <div
               className="leftbar__after"
               onClick={(e) => {
                  setShowMenu(false);
               }}
            ></div>
         </div>
      </>
   );
}
