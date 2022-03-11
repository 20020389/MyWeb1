import { memo, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import CheckboxSlider from "../../custom/checkbox/CheckBox";
import "./SettingStyle.scss";

const SettingPage = (props) => {
   const [darkTheme, setDarkTheme] = useState(false)
   
   useLayoutEffect(() => {
      const html = document.querySelector("html").classList
      for (let i = 0; i < html.length; i++) {
         if (html[i] === 'dark') {
            setDarkTheme(true)
         }
      }
         
   }, [])

   const changeTheme = (e) => {
      setDarkTheme(e.target.checked);
      const html = document.querySelector("html");
      console.log(e.target.checked);
      if (e.target.checked) {
         html.classList.add("dark");
         localStorage.setItem('theme', 'dark')
      } else {
         html.classList.remove("dark");
         localStorage.setItem('theme', 'light')
      }
   }

   return (
      <>
         <div className="setting">
            <CheckboxSlider type="slider" controll={darkTheme} onChange={changeTheme}/>
         </div>
      </>
   );
}

export default SettingPage