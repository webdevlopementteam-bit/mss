import { Link } from "react-router-dom";

import { blogImage, formatDate, readMinutes, stripHtml } from "./blogUtils";

/* `featured` renders the large horizontal variant used for the lead story. */
export const BlogCard = ({ blog, featured = false }) => {
  const url = `/blog/${blog.slug}`;
  const excerpt = stripHtml(blog.description);

  return (
    <article
      className={`group h-full bg-white rounded-2xl border border-gray-200/80 overflow-hidden flex transition-all duration-300 hover:border-transparent hover:shadow-[0_18px_40px_-15px_rgba(2,51,80,0.28)] ${
        featured ? "flex-col md:flex-row" : "flex-col"
      }`}
    >
      <Link
        to={url}
        className={`relative block overflow-hidden bg-gray-100 shrink-0 ${
          featured ? "aspect-[16/10] md:aspect-auto md:w-[55%] md:min-h-[320px]" : "aspect-[16/10]"
        }`}
      >
        <img
          src={blogImage(blog.image)}
          alt={blog.name}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 bg-white/95 backdrop-blur rounded-lg px-2.5 py-1.5 shadow-sm">
          <i className="fa-regular fa-calendar text-[10px] !text-primaryColor"></i>
          <span className="text-[11px] font-semibold !text-[#023350]">{formatDate(blog.createdAt)}</span>
        </span>
      </Link>

      <div className={`flex flex-col flex-1 ${featured ? "p-5 md:p-8 md:justify-center" : "p-4 md:p-5"}`}>
        <div className="flex items-center gap-3 text-xs !text-gray-500">
          <span className="inline-flex items-center gap-1.5 !text-gray-500">
            <i className="fa-solid fa-feather-pointed text-[10px] !text-secondaryColor"></i>
            MSS Team
          </span>
          <span className="w-1 h-1 rounded-full bg-gray-300" />
          <span className="!text-gray-500">{readMinutes(blog.description)} min read</span>
        </div>

        <Link to={url}>
          <h3
            className={`mt-2.5 font-bold !text-[#023350] leading-snug line-clamp-2 group-hover:!text-primaryColor transition-colors ${
              featured ? "text-xl md:text-[26px]" : "text-[16px] md:text-lg"
            }`}
          >
            {blog.name}
          </h3>
        </Link>

        <p className={`mt-2 text-sm leading-relaxed !text-gray-500 ${featured ? "line-clamp-4" : "line-clamp-3"}`}>
          {excerpt}
        </p>

        <Link
          to={url}
          className="mt-auto pt-4 inline-flex items-center gap-2 text-sm font-semibold !text-primaryColor group/link"
        >
          <span className="!text-primaryColor">Read article</span>
          <i className="fa-solid fa-arrow-right text-xs !text-primaryColor transition-transform group-hover/link:translate-x-1"></i>
        </Link>
      </div>
    </article>
  );
};

export const BlogCardSkeleton = () => (
  <div className="bg-white rounded-2xl border border-gray-200/80 overflow-hidden">
    <div className="aspect-[16/10] bg-gray-100 animate-pulse" />
    <div className="p-5 space-y-2.5">
      <div className="h-3 w-1/3 bg-gray-100 rounded animate-pulse" />
      <div className="h-4 bg-gray-100 rounded animate-pulse" />
      <div className="h-3 w-5/6 bg-gray-100 rounded animate-pulse" />
    </div>
  </div>
);

export default BlogCard;
