import { useState, useRef } from "react";
import SignIn from "./SignIn";
import "./LoginPage.scss";
import SignUp from "./SignUp";
import { motion } from "framer-motion";
import { AnimatePresence } from "framer-motion";

export default function LoginPage(props) {
   const [signIn, setSignIn] = useState(true);
   const firtTime = useRef(true);

   function activeBtn(e, signin) {
      let btns = document.querySelectorAll(".lb__button__btn");
      btns.forEach((bt) => {
         bt.classList.remove("active");
      });
      e.target.classList.add("active");
      if (firtTime.current) {
         firtTime.current = false;
      }
      setSignIn(signin);
      let btn = document.querySelectorAll(".lb__button__btn");
      
   }

   const showFormStart = !firtTime.current ? {
      opacity: 0,
      x: "120%",
   } : {
      opacity: 1,
      x: 0,
   }

   const showFormStop = !firtTime.current ? {
      opacity: 1,
      x: 0,
   } : {
      opacity: 1,
      x: 0,
   }

   const hideForm = {
      opacity: 0,
      x: "120%",
   }

   useState(() => {}, []);

   return (
      <div>
         <div className="lb">
            <div className="lb__label">
               <div className="lb__label__base">
                  <h3>
                     Sign In to <br />
                     <span className="lb__label__base__logo">
                        Top <span>Cherry</span>
                     </span>
                  </h3>
                  <div>
                     <p>
                        if you don't have an account <br /> you can{" "}
                        <a href="">Register here</a>
                     </p>
                  </div>
               </div>
            </div>
            <div className="lb__bg">
               <img src={`${process.env.REACT_APP_SERVER}/bg1.png`} alt="" />
            </div>
            <div className="lb__form-bs">
               <AnimatePresence>
                  {signIn ? (
                     <motion.div
                        key={"signin"}
                        transition={{
                           duration: 1
                        }}
                        initial={showFormStart}
                        animate={showFormStop}
                        exit={hideForm}
                     >
                        <SignIn />
                     </motion.div>
                  ) : (
                     <motion.div
                        key={"signup"}
                        transition={{
                           duration: 1
                        }}
                        initial={showFormStart}
                        animate={showFormStop}
                        exit={hideForm}
                     >
                        <SignUp />
                     </motion.div>
                  )}
               </AnimatePresence>
               {/* <SignIn
                  style={
                     !firtTime.current ? ( ? showForm : hideForm) : null
                  }
               />
               <SignUp style={signIn ? hideForm : showForm} /> */}
            </div>
            <div className="lb__button">
               <button
                  onClick={(e) => {
                     activeBtn(e, true);
                  }}
                  className="lb__button__btn active"
               >
                  <span>Sign In</span>
               </button>
               <button
                  onClick={(e) => {
                     activeBtn(e, false);
                  }}
                  className="lb__button__btn"
               >
                  <span>Register</span>
               </button>
            </div>
         </div>
      </div>
   );
}
