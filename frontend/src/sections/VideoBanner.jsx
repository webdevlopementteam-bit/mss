import React from 'react'
import banner1 from "../assets/home/banner1.jpg";

export const VideoBanner = () => {
  return (
   <>
    <div
           className="mt-16 py-44 flex justify-center items-center  "
           style={{
             backgroundImage: `url(${banner1})`,
             backgroundPosition: "center center",
             backgroundSize: "cover",
           }}
         >
           <a
             href="#"
             className="bg-primaryColor rounded-full w-16 h-16 flex justify-center items-center animate-ringing"
           >
             <i className="fa-solid fa-play text-white text-xl"></i>
           </a>
         </div>
   </>
  )
}
