import axios from "axios";
import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useMemo, useRef, useState } from "react";
import { LoadingOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { firestore } from "../../../../database/firebase/firebase";
import { motion, Reorder } from "framer-motion";
import AvatarCompoment from "../../../custom/avatar/AvatarCompoment";
import LoadingCompoment from "../../../custom/loading/LoadingCompoment";
import "./MessengerWithStyle.scss";
import randomkey from "./randomkey";
import { Badge, Image, Spin } from "antd";
import StickerCompoment from "../../../custom/sticker/StickerCompoment";

function createMessage(text) {
   return {
      text: text,
      key: randomkey(3),
   };
}

function convertSendTime(timeData) {
   const time = new Date(timeData);
   let day = time.getDate();

   const timeNow = new Date();
   let dayNow = timeNow.getDate();

   if (day === dayNow) {
      return `${time.getHours()}:${
         time.getMinutes() < 10 ? `0${time.getMinutes()}` : time.getMinutes()
      }`;
   } else {
      return `${time.getHours()}:${time.getMinutes()} ${time.getDate()}/${
         time.getMonth() + 1
      }/${time.getFullYear()}`;
   }
}

function absorbEvent_(event) {
   var e = event || window.event;
   e.preventDefault && e.preventDefault();
   e.stopPropagation && e.stopPropagation();
   e.cancelBubble = true;
   e.returnValue = false;
   return false;
}

function preventLongPressMenu(node) {
   node.ontouchstart = () => {};
   node.ontouchmove = absorbEvent_;
   node.ontouchend = absorbEvent_;
   node.ontouchcancel = absorbEvent_;
}

function getEmoticon(emoticon, current, mobilemode) {
   switch (emoticon) {
      case "love":
         return (
            <motion.span
               className={`message-emoticon message-emoticon--${current}`}
            >
               <AvatarCompoment
                  key="avatar-seen"
                  width={mobilemode ? 15 : 20}
                  height={mobilemode ? 15 : 20}
                  src="/icon/emoticon/1.png"
                  strokeWidth={1.5}
                  style={{
                     transform: "scale(0.8)",
                     transformOrigin: "center",
                     borderRadius: "0",
                  }}
               />
            </motion.span>
         );
      case "fun":
         return (
            <motion.span
               className={`message-emoticon message-emoticon--${current}`}
            >
               <AvatarCompoment
                  key="avatar-seen"
                  width={mobilemode ? 15 : 20}
                  height={mobilemode ? 15 : 20}
                  src="/icon/emoticon/2.png"
                  strokeWidth={1.5}
               />
            </motion.span>
         );
      case "wow":
         return (
            <motion.span
               className={`message-emoticon message-emoticon--${current}`}
            >
               <AvatarCompoment
                  key="avatar-seen"
                  width={mobilemode ? 15 : 20}
                  height={mobilemode ? 15 : 20}
                  src="/icon/emoticon/3.png"
                  strokeWidth={1.5}
               />
            </motion.span>
         );
      case "sad":
         return (
            <motion.span
               className={`message-emoticon message-emoticon--${current}`}
            >
               <AvatarCompoment
                  key="avatar-seen"
                  width={mobilemode ? 15 : 20}
                  height={mobilemode ? 15 : 20}
                  src="/icon/emoticon/4.png"
                  strokeWidth={1.5}
               />
            </motion.span>
         );
      case "hate":
         return (
            <motion.span
               className={`message-emoticon message-emoticon--${current}`}
            >
               <AvatarCompoment
                  key="avatar-seen"
                  width={mobilemode ? 15 : 20}
                  height={mobilemode ? 15 : 20}
                  src="/icon/emoticon/5.png"
                  strokeWidth={1.5}
               />
            </motion.span>
         );
      case "like":
         return (
            <motion.span
               className={`message-emoticon message-emoticon--${current}`}
            >
               <AvatarCompoment
                  key="avatar-seen"
                  width={mobilemode ? 15 : 20}
                  height={mobilemode ? 15 : 20}
                  src="/icon/emoticon/6.png"
                  strokeWidth={1.5}
               />
            </motion.span>
         );

      default:
         return null;
         break;
   }
}

//main
export default function MessengerWith({
   currentUser,
   zoomdata,
   emojiList,
   mobilemode,
   fakezoom,
}) {
   const mount = useRef();
   const chatBox = useRef();
   const uploadImage = useRef();
   const navigate = useNavigate();

   const [limitload, setLimitload] = useState(20);
   const [loadingmore, setLoadingMore] = useState(false);

   const [listMessage, setListMessage] = useState([]);
   const [listTyping, setListTyping] = useState([]);
   const [listSending, setListSending] = useState([]);
   const [sending, setSending] = useState(false);

   const [showAction, setShowAction] = useState(false);
   const [imagePreview, setImagePreview] = useState(null);

   const [showSticker, setShowSticker] = useState(false);

   const indexAnimation = useRef({ first: true, index: 0 });
   const seenPosition = useRef(0);

   useEffect(() => {
      return () => {
         imagePreview && window.URL.revokeObjectURL(imagePreview.link);
      };
   }, [imagePreview]);

   useEffect(() => {
      if (listSending && listSending.length > 0) {
         let base = document.querySelector(".zoomchat__messages");
         base.scrollTop = base.scrollHeight;
      }
   }, [listSending]);

   useEffect(() => {
      if (!zoomdata.seen) {
         axios.post(`${process.env.REACT_APP_SERVER}/messenger/setseen`, {
            id: zoomdata.id,
            user: currentUser.uid,
         });
      }
   }, [zoomdata]);

   useEffect(() => {
      const friendId = zoomdata.data.user;
      const docRef = doc(firestore, `messagezoom/${zoomdata.id}`);
      const unListen = onSnapshot(docRef, async (snapshot) => {
         // console.log("snapshot:", snapshot.exists());
         if (snapshot.exists()) {
            const dataChat = snapshot.get("chat");
            let haveSeen = false;
            for (let i in dataChat) {
               let seen = dataChat[i].seen;
               if (seen.indexOf(friendId) !== -1) {
                  haveSeen = true;
                  seenPosition.current = i;
                  break;
               }
            }

            if (!haveSeen) {
               seenPosition.current = dataChat.length;
            }
            if (indexAnimation.current.first) {
               indexAnimation.current.index = dataChat.length;
               indexAnimation.current.first = false;
            }

            setListMessage(dataChat);
            setListSending([]);
            // console.log("chat data (messengerWith)", dataChat);
         } else {
            setListMessage([]);
            setListSending([]);
         }
      });

      const typingRef = doc(
         firestore,
         `messagezoom/${zoomdata.id}/typing/list`
      );
      const unListenTyping = onSnapshot(typingRef, (snapshot) => {
         let dataTyping = snapshot.get("data");
         if (!dataTyping) {
            dataTyping = [];
         }
         setListTyping(dataTyping);
      });

      return () => {
         unListen();
         unListenTyping();
         if (!fakezoom) {
            axios.post(`${process.env.REACT_APP_SERVER}/messenger/settyping`, {
               id: zoomdata.id,
               user: currentUser.uid,
               typing: false,
            });
         }
      };
   }, []);

   function isCurrentUser(uid) {
      if (uid === currentUser.uid) {
         return "current";
      }
      return "friend";
   }

   useEffect(() => {
      let ele = document.querySelectorAll(".message");
      for (let i = 0; i < ele.length; i++) {
         preventLongPressMenu(ele[i]);
      }
   }, [listMessage, limitload]);

   const renderIcon = (list = [], item) => (
      <motion.ul className="icon-dropdow">
         <motion.li
            className="bt"
            onClick={(e) => {
               console.log("click");
               let ele = e.target.closest(".bt.message__menutool");
               let index = list.indexOf(item);
               if (list[index].emoticon === "love") {
                  list[index].emoticon = undefined;
               } else {
                  list[index].emoticon = "love";
               }
               axios
                  .post(`${process.env.REACT_APP_SERVER}/messenger/emoticonupdate`, {
                     data: list,
                     zoomid: zoomdata.id,
                  })
                  .then((r) => {
                     ele && ele.blur();
                  });
            }}
            whileHover={{
               scale: 1.4,
               zIndex: 10,
               transition: { duration: 0.3, type: "tween", ease: "easeOut" },
            }}
         >
            <img src="/icon/emoticon/1.png" alt="" />
         </motion.li>
         <motion.li
            className="bt"
            onClick={(e) => {
               console.log("click");
               let ele = e.target.closest(".bt.message__menutool");
               let index = list.indexOf(item);
               if (index !== -1) {
                  if (list[index].emoticon === "fun") {
                     list[index].emoticon = undefined;
                  } else {
                     list[index].emoticon = "fun";
                  }
               }
               axios
                  .post(`${process.env.REACT_APP_SERVER}/messenger/emoticonupdate`, {
                     data: list,
                     zoomid: zoomdata.id,
                  })
                  .then((r) => {
                     ele && ele.blur();
                  });
            }}
            whileHover={{
               scale: 1.4,
               zIndex: 10,
               transition: { duration: 0.3, type: "tween", ease: "easeOut" },
            }}
         >
            <img src="/icon/emoticon/2.png" alt="" />
         </motion.li>
         <motion.li
            className="bt"
            onClick={(e) => {
               console.log("click");
               let ele = e.target.closest(".bt.message__menutool");
               let index = list.indexOf(item);
               if (list[index].emoticon === "wow") {
                  list[index].emoticon = undefined;
               } else {
                  list[index].emoticon = "wow";
               }
               axios
                  .post(`${process.env.REACT_APP_SERVER}/messenger/emoticonupdate`, {
                     data: list,
                     zoomid: zoomdata.id,
                  })
                  .then((r) => {
                     ele && ele.blur();
                  });
            }}
            whileHover={{
               scale: 1.4,
               zIndex: 10,
               transition: { duration: 0.3, type: "tween", ease: "easeOut" },
            }}
         >
            <img src="/icon/emoticon/3.png" alt="" />
         </motion.li>
         <motion.li
            className="bt"
            onClick={(e) => {
               console.log("click");
               let ele = e.target.closest(".bt.message__menutool");
               let index = list.indexOf(item);
               if (list[index].emoticon === "sad") {
                  list[index].emoticon = undefined;
               } else {
                  list[index].emoticon = "sad";
               }
               axios
                  .post(`${process.env.REACT_APP_SERVER}/messenger/emoticonupdate`, {
                     data: list,
                     zoomid: zoomdata.id,
                  })
                  .then((r) => {
                     ele && ele.blur();
                  });
            }}
            whileHover={{
               scale: 1.4,
               zIndex: 10,
               transition: { duration: 0.3, type: "tween", ease: "easeOut" },
            }}
         >
            <img src="/icon/emoticon/4.png" alt="" />
         </motion.li>
         <motion.li
            className="bt"
            onClick={(e) => {
               console.log("click");
               let ele = e.target.closest(".bt.message__menutool");
               let index = list.indexOf(item);
               if (list[index].emoticon === "hate") {
                  list[index].emoticon = undefined;
               } else {
                  list[index].emoticon = "hate";
               }
               axios
                  .post(`${process.env.REACT_APP_SERVER}/messenger/emoticonupdate`, {
                     data: list,
                     zoomid: zoomdata.id,
                  })
                  .then((r) => {
                     ele && ele.blur();
                  });
            }}
            whileHover={{
               scale: 1.4,
               zIndex: 10,
               transition: { duration: 0.3, type: "tween", ease: "easeOut" },
            }}
         >
            <img src="/icon/emoticon/5.png" alt="" />
         </motion.li>
         <motion.li
            className="bt"
            onClick={(e) => {
               console.log("click");
               let ele = e.target.closest(".bt.message__menutool");
               let index = list.indexOf(item);
               if (list[index].emoticon === "like") {
                  list[index].emoticon = undefined;
               } else {
                  list[index].emoticon = "like";
               }
               axios
                  .post(`${process.env.REACT_APP_SERVER}/messenger/emoticonupdate`, {
                     data: list,
                     zoomid: zoomdata.id,
                  })
                  .then((r) => {
                     ele && ele.blur();
                  });
            }}
            whileHover={{
               scale: 1.4,
               zIndex: 10,
               transition: { duration: 0.3, type: "tween", ease: "easeOut" },
            }}
         >
            <img src="/icon/emoticon/6.png" alt="" />
         </motion.li>
      </motion.ul>
   );

   const renderChat = useMemo(() => {
      return listMessage
         ? listMessage.map((item, index, list) => {
              if (index >= limitload) {
                 return;
              }
              if (item.type === "text") {
                 const animation =
                    index < listMessage.length - indexAnimation.current.index;
                 const key = listMessage.length - index - 1;
                 return (
                    <Reorder.Item
                       key={key}
                       drag={false}
                       className={`message message__${isCurrentUser(
                          item.user
                       )}`}
                       initial={{
                          y: animation ? 100 : 0,
                       }}
                       animate={{
                          y: 0,
                       }}
                       transition={{
                          duration: 0.3,
                       }}
                       style={
                          item.emoticon
                             ? {
                                  marginBottom: "10px",
                               }
                             : null
                       }
                    >
                       <div>
                          {item.text}
                          <span className="message__tooltip">
                             {convertSendTime(item.time)}
                          </span>
                          {getEmoticon(item.emoticon, isCurrentUser(item.user))}
                       </div>
                       {isCurrentUser(item.user) === "friend" ? (
                          <button
                             className="bt message__menutool"
                             onFocus={(e) => {
                                let parent = e.target.closest(".message");
                                if (parent) {
                                   console.log("change");
                                   console.log(parent);
                                   parent.style.zIndex = "30";
                                }
                             }}
                             onBlur={(e) => {
                                let parent = e.target.closest(".message");
                                if (parent) {
                                   console.log("change");
                                   console.log(parent);
                                   parent.style.zIndex = "unset";
                                }
                             }}
                          >
                             <ion-icon src="/icon/showemoji.svg" />
                             {renderIcon(list, item)}
                          </button>
                       ) : null}
                       {seenPosition.current == index ? (
                          <span className="message__seen">
                             <AvatarCompoment
                                key="avatar-seen"
                                width={mobilemode ? 12 : 15}
                                height={mobilemode ? 12 : 15}
                                src={zoomdata.data.avatar}
                                strokeWidth={0.1}
                             />
                          </span>
                       ) : seenPosition.current > index ? (
                          <span
                             className="message__seen"
                             style={{
                                width: `${mobilemode ? 13 : 16}px`,
                                height: `${mobilemode ? 15 : 18}px`,
                             }}
                          >
                             <ion-icon
                                name="checkmark-circle"
                                style={{
                                   fontsize: `${mobilemode ? 12 : 15}px`,
                                }}
                             ></ion-icon>
                          </span>
                       ) : null}
                    </Reorder.Item>
                 );
              } else if (item.type === "image") {
                 const key = listMessage.length - index - 1;
                 const animation =
                    index < listMessage.length - indexAnimation.current.index;
                 return (
                    <Reorder.Item
                       key={key}
                       drag={false}
                       className={`message message__${isCurrentUser(
                          item.user
                       )}`}
                       initial={{
                          y: animation ? 100 : 0,
                       }}
                       animate={{
                          y: 0,
                       }}
                       transition={{
                          duration: 0.3,
                       }}
                    >
                       <div className="message__image">
                          <Image src={item.link} />
                          <span className="message__tooltip">
                             {convertSendTime(item.time)}
                          </span>
                          {getEmoticon(item.emoticon, isCurrentUser(item.user))}
                       </div>
                       {isCurrentUser(item.user) === "friend" ? (
                          <button
                             className="bt message__menutool"
                             onFocus={(e) => {
                                let parent = e.target.closest(".message");
                                if (parent) {
                                   console.log("change");
                                   console.log(parent);
                                   parent.style.zIndex = "30";
                                }
                             }}
                             onBlur={(e) => {
                                let parent = e.target.closest(".message");
                                if (parent) {
                                   console.log("change");
                                   console.log(parent);
                                   parent.style.zIndex = "unset";
                                }
                             }}
                          >
                             <ion-icon src="/icon/showemoji.svg" />
                             {renderIcon(list, item)}
                          </button>
                       ) : null}
                       {seenPosition.current == index ? (
                          <span className="message__seen">
                             <AvatarCompoment
                                key="avatar-seen"
                                width={mobilemode ? 12 : 15}
                                height={mobilemode ? 12 : 15}
                                src={zoomdata.data.avatar}
                                strokeWidth={0.1}
                             />
                          </span>
                       ) : seenPosition.current > index ? (
                          <span
                             className="message__seen"
                             style={{
                                width: `${mobilemode ? 13 : 16}px`,
                                height: `${mobilemode ? 15 : 18}px`,
                             }}
                          >
                             <ion-icon
                                name="checkmark-circle"
                                style={{
                                   fontsize: `${mobilemode ? 12 : 15}px`,
                                }}
                             ></ion-icon>
                          </span>
                       ) : null}
                    </Reorder.Item>
                 );
              } else if (item.type === "sticker") {
                 const key = listMessage.length - index - 1;
                 const animation =
                    index < listMessage.length - indexAnimation.current.index;
                 return (
                    <Reorder.Item
                       key={key}
                       drag={false}
                       className={`message message__${isCurrentUser(
                          item.user
                       )} message-sticker`}
                       initial={{
                          y: animation ? 100 : 0,
                       }}
                       animate={{
                          y: 0,
                       }}
                       transition={{
                          duration: 0.3,
                       }}
                    >
                       <div className="message__image">
                          <Image
                             preview={false}
                             src={item.link}
                             width={mobilemode ? 70 : 100}
                             height={mobilemode ? 70 : 100}
                          />
                          <span className="message__tooltip">
                             {convertSendTime(item.time)}
                          </span>
                          {getEmoticon(item.emoticon, isCurrentUser(item.user))}
                       </div>
                       {isCurrentUser(item.user) === "friend" ? (
                          <button
                             className="bt message__menutool"
                             onFocus={(e) => {
                                let parent = e.target.closest(".message");
                                if (parent) {
                                   console.log("change");
                                   console.log(parent);
                                   parent.style.zIndex = "30";
                                }
                             }}
                             onBlur={(e) => {
                                let parent = e.target.closest(".message");
                                if (parent) {
                                   console.log("change");
                                   console.log(parent);
                                   parent.style.zIndex = "unset";
                                }
                             }}
                          >
                             <ion-icon src="/icon/showemoji.svg" />
                             {renderIcon(list, item)}
                          </button>
                       ) : null}
                       {seenPosition.current == index ? (
                          <span className="message__seen">
                             <AvatarCompoment
                                key="avatar-seen"
                                width={mobilemode ? 12 : 15}
                                height={mobilemode ? 12 : 15}
                                src={zoomdata.data.avatar}
                                strokeWidth={0.1}
                             />
                          </span>
                       ) : seenPosition.current > index ? (
                          <span
                             className="message__seen"
                             style={{
                                width: `${mobilemode ? 13 : 16}px`,
                                height: `${mobilemode ? 15 : 18}px`,
                             }}
                          >
                             <ion-icon
                                name="checkmark-circle"
                                style={{
                                   fontsize: `${mobilemode ? 12 : 15}px`,
                                }}
                             ></ion-icon>
                          </span>
                       ) : null}
                    </Reorder.Item>
                 );
              }
           })
         : null;
   }, [listMessage, mobilemode, limitload]);

   const renderSending = useMemo(() => {
      return listSending
         ? listSending.map((item, index) => {
              const key = listMessage.length + index + 1000;
              return (
                 <li
                    key={key}
                    className="message message__current message__sending"
                    style={{ animation: `showMessage2 .3s` }}
                 >
                    <span
                       style={{
                          animation: "showMessage1 .3s",
                       }}
                    >
                       <LoadingCompoment zoom={0.4} />
                    </span>
                    <div
                       style={{
                          animation: "showMessage1 .3s",
                       }}
                    >
                       {item.text}
                    </div>
                 </li>
              );
           })
         : null;
   }, [listSending]);

   const renderTyping = useMemo(() => {
      let index = -1;
      try {
         index = listTyping.indexOf(zoomdata.data.user);
      } catch (error) {
         console.log(error);
      }
      const key = listMessage.length + listSending.length;
      return index !== -1 ? (
         <motion.li
            key={-key}
            className="message message__friend message__friend--typing"
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.3 }}
         >
            <div>
               <LoadingCompoment zoom={0.4} />
            </div>
         </motion.li>
      ) : null;
   }, [listTyping, mobilemode]);

   useEffect(() => {
      const emojiHtml = document.getElementById("emojilist");
      emojiHtml.innerHTML = "";
      for (let i = 0; i < emojiList.length; i++) {
         let ele = document.createElement("span");
         ele.innerHTML = `&#x${emojiList[i].unicode};`;
         ele.onclick = (e) => {
            if (chatBox.current.value.length === 0 && !fakezoom) {
               axios.post(`${process.env.REACT_APP_SERVER}/messenger/settyping`, {
                  id: zoomdata.id,
                  user: currentUser.uid,
                  typing: true,
               });
            }
            chatBox.current.value =
               chatBox.current.value + "" + e.target.innerHTML;
         };
         emojiHtml.appendChild(ele);
      }
   }, [emojiList]);

   useEffect(() => {
      mount.current = true;

      return () => {
         mount.current = false;
      };
   }, []);

   const backbtnStyle = mobilemode
      ? {
           display: "flex",
        }
      : { width: 0, visibility: "hidden" };

   const changeEventChatBox = (e) => {
      const textarea = e.target;
      textarea.style.height = "34px";
      if (textarea.scrollHeight < 130) {
         textarea.style.height = textarea.scrollHeight + "px";
      } else {
         textarea.style.height = "130px";
      }

      const index = listTyping.indexOf(currentUser.uid);
      if (index !== -1 && e.target.value.length === 0) {
         axios
            .post(`${process.env.REACT_APP_SERVER}/messenger/settyping`, {
               id: zoomdata.id,
               user: currentUser.uid,
               typing: false,
            })
            .then((r) => {});
      } else if (index === -1 && e.target.value.length > 0) {
         axios
            .post(`${process.env.REACT_APP_SERVER}/messenger/settyping`, {
               id: zoomdata.id,
               user: currentUser.uid,
               typing: true,
            })
            .then((r) => {});
      }
   };

   useEffect(() => {
      //click to show sticker
      const showStickerList = (e) => {
         if (e.target.closest(".sticker")) {
            if (showSticker) {
               if (e.target.className === "sticker__btn bt") {
                  setShowSticker(false);
               }
            } else {
               setShowSticker(true);
            }
         } else {
            if (showSticker) {
               setShowSticker(false);
            }
         }
      };
      window.addEventListener("click", showStickerList);

      return () => {
         window.removeEventListener("click", showStickerList);
      };
   }, [showSticker]);

   return (
      <div className="zoomchat">
         <div className="zoomchat__label">
            <Link to="/messenger" style={backbtnStyle}>
               <ion-icon name="arrow-back"></ion-icon>
            </Link>
            <Badge
               dot={zoomdata.data.online}
               size="default"
               style={{ zoom: `${mobilemode ? 1 : 1.2}` }}
               offset={mobilemode ? [-4, "81%"] : [-3, "81%"]}
               color="green"
            >
               <AvatarCompoment
                  width={mobilemode ? 30 : 35}
                  height={mobilemode ? 30 : 35}
                  src={zoomdata.data?.avatar}
                  color="rgba(128, 128, 128, 0.4)"
                  strokeWidth={1}
               />
            </Badge>
            <div>
               <span>{zoomdata.data.name}</span>
               <span>{zoomdata.data.lastOnline}</span>
            </div>
         </div>
         <div
            className="zoomchat__messages"
            onScroll={(e) => {
               const limit = e.target.scrollHeight - e.target.clientHeight;
               // console.log('scrolling', e.target.scrollTop, limit);
               if (
                  Math.abs(e.target.scrollTop + limit) <= 5 &&
                  limitload < listMessage.length
               ) {
                  setLoadingMore(true);
                  setTimeout(() => {
                     if (mount.current) {
                        if (
                           limitload + 10 <= listMessage.length &&
                           !loadingmore
                        ) {
                           setLimitload(limitload + 10);
                        } else if (
                           limitload + 10 > listMessage.length &&
                           !loadingmore
                        ) {
                           setLimitload(listMessage.length);
                        }
                        setLoadingMore(false);
                     }
                  }, 1000);
               }
            }}
         >
            <Reorder.Group values={[...listTyping, ...listMessage]}>
               {[renderTyping, ...renderChat]}
               {loadingmore ? <Spin /> : null}
            </Reorder.Group>
         </div>
         {showAction ? (
            <div
               className={`moreaction__actionbase${
                  imagePreview ? " preview" : ""
               }`}
            >
               {!imagePreview ? (
                  <div className="moreaction__action">
                     <input
                        ref={uploadImage}
                        type="file"
                        id="up-image"
                        style={{ display: "none" }}
                        accept="image/*"
                        onChange={(e) => {
                           if (e.target.files.length > 0) {
                              // console.log(e.target.files[0]);
                              const link = window.URL.createObjectURL(
                                 e.target.files[0]
                              );
                              setImagePreview({
                                 file: e.target.files[0],
                                 link: link,
                              });
                           }
                        }}
                     />
                     <label htmlFor="up-image">
                        <ion-icon name="image"></ion-icon>
                     </label>
                  </div>
               ) : (
                  <div className={`moreaction__preview`}>
                     <div>
                        <img src={imagePreview.link} alt="" />
                        <button
                           className="bt"
                           onClick={(e) => {
                              setImagePreview(null);
                           }}
                        >
                           <ion-icon name="close"></ion-icon>
                        </button>
                     </div>
                  </div>
               )}
            </div>
         ) : null}
         <div className="zoomchat__form">
            <div className="moreaction">
               <button
                  className="bt more-send"
                  onClick={(e) => {
                     if (!showAction) {
                        setShowAction(true);
                     } else {
                        setShowAction(false);
                        setImagePreview(null);
                     }
                  }}
               >
                  <ion-icon name="add-circle-outline"></ion-icon>
               </button>
            </div>
            <div className="sticker">
               <button className="sticker__btn bt">
                  <ion-icon name="logo-twitch"></ion-icon>
               </button>
               {showSticker && (
                  <div className="sticker__showssticker">
                     <StickerCompoment
                        onSendSticker={(link) => {
                           setSending(true);
                           console.log(link);
                           const formData = {};
                           const file = {
                              name: link,
                           };
                           formData.user = currentUser.uid;
                           formData.zoomid = zoomdata.id;
                           formData.type = "sticker";
                           formData.file = file;
                           if (fakezoom) {
                              formData.friendid = zoomdata.data.user;
                           }
                           if (!fakezoom) {
                              axios
                                 .post(`${process.env.REACT_APP_SERVER}/messenger/send`, formData)
                                 .then((r) => {
                                    if (mount.current) {
                                       setSending(false);
                                    }
                                 });
                           } else {
                              console.log("chat in fakezoom!");
                              axios
                                 .post(`${process.env.REACT_APP_SERVER}/messenger/createzoom`, formData)
                                 .then((r) => {
                                    if (mount.current) {
                                       setSending(false);
                                    }
                                 });
                           }
                        }}
                     />
                  </div>
               )}
            </div>
            <div className="zoomchat__form__input">
               <textarea
                  ref={chatBox}
                  onChange={changeEventChatBox}
                  cols="100"
                  placeholder="Chat..."
                  type="text"
                  disabled={imagePreview ? true : false}
               ></textarea>
            </div>
            <button className="zoomchat__form__emoji">
               <ion-icon src="/icon/showemoji.svg" />
               <div>
                  <div id="emojilist"></div>
               </div>
            </button>
            <button
               className="zoomchat__form__send"
               onClick={(e) => {
                  const text = createMessage(chatBox.current.value);
                  if (!imagePreview) {
                     if (text.text.length === 0 || sending) {
                        return;
                     }
                  }
                  const data = [text, ...listSending];
                  setListSending(data);
                  let base = document.querySelector(".zoomchat__messages");
                  setSending(true);
                  const formData = new FormData();
                  formData.append("user", currentUser.uid);
                  formData.append("zoomid", zoomdata.id);
                  if (fakezoom) {
                     formData.append("friendid", zoomdata.data.user);
                  }
                  formData.append("text", text.text);
                  formData.append("type", "text");
                  if (imagePreview) {
                     // console.log("file", imagePreview.file);
                     formData.append("file", imagePreview.file);
                     formData.set("type", "image");
                  }
                  if (!fakezoom) {
                     axios.post(`${process.env.REACT_APP_SERVER}/messenger/send`, formData).then((r) => {
                        if (mount.current) {
                           base.scrollTop = base.scrollHeight;
                           chatBox.current.value = "";
                           // console.log("then", r);
                           setSending(false);
                           setImagePreview(null);
                           setShowAction(false);
                           changeEventChatBox({ target: chatBox.current });
                        }
                     });
                  } else {
                     console.log("chat in fakezoom!");
                     axios.post(`${process.env.REACT_APP_SERVER}/messenger/createzoom`, formData).then((r) => {
                        if (mount.current) {
                           base.scrollTop = base.scrollHeight;
                           chatBox.current.value = "";
                           console.log("then", r);
                           setSending(false);
                           setImagePreview(null);
                           setShowAction(false);
                           changeEventChatBox({ target: chatBox.current });
                        }
                     });
                  }
               }}
            >
               {!sending ? (
                  <ion-icon name="send"></ion-icon>
               ) : (
                  <LoadingOutlined />
               )}
            </button>
         </div>
      </div>
   );
}
