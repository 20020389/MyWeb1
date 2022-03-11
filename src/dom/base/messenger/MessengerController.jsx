import { Route } from "react-router-dom";
import MessengerPage from "./MessengerPage";


export default function MessengerController(props) {

   return (
      <>
         <Route path="/messenger" element={<MessengerPage />} />
         <Route path="/messenger/:zoomchat" element={<MessengerPage />} />
         <Route path="/messenger/:zoomchat&user=:user" element={<MessengerPage />} />
      </>
   );
};
