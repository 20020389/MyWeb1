import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { memo, useRef } from "react";
import { Link } from "react-router-dom";
import auth from "../../database/firebase/firebase";

const SignUp = ({style}) => {
   const user = useRef()
   const pass1 = useRef()
   const pass2 = useRef()
   const logAuth = useRef()

   function removeError(e) {
      let par = e.target.parentNode.classList
      if (par.length >= 2 && par[1] === 'error') {
         user.current.parentNode.classList.remove('error')
         pass1.current.parentNode.classList.remove('error')
         pass2.current.parentNode.classList.remove('error')
         logAuth.current.classList.remove('show')
         logAuth.current.classList.remove('animation')
         logAuth.current.textContent = ""
      }
   }

   async function signUp(e) {
      let name = user.current.value
      let password1 = pass1.current.value
      let password2 = pass2.current.value
      if (password1 !== password2) {
         console.log('wrong');
         pass1.current.parentNode.classList.add('error')
         pass2.current.parentNode.classList.add('error')
         logAuth.current.textContent = "confirm password wrong!!!"
         logAuth.current.classList.add('show')
         logAuth.current.classList.add('animation')
         logAuth.current.textContent = "Wrong user and pasword !!!"
         setTimeout(() => {
            logAuth.current.classList.remove('animation')
         }, 1200);
         return
      }
      if (password1.length < 0 || password2.length < 6) {
         console.log('wrong');
         pass1.current.parentNode.classList.add('error')
         pass2.current.parentNode.classList.add('error')
         logAuth.current.textContent = "password must be more than 6 character!!!"
         logAuth.current.classList.add('animation')
         logAuth.current.classList.add('show')
         setTimeout(() => {
            logAuth.current.classList.remove('animation')
         }, 755);
         return
      }

      try {
         let userToken = await createUserWithEmailAndPassword(auth, name, password1)
         sendEmailVerification(userToken.user).then(r => {
            console.log('verified');
         }).catch(err => {
            console.log('verify failed');
         })
      } catch (error) {
         user.current.parentNode.classList.add('error')
         logAuth.current.textContent = "email already exits!!!"
         logAuth.current.classList.add('animation')
         logAuth.current.classList.add('show')
         setTimeout(() => {
            logAuth.current.classList.remove('animation')
         }, 1200);
      }
   }

   return (
      <>
         <form
            style={style}
            action=""
            className="lb__form"
            onSubmit={(e) => {
               e.preventDefault();
               signUp(e)
            }}
         >
            <div className="lb__form__input">
               <input ref={user} type="email" placeholder="Enter email" onChange={removeError}/>
               <div></div>
            </div>
            <div className="lb__form__input">
               <input ref={pass1} type="password" placeholder="Password" onChange={removeError}/>
               <button onClick={(e) => {
                  if (pass1.current.type === "text") {
                     pass1.current.type = "password"
                     e.target.childNodes[0].name = "eye-off"
                  } else {
                     pass1.current.type = "text"
                     e.target.childNodes[0].name = "eye"
                  }
               }} type="button" tabIndex="-1">
                  <ion-icon name="eye-off"></ion-icon>
               </button>
               <div></div>
            </div>
            <div className="lb__form__input">
               <input ref={pass2} type="password" placeholder="Password" onChange={removeError}/>
               <button onClick={(e) => {
                  if (pass2.current.type === "text") {
                     pass2.current.type = "password"
                     e.target.childNodes[0].name = "eye-off"
                  } else {
                     pass2.current.type = "text"
                     e.target.childNodes[0].name = "eye"
                  }
               }} type="button" tabIndex="-1">
                  <ion-icon name="eye-off"></ion-icon>
               </button>
               <div></div>
            </div>
            <div ref={logAuth} className="lb__form__error-log"></div>
            <button style={{marginTop: '0', outline: 'none'}}>Register</button>
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
         </form>
      </>
   );
};

export default memo(SignUp);
