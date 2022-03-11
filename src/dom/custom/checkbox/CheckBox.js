import "./CheckboxStyle.scss";

export default function CheckBox({ className, onChange, type, controll }) {
   const changeFc = (e) => {
      if (onChange) {
         onChange(e);
      }
   };

   function renderSwitch() {
      switch (type) {
         case "slider":
            return (
               <div
                  className={`checkbox__slider${
                     className ? " " + className : ""
                  }`}
               >
                  <input
                     type="checkbox"
                     checked={controll}
                     onChange={changeFc}
                  />
               </div>
            );
            break;

         default:
            break;
      }
   }

   return <>{
      renderSwitch()
   }</>;
}
