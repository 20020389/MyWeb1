import { Avatar, Button, List, Skeleton } from "antd";
import axios from "axios";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../../AppController";
import randomkey from "../messenger/messengerwith/randomkey";
import "./SearchPageStyle.scss";

export default function SearchPage(props) {
   const url = useLocation();
   const dataController = useContext(AppContext);
   const [loading, setLoading] = useState(true);
   const [mobilemode, setMobileMode] = useState(false);
   const [data, setData] = useState([]);
   const [disableBtn, setDisableBtn] = useState(false);
   const navigate = useNavigate();

   useEffect(() => {
      setLoading(true);
      setDisableBtn(false);
      const path = url.search;
      if (path.indexOf("?p=") !== -1) {
         axios
            .get(path)
            .then((r) => {
               console.log(r.data);
               setData(r.data.list);
               setLoading(false);
            })
            .catch((err) => {
               console.log(err);
               setData([]);
               setLoading(false);
            });
      } else {
         setData([]);
         setLoading(false);
      }
   }, [url]);

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

   const createNewZoomChat = useCallback(async (uid) => {
      const data = (
         await axios.get(
            `/search/searchzoom?fi=${uid}&cui=${dataController.user.uid}`
         )
      ).data;
      if (data.exits) {
         navigate(`/messenger/${data.id}`);
      } else {
         const newzoomid = randomkey(20);
         navigate(`/messenger/${newzoomid}&user=${uid}`);
      }
   }, []);

   return (
      <>
         <div className="search-base">
            <div className="search-page">
               {!loading ? (
                  <List
                     className="search-page__list"
                     size="large"
                     dataSource={data}
                     renderItem={(item) => (
                        <List.Item className="search-page__item">
                           <List.Item.Meta
                              avatar={
                                 <Avatar
                                    src={item.avatar}
                                    size={!mobilemode ? "large" : "default"}
                                 />
                              }
                              title={
                                 <div className="search-page__item-title">
                                    <div
                                       style={{
                                          display: "flex",
                                          alignItems: "center",
                                       }}
                                    >
                                       <Link to="">{item.name}</Link>
                                       <Button
                                          type="link"
                                          disabled={disableBtn}
                                          style={{
                                             display: "flex",
                                             alignItems: "center",
                                          }}
                                          onClick={(e) => {
                                             if (!disableBtn) {
                                                setDisableBtn(true);
                                             }
                                             createNewZoomChat(item.uid);
                                          }}
                                          size={
                                             !mobilemode ? "middle" : "small"
                                          }
                                       >
                                          <ion-icon name="chatbubbles"></ion-icon>
                                       </Button>
                                    </div>
                                    <Button type="link">
                                       <ion-icon name="person-add-sharp"></ion-icon>
                                    </Button>
                                 </div>
                              }
                           />
                        </List.Item>
                     )}
                  />
               ) : (
                  <>
                     <Skeleton active avatar paragraph={{ rows: 1 }} />
                     <Skeleton active avatar paragraph={{ rows: 1 }} />
                     <Skeleton active avatar paragraph={{ rows: 1 }} />
                  </>
               )}
            </div>
         </div>
      </>
   );
}
