import { Badge, List } from "antd";
import axios from "axios";
import { doc, onSnapshot } from "firebase/firestore";
import {
   useCallback,
   useContext,
   useEffect,
   useRef,
   useState,
} from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../../AppController";
import { useProvider } from "../AppProvider";
import AvatarCompoment from "../../custom/avatar/AvatarCompoment";
import "./MessengerStyle.scss";
import MessengerWith from "./messengerwith/MessengerWith";

export default function MessengerPage({
   
}) {
   const navigate = useNavigate();
   const appController = useContext(AppContext);
   const param = useParams();

   const [listChat, loadingChat] = useProvider()

   const [loadingZoom, setLoadingZoom] = useState(true);
   const [mobilemode, setMobileMode] = useState(false);
   const [zoomdata, setZoomdata] = useState(null);
   const [listEmoji, setListEmoji] = useState([])

   const mount = useRef(true);

   useEffect(() => {
      mount.current = true;
      axios.get(`${process.env.REACT_APP_SERVER}/emojis/emoji.json`).then((res) => {
         const data = res.data.results;
         setListEmoji(data)
      });
   }, []);

   useEffect(() => {
      const resizeWindow = () => {
         if (!mobilemode && window.innerWidth <= 500) {
            setMobileMode((prev) => true);
         } else if (mobilemode && window.innerWidth > 500) {
            setMobileMode((prev) => false);
         }
      };

      resizeWindow();

      window.addEventListener("resize", resizeWindow);

      return () => {
         window.removeEventListener("resize", resizeWindow);
      };
   });

   function checkZoom(id) {
      if (param.zoomchat !== undefined && param.zoomchat === id) {
         return true;
      }
      return false;
   }

   const chatboxStyle = mobilemode
      ? param.zoomchat === undefined
         ? { display: "none" }
         : { width: "100%" }
      : null;

   const listuserStyle =
      mobilemode && param.zoomchat !== undefined
         ? { display: "none" }
         : mobilemode && param.zoomchat === undefined
         ? { width: "100%" }
         : null;

   const renderListUser = useCallback(
      (chat, index) => (
         <List.Item
            key={index}
            className={`messenger__listuser__list__item${
               checkZoom(chat.id) ? " active" : ""
            }`}
         >
            <Link to={`/messenger/${chat.id}`}>
               <Badge
                  dot={chat.data.online}
                  size="default"
                  style={{ zoom: `${mobilemode ? 1 : 1.2}` }}
                  offset={[-4, "81%"]}
                  color="green"
               >
                  <AvatarCompoment
                     src={chat.data.avatar}
                     width={mobilemode ? 30 : 34}
                     height={mobilemode ? 30 : 34}
                     color={!chat.seen ? "rgb(194 72 72)" : undefined}
                  />
               </Badge>
               <div type="zoomdata">
                  <div>{chat.data.name}</div>
                  {chat.last && chat.last.text ? (
                     <div
                        style={!chat.seen ? { color: "rgb(194 72 72)" } : null}
                     >{`${
                        chat.last.user === appController.user.uid ? "You: " : ""
                     }${chat.last.text}`}</div>
                  ) : null}
               </div>
            </Link>
         </List.Item>
      ),
      [listChat, param]
   );

   useEffect(() => {
      console.log("re-render MessengerPage 120");
      return () => {
         setZoomdata(null);
         if (!loadingZoom) {
            setLoadingZoom((prev) => true);
         }
      }
   }, [param.zoomchat])

   useEffect(() => {
      if (param.zoomchat && listChat) {
         const id = param.zoomchat;

         console.log("re-render MessengerPage 129");
         for (let i in listChat) {
            if (param.user) {
               if (listChat[i].data.user === param.user) {
                  navigate(`/messenger/${listChat[i].id}`);
               }
            }
            if (id === listChat[i].id) {
               if (param.user) {
                  navigate(`/messenger/${zoomdata.id}`);
               }
               setZoomdata((prev) => listChat[i]);
               setLoadingZoom(false);
               // console.log(listChat[i]);
               return;
            }
         }
         //nếu zoom chat k tồn tại tạo 1 fakezoom
         if (param.user) {
            axios
               .post(`${process.env.REACT_APP_SERVER}/messenger/getfakezoom`, {
                  zoomid: param.zoomchat,
                  friendid: param.user,
                  currentuser: appController.user,
               })
               .then((r) => {
                  // console.log(r.data);
                  setZoomdata(r.data);
                  setLoadingZoom((prev) => false);
               });
         } else {
            setLoadingZoom((prev) => false);
         }
         
      }
   }, [listChat, param.zoomchat]);

   console.log(param.zoomchat, listChat, !loadingZoom);

   return (
      <>
         <div className="messenger">
            <div className="messenger__chatbox" style={chatboxStyle}>
               {param.zoomchat && listChat && !loadingZoom ? (
                  zoomdata ? (
                     <MessengerWith
                        key={zoomdata.id}
                        currentUser={appController.user}
                        zoomdata={zoomdata}
                        emojiList={listEmoji}
                        mobilemode={mobilemode}
                        fakezoom={param.user ? true : false}
                        setLoadingZoom={setLoadingZoom}
                     />
                  ) : (
                     <div>can't find this zoom</div>
                  )
               ) : null}
            </div>
            <div className="messenger__listuser" style={listuserStyle}>
               <List
                  size="small"
                  className="messenger__listuser__list"
                  style={loadingChat ? { justifyContent: "center" } : null}
                  dataSource={listChat}
                  renderItem={renderListUser}
                  loading={loadingChat}
               >
                  {/* {!loading ? (
                     listChat.length !== 0 ? (
                        renderListUser
                     ) : (
                        <div>no thing in here</div>
                     )
                  ) : (
                     <LoadingCompoment zoom="0.4" />
                  )} */}
               </List>
            </div>
         </div>
      </>
   );
}
