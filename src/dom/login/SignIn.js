import { memo, useContext, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
   signInWithEmailAndPassword,
   sendPasswordResetEmail,
   sendEmailVerification
} from "firebase/auth";
import { motion } from "framer-motion";
import auth from "../../database/firebase/firebase";
import { AppContext } from "../AppController";

const SignIn = ({ style, initial, exit, animate, transition }) => {
   const [recoverPass, setRecoverPass] = useState(false);
   const user = useRef();
   const pass = useRef();
   const logAuth = useRef();
   const appController = useContext(AppContext)

   function removeError(e) {
      let par = e.target.parentNode.classList;
      if (par.length >= 2 && par[1] === "error") {
         user.current.parentNode.classList.remove("error");
         pass.current.parentNode.classList.remove("error");
         logAuth.current.classList.remove("show");
      }
   }

   function signIn() {
      signInWithEmailAndPassword(auth, user.current.value, pass.current.value)
         .then((res) => {
            console.log(res);
         })
         .catch((err) => {
            console.log(err);
            user.current.parentNode.classList.add("error");
            pass.current.parentNode.classList.add("error");
            logAuth.current.classList.add("animation");
            logAuth.current.classList.add("show");
            setTimeout(() => {
               logAuth.current.classList.remove("animation");
            }, 1200);
         });
   }

   function recoverPassword() {
      sendPasswordResetEmail(auth, user.current.value)
         .then((res) => {
            alert("Please check your email to forgot password!");
         })
         .catch((err) => {
            console.log(err);
            logAuth.current.classList.add("animation");
            logAuth.current.classList.add("show");
            setTimeout(() => {
               logAuth.current.classList.remove("animation");
            }, 1200);
         });
   }

   return (
      <>
         <motion.form
            /* initial={initial}
            exit={exit}
            animate={animate}
            transition={transition} */
            action=""
            className="lb__form"
            onSubmit={(e) => {
               e.preventDefault();
               if (!recoverPass) {
                  signIn();
               } else {
                  recoverPassword();
               }
            }}
         >
            <div className="lb__form__input">
               <input
                  ref={user}
                  name="email"
                  type="email"
                  placeholder="Enter email"
                  onChange={removeError}
               />
               <div></div>
            </div>
            <>
               <div
                  className={`lb__form__input${!recoverPass ? "" : " disable"}`}
               >
                  <input
                     ref={pass}
                     name="password"
                     type="password"
                     placeholder="Password"
                     onChange={removeError}
                  />
                  <button
                     onClick={(e) => {
                        if (pass.current.type === "text") {
                           pass.current.type = "password";
                           e.target.childNodes[0].name = "eye-off";
                        } else {
                           pass.current.type = "text";
                           e.target.childNodes[0].name = "eye";
                        }
                     }}
                     type="button"
                     tabIndex="-1"
                  >
                     <ion-icon name="eye-off"></ion-icon>
                  </button>
                  <div></div>
               </div>
               <Link
                  to="#"
                  onClick={(e) => {
                     if (!recoverPass) {
                        setRecoverPass(true);
                        pass.current.value = "";
                        pass.current.disabled = true;
                     } else {
                        setRecoverPass(false);
                        pass.current.disabled = false;
                     }
                     user.current.parentNode.classList.remove("error");
                     pass.current.parentNode.classList.remove("error");
                     logAuth.current.classList.remove("show");
                  }}
               >
                  {!recoverPass
                     ? "Recover password ?"
                     : "You want to sign in ?"}
               </Link>
               <div ref={logAuth} className="lb__form__error-log">
                  {!recoverPass
                     ? "Wrong user or pasword !!!"
                     : "Can't find your user !!!"}
               </div>
               <button>{!recoverPass ? "Sign In" : "Recover"}</button>
            </>
            <div className="lb__form__ocw">
               <span>or continue with</span>
            </div>
            <div className="lb__form__link">
               <button type="button">
                  <Link to="">
                     <ion-icon src={`${process.env.REACT_APP_SERVER}/icon/google_icon.svg`}></ion-icon>
                  </Link>
               </button>
               <button type="button">
                  <Link to="">
                     <ion-icon name="logo-apple"></ion-icon>
                  </Link>
               </button>
               <button type="button">
                  <Link to="">
                     <ion-icon src={`${process.env.REACT_APP_SERVER}/icon/facebook_icon.svg`}></ion-icon>
                  </Link>
               </button>
            </div>
         </motion.form>
      </>
   );
};

export default memo(SignIn);
