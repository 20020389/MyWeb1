import { Skeleton } from "antd";
import axios from "axios";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import "./StikerStyle.scss";

function Image({ src }) {
   const [loading, setLoading] = useState(true);

   return (
      <div
         style={{
            position: "relative",
            minHeight: "40px",
            minWidth: "40px",
         }}
      >
         <img
            src={src}
            onLoad={(e) => {
               setLoading(false);
            }}
            style={loading ? { opacity: 0 } : {}}
            alt=""
         />
         {loading && (
            <div
               style={{
                  position: "absolute",
                  left: "0",
                  top: "0",
               }}
            >
               <Skeleton.Button
                  active
                  style={{
                     height: "50px",
                  }}
               />
            </div>
         )}
      </div>
   );
}

function useSticker(name = "face") {
   const [listSticker, setListSticker] = useState([]);
   const [loading, setLoading] = useState(true);
   const [nameSticker, setNameSticker] = useState(name);

   useEffect(() => {
      axios.get(`/sticker/${nameSticker}/package.json`).then((r) => {
         const data = r.data;
         if (data.name) {
            setListSticker(data.link);
            setLoading(false);
         }
      });
   }, [nameSticker]);

   return [listSticker, loading, name, setNameSticker];
}

const StickerCompoment = ({ onSendSticker }) => {
   const [data, loading, name, setNameSticker] = useSticker("face");

   useEffect(() => {
      let ele = document.querySelector('.sticker__list-choose')
      let child = ele.querySelector("li[name=face]")
      if (child) {
         child.style.backgroundColor = "var(--messenger-active-zoom)"
      }
      return () => {

      }
   }, [name])

   const renderListSkeleton = useMemo(() => {
      const list = []
      for (let i = 0; i < 20; i++) {
         list.push((
            <li key={i}>
               <Skeleton.Button active style={{
                  width: "70px",
                  height: "70px"
               }} className="sticker__list-sticker__skeleton"/>
            </li>
         ))
      }
      return list
   }, [])

   const renderListData = useMemo(() => {
      return data.map((item, index) => {
         return <li key={index}>
            <button className="bt" onClick={() => {
               if (onSendSticker && typeof onSendSticker === "function") {
                  onSendSticker(item)
               }
            }}>
               <img src={item} alt="" />
            </button>
         </li>
      })
   }, [data])

   // console.log('stickerCompoment.jsx 100', data);

   return (
      <>
         <ul className="sticker__list-choose">
            <li name="face">
               <button className="sticker__list-choose__btn bt">
                  <img src="/sticker/face/face (1).png" alt="" />
               </button>
            </li>
         </ul>
         <ul className="sticker__list-sticker scroll-y">
         {loading ? renderListSkeleton : renderListData}
         </ul>
      </>
   );
};

export default memo(StickerCompoment);
