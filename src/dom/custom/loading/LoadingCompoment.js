import { useEffect, useRef, useState } from "react";
import "./loadingStyle.scss";

export default function LoadingCompoment({
   type,
   width,
   height,
   strokeWidth,
   color,
   value,
   background,
   zoom,
   className,
   animate
}) {
   const r = (width - strokeWidth) / 2;
   const [localValue, setLocalValue] = useState(0)
   const sliderBar = useRef()
   const time = useRef(0)

   useEffect(() => {
      let unAnmation = undefined
      if (animate) {
         unAnmation = setInterval(() => {
            setLocalValue(prev => prev + 1)
            time.current ++
            if (time.current > 100) {
               setLocalValue(prev => 0)
               time.current = 0
            }
            let rotate = time.current * 3.6 - 90
            sliderBar.current.style.transform = `rotateZ(${rotate}deg)`
         }, 20)
      }
      return () => {
         if (unAnmation) {
            clearInterval(unAnmation)
         }
      }
   }, [])

   return (
      <>
         {type === "slider" ? (
            <svg
               ref={sliderBar}
               className={`loading${className ? ' ' + className : ''}`}
               width={width}
               height={height}
               fill="transparent"
               style={{zoom: zoom, minWidth: `${width}px`}}
            >
               <circle
                  strokeLinecap="round"
                  stroke-mitterlimit="0"
                  cx={width / 2}
                  cy={height / 2}
                  r={r}
                  strokeWidth={strokeWidth}
                  stroke={background ? background : "transparent"}
                  fill="transparent"
               />
               <circle
                  strokeLinecap="round"
                  stroke-mitterlimit="0"
                  cx={width / 2}
                  cy={height / 2}
                  r={r}
                  strokeWidth={strokeWidth}
                  stroke={color}
                  strokeDasharray={2 * (22 / 7) * r}
                  strokeDashoffset={(1 - localValue / 100) * (2 * (22 / 7) * r)}
                  strokeLinecap="butt"
                  fill="transparent"
               />
            </svg>
         ) : <div className="threedot" style={{zoom: zoom}}>
               <span style={color && {backgroundColor: color}}></span>
               <span style={color && {backgroundColor: color}}></span>
               <span style={color && {backgroundColor: color}}></span>
            </div>}
      </>
   );
}
