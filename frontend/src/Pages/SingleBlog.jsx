import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import blogbanner from "../assets/blog banner.png";
import { getOneBlog } from "../api/services";
import { setPageMeta, resetPageMeta } from "../utils/pageMeta";

// blog.description is rich-text HTML — strip tags before using it as a
// fallback meta description so raw markup never ends up in the tag.
const stripHtml = (html) => html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

const SingleBlog = () => {
  const { slug } = useParams(); // 👈 URL se value aayegi
  const [blog, setBlog] = useState(null);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const res = await getOneBlog(slug); // 👈 yaha pass karo
        const data = res.data.data;
        setBlog(data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchBlog();
  }, [slug]);

  // SEO: use the admin-entered Meta Title / Meta Description when present,
  // falling back to the blog's own name/description (same pattern as the
  // product details page).
  useEffect(() => {
    if (!blog) return;

    const title = blog.metaTitle || blog.name;
    const rawDescription = blog.metaDescription || stripHtml(blog.description || "");
    const description = rawDescription ? rawDescription.slice(0, 160) : undefined;

    setPageMeta({ title, description });

    return () => resetPageMeta();
  }, [blog]);

  if (!blog) return <p>Loading...</p>;

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
          <h2 className="text-3xl font-semibold text-white">{blog.name}</h2>

          <p className="text-white mt-3">
            <Link to="/">Home</Link>{" "}
            <i className="fa-solid fa-angles-right text-white"></i> Blog
          </p>
        </div>

        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      <div className="flex items-center justify-center">
        <div className="py-12 flex flex-col gap-3 items-start justify-center w-[900px]">
          <div>
            <img
              src={`${import.meta.env.VITE_IMAGE_BASE_URL}/${blog.image}`}
              alt={blog.name}
              className="h-[500px] w-[900px] rounded-xl object-cover"
            />
          </div>
          <div className="flex gap-7 py-3 border-b-[1px] justify-start items-center w-full">
            <div>
              <i className="fa-regular fa-circle-user text-secondaryColor"></i>{" "}
              MSS
            </div>
            <div>
              <i className="fa-solid fa-calendar-days text-secondaryColor"></i>{" "}
              {new Date(blog.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </div>
          </div>

          <p className="mt-2 text-xl font-semibold">{blog.name}</p>

          <p
            className="mt-2 text-black/50"
            dangerouslySetInnerHTML={{
              __html: blog.description,
            }}
          ></p>
        </div>
      </div>
    </>
  );
};

export default SingleBlog;
