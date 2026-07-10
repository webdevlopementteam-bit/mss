import { Link } from "react-router-dom";
import privacypolicybanner from "../assets/privacypolicybanner.jpg";
import faqs from "../assets/faqs.png";
import { faq } from "../data";
import { useState } from "react";

const Faq = () => {
    const [open, setOpen] = useState(1);
  return (
    <>
      {/* banner section */}
      <div
        className="p-5 relative overflow-hidden py-28"
        style={{
          backgroundImage: `url(${privacypolicybanner})`,
          backgroundPosition: "center center",
          backgroundSize: "cover",
        }}
      >
        <div className="relative z-10 flex flex-col justify-center items-center px-side">
          <h2 className="text-3xl font-semibold text-white">FAQs</h2>
          <p className="text-white mt-3">
            <span className="text-white hover:text-primaryColor transition-all duration-500 group">
              <Link to="/">
                <i className="fa-regular fa-house text-white group-hover:text-primaryColor transition-all duration-500"></i>{" "}
                Home
              </Link>
            </span>{" "}
            <i className="fa-solid fa-angles-right text-white"></i> FAQs
          </p>
        </div>
        <div className="absolute inset-0 bg-black/30"></div>
      </div>

      {/* faq section */}
      <div className="px-side py-16 grid grid-cols-3 gap-7">
        <div className="col-span-2">
            {faq.map((faq)=>(
                <div key={faq.id}>
                   <div className="border-[1px] border-black/10 rounded-xl mb-3">
                     <div onClick={()=>setOpen(open === faq.id ? null : faq.id)} className={`flex justify-between items-center pb-3 px-3 py-3 ${open === faq.id ? "border-b-[1px] border-black/10" : " "}`}>
                        <p className="pr-8"><span className="bg-primaryColor p-1 rounded-lg"><i className="fa-solid fa-question text-white"></i></span> &nbsp;&nbsp;{faq.question}</p>
                        <i className={`fa-solid fa-angle-down text-black/50 ${open === faq.id ? 'rotate-180': ''}`}></i>
                    </div>
                    {open === faq.id && (
                        <div className='p-3'>
                        <p>{faq.answer}</p>
                    </div>
                    )}
                    
                   </div>
                </div>
            ))}
        </div>
        <div>
            <img src={faqs} alt="faq" />
        </div>
      </div>
    </>
  )
}

export default Faq
