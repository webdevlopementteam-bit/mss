import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import blogbanner from "../assets/blog banner.png";
import { getBlogs } from "../api/services";

const Blog = () => {
  const [blogs, setBlogs] = useState([]);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await getBlogs();
        const data = (res.data.data || []).filter(b => b.isPublished);
        setBlogs(data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchBlogs();
  }, []);

  return (
    <>
      {/* banner section */}
      <div
        className="p-5 relative overflow-hidden py-28"
        style={{
          backgroundImage: `url(${blogbanner})`,
          backgroundPosition: "center center",
          backgroundSize: "cover",
        }}
      >
        <div className="relative z-10 flex flex-col justify-center items-center px-side">
          <h2 className="text-3xl font-semibold text-white">Blog</h2>
          <p className="text-white mt-3">
            <span className="text-white hover:text-primaryColor transition-all duration-500 group">
              <Link to="/">
                <i className="fa-regular fa-house text-white group-hover:text-primaryColor transition-all duration-500"></i>{" "}
                Home
              </Link>
            </span>{" "}
            <i className="fa-solid fa-angles-right text-white"></i> Blog
          </p>
        </div>
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      {/* blog section */}
      <div className="pt-16 pb-20 px-side text-center bg-[#F5F7FA]">
        <p className="text-sm uppercase text-primaryColor font-bold tracking-[0.2em]">
          Our Blog
        </p>
        <h3 className="mt-3 text-3xl md:text-4xl font-bold">
          Our Latest News & <span className="text-primaryColor">Blog</span>
        </h3>

        <div className="gap-5 justify-center items-center grid grid-cols-3 mt-10">
          {blogs.map((blogitem) => (
            <div key={blogitem._id}>
              <div className="border-[1px] rounded-2xl p-5 group">
                <div className="relative overflow-hidden rounded-2xl">
                  <img
                    src={`${import.meta.env.VITE_IMAGE_BASE_URL}/${blogitem.image}`}
                    alt={blogitem.name}
                    className="rounded-2xl transition-all duration-500 group-hover:scale-110"
                  />
                  <p className="absolute bottom-8 right-0 py-1 px-4 rounded-l-3xl text-white bg-primaryColor">
                    <i className="fa-solid fa-calendar-days text-white"></i>{" "}
                    {new Date(blogitem.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>

                <div className="flex gap-7 py-3 border-b-[1px] justify-start items-center">
                  <div>
                    <i className="fa-regular fa-circle-user text-primaryColor"></i>{" "}
                    MSS
                  </div>
                  <div>
                    <i className="fa-regular fa-comments text-primaryColor"></i>{" "}
                    0 Comments
                  </div>
                </div>

                <p className="mt-2 text-xl font-semibold">{blogitem.name}</p>

                <p
                  className="mt-2 text-black/50 line-clamp-2"
                  dangerouslySetInnerHTML={{
                    __html: blogitem.description,
                  }}
                ></p>

                <Link
                  to={`/blog/${blogitem.slug}`}
                  className="mt-7 inline-block relative py-3 px-6 bg-primaryColor text-white rounded-2xl group/btn overflow-hidden"
                >
                  <span className="text-white relative z-10">
                    Read More{" "}
                    <i className="fa-solid fa-arrow-right text-white"></i>
                  </span>
                  <div className="absolute inset-0 scale-0 opacity-0 transition-all duration-500 origin-center group-hover/btn:opacity-100 group-hover/btn:scale-100 rounded-2xl bg-secondaryColor"></div>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Blog;
