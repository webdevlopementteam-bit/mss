import { Link } from "react-router-dom";
import awardbanner from "../assets/awardbanner.png";
import { useEffect, useState } from "react";
import { getAwards } from "../api/services";

const Award = () => {
  const [awards, setAwards] = useState([]);

  useEffect(() => {
    const fetchAwards = async () => {
      try {
        const res = await getAwards();
        setAwards(res.data.data); // 👈 correct path
      } catch (err) {
        console.log(err);
      }
    };

    fetchAwards();
  }, []);
  return (
    <>
      {/* banner section */}
      <div
        className="p-5 relative overflow-hidden py-28"
        style={{
          backgroundImage: `url(${awardbanner})`,
          backgroundPosition: "center center",
          backgroundSize: "cover",
        }}
      >
        <div className="relative z-10 flex flex-col justify-center items-center px-side">
          <h2 className="text-3xl font-semibold text-white">Award</h2>
          <p className="text-white mt-3">
            <span className="text-white hover:text-primaryColor transition-all duration-500 group">
              <Link to="/">
                <i className="fa-regular fa-house text-white group-hover:text-primaryColor transition-all duration-500"></i>{" "}
                Home
              </Link>
            </span>{" "}
            <i className="fa-solid fa-angles-right text-white"></i> Award
          </p>
        </div>
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      <div className="pt-16 pb-20 px-side text-center bg-[#F5F7FA]">
        <p className="text-sm uppercase text-primaryColor font-bold tracking-[0.2em]">
          Our Achievements & Awards
        </p>
        <h3 className="mt-3 text-2xl font-bold">
          Celebrating our dedication to quality, innovation, and customer
          satisfaction.
        </h3>


        <div className="gap-5 justify-center items-center grid grid-cols-3 mt-10">
        {awards.map((award) => (
          <div key={award._id}>
            <div className="border-[1px] rounded-2xl p-5 group">
              <div className="relative overflow-hidden rounded-2xl">
                <img
                  src={`${import.meta.env.VITE_IMAGE_BASE_URL}/${award.image}`}
                  alt={award.name}
                  className="rounded-2xl transition-all duration-500 group-hover:scale-110 h-96 w-full object-cover object-center"
                />
              </div>

              <p className="mt-2 text-xl font-medium">{award.name}</p>
            </div>
          </div>
        ))}
      </div>
      </div>

      
    </>
  );
};

export default Award;
