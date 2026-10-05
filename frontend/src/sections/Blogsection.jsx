import { useEffect, useState } from "react";
import { getBlogs } from "../api/services";
import { SectionHeader } from "../components/ui/ProductRail";
import { Link } from "react-router-dom";
import { BlogCard } from "../components/ui/BlogCard";
import { blogImage, formatDate, stripHtml } from "../components/ui/blogUtils";

/* Home-page blog teaser: the latest story as a large lead card, the next
 * two stacked beside it on desktop. */
export const Blogsection = () => {
  const [blogs, setBlogs] = useState([]);

  useEffect(() => {
    getBlogs()
      .then((res) => setBlogs((res.data.data || []).filter((b) => b.isPublished)))
      .catch((err) => console.log(err));
  }, []);

  if (blogs.length === 0) return null;

  const [lead, ...rest] = blogs.slice(0, 3);

  return (
    <section className="px-4 md:px-6 lg:px-side mt-12 md:mt-20">
      <SectionHeader
        eyebrow="Our Blog"
        title="Latest News & Insights"
        subtitle="Product guides, healthcare tips and updates from our team."
        viewAllTo="/blog"
        viewAllLabel="All Articles"
      />

      <div className={`grid gap-4 md:gap-5 ${rest.length ? "lg:grid-cols-5" : ""}`}>
        <div className={rest.length ? "lg:col-span-3" : ""}>
          <BlogCard blog={lead} featured />
        </div>
        {rest.length > 0 && (
          <div className="lg:col-span-2 grid sm:grid-cols-2 lg:grid-cols-1 gap-4 md:gap-5">
            {rest.map((b) => (
              <BlogCompact key={b._id} blog={b} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

// Compact side story: thumbnail left, text right.

const BlogCompact = ({ blog }) => (
  <Link
    to={`/blog/${blog.slug}`}
    className="group flex gap-4 bg-white rounded-2xl border border-gray-200/80 p-3 md:p-4 hover:border-transparent hover:shadow-[0_18px_40px_-15px_rgba(2,51,80,0.28)] transition-all duration-300"
  >
    <div className="relative shrink-0 w-28 md:w-36 aspect-square rounded-xl overflow-hidden bg-gray-100">
      <img
        src={blogImage(blog.image)}
        alt={blog.name}
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
    </div>
    <div className="min-w-0 flex flex-col py-1">
      <span className="text-xs font-semibold !text-secondaryColor">{formatDate(blog.createdAt)}</span>
      <h3 className="mt-1.5 text-[15px] md:text-base font-bold leading-snug line-clamp-2 !text-[#023350] group-hover:!text-primaryColor transition-colors">
        {blog.name}
      </h3>
      <p className="mt-1.5 text-[13px] leading-relaxed line-clamp-2 !text-gray-500">{stripHtml(blog.description)}</p>
      <span className="mt-auto pt-2 inline-flex items-center gap-1.5 text-xs font-semibold !text-primaryColor">
        Read more <i className="fa-solid fa-arrow-right text-[10px] !text-primaryColor"></i>
      </span>
    </div>
  </Link>
);

export default Blogsection;
