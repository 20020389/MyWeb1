import { useContext, useState } from "react";
import { MainContext } from "./App";
import ReactDOM from "react-dom";
import { motion } from "framer-motion";
import { AppContext } from "../AppController";

export function useProvider() {
   const { listChat, loadingChat, online } = useContext(MainContext);

   return [listChat, loadingChat, online];
}

export function useNewMessage() {
   const { newMessage, setNewMessage } = useContext(MainContext);

   return [newMessage, setNewMessage];
}

export function useUserData() {
   const { userData, setUserData } = useContext(AppContext);

   return [userData, setUserData];
}

export function useMobileMode() {
   const { mobilemode } = useContext(AppContext)

   return [mobilemode]
}



export function useTooltip(delay = 0, min, max, position = "r") {
   const [show, setShow] = useState(undefined);

   const hover = (e) => {
      if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
         console.log("mobile");
         return
      }
      let target = e.target.closest(".leftbar__list__item");
      var bodyRect = document.body.getBoundingClientRect();
      let elemRect = target.getBoundingClientRect();
      let x = elemRect.left - bodyRect.left + elemRect.width;
      let y = elemRect.top - bodyRect.top + (elemRect.height / 2);
      if (position === "r") {
         x += 12;
      }
      let display = "block"
      if (min !== undefined && max !== undefined) {
         let width = window.innerWidth
         if (width < min || width > max) {
            display = "none"
         }
      } else if (min !== undefined && max === undefined) {
         let width = window.innerWidth
         if (width < min) {
            display = "none"
         }
      } else if (min === undefined && max !== undefined) {
         let width = window.innerWidth
         if (width > max) {
            display = "none"
         }
      } 
      // console.log(elemRect);
      let name = target.name ? target.name : "tooltip";
      ReactDOM.render(
         <motion.div
            initial={{ opacity: 0, y: "-50%" }}
            animate={{ opacity: 1, y: "-50%" }}
            transition={{
               delay: delay,
            }}
            className="tooltip-custom"
            style={{ left: `${x}px`, top: `${y}px` , display: display}}
         >
            {name}
         </motion.div>,
         document.getElementById("tooltip-base")
      );
   };

   const blur = (e) => {
      if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
         console.log("mobile");
         return
      }
      ReactDOM.render(<></>, document.getElementById("tooltip-base"));
   };

   return { hover, blur };
}
