import { sendEmailVerification, signOut } from "firebase/auth";
import { Link } from "react-router-dom";
import auth from "../../../database/firebase/firebase";

export default function VerifiPage(props) {
   

   return (
      <>
         <div
            style={{
               display: "flex",
               alignItems: "center",
               flexFlow: "column",
               boxSizing: "border-box",
               padding: "100px 50px 0 50px",
               height: "100vh",
               fontFamily: `"Poppins", sans-serif`,
               fontSize: "20px",
            }}
         >
            <h2>
               We have sent you an email to confirm your registration.
            </h2>
            <h2>Please, check and activate your account then refresh this page.</h2>
            <p>
               You did not receive the email ?{" "}
               <Link
                  to=""
                  style={{ textDecoration: "none" }}
                  onClick={() => {
                     sendEmailVerification(auth.currentUser).then(r => {
                        console.log('verified');
                        console.log(r);
                     }).catch(err => {
                        console.log(err);
                        console.log('verify failed');
                     })
                  }}
               >
                  Resend email
               </Link>
               , if you verifyed you can {" "}
               <Link
                  to=""
                  style={{ textDecoration: "none" }}
                  onClick={() => {
                     window.location.reload();
                  }}
               >
                  Reload Page
               </Link>
               {" "} or you wanna <Link
                  to=""
                  style={{ textDecoration: "none" }}
                  onClick={() => {
                     signOut(auth)
                  }}
               >
                  Logout
               </Link>
               {" "}?
               .
            </p>
         </div>
      </>
   );
}
