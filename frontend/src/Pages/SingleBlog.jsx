import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getBlogs, getOneBlog } from "../api/services";
import { setPageMeta, resetPageMeta } from "../utils/pageMeta";
import { BlogCard } from "../components/ui/BlogCard";
import { blogImage, formatDate, readMinutes, stripHtml } from "../components/ui/blogUtils";

const SingleBlog = () => {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [more, setMore] = useState([]);

  useEffect(() => {
    let cancelled = false;
    setBlog(null);
    setNotFound(false);
    getOneBlog(slug)
      .then((res) => !cancelled && setBlog(res.data.data))
      .catch(() => !cancelled && setNotFound(true));
    getBlogs()
      .then((res) => {
        if (cancelled) return;
        setMore((res.data.data || []).filter((b) => b.isPublished && b.slug !== slug).slice(0, 3));
      })
      .catch(() => {});
    window.scrollTo(0, 0);
    return () => {
      cancelled = true;
    };
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

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: blog.name, url });
      else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard");
      }
    } catch {
      /* share sheet dismissed */
    }
  };

  if (notFound) {
    return (
      <div className="py-28 px-4 text-center">
        <i className="fa-regular fa-newspaper text-4xl !text-gray-300"></i>
        <h2 className="mt-4 text-2xl font-bold !text-gray-800">Article not found</h2>
        <Link to="/blog" className="mt-6 inline-flex items-center gap-2 bg-primaryColor px-6 py-3 rounded-xl font-semibold !text-white">
          <i className="fa-solid fa-arrow-left text-xs !text-white"></i> Back to Blog
        </Link>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="px-4 md:px-6 lg:px-side py-12 max-w-4xl mx-auto space-y-4">
        <div className="h-4 w-40 bg-gray-100 rounded animate-pulse" />
        <div className="h-10 w-4/5 bg-gray-100 rounded animate-pulse" />
        <div className="aspect-[16/8] bg-gray-100 rounded-2xl animate-pulse" />
        <div className="h-4 bg-gray-100 rounded animate-pulse" />
        <div className="h-4 w-5/6 bg-gray-100 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="bg-[#F6F7F9] pb-14 md:pb-20">
      {/* Article header */}
      <div className="relative overflow-hidden bg-[#023350]">
        <div className="pointer-events-none absolute -top-24 -right-16 w-80 h-80 rounded-full bg-secondaryColor/25 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:radial-gradient(white_1px,transparent_1px)] [background-size:18px_18px]" />
        <div className="relative px-4 md:px-6 lg:px-side pt-8 md:pt-12 pb-28 md:pb-40">
          <div className="max-w-4xl mx-auto">
            <nav className="text-xs mb-4 flex items-center gap-2">
              <Link to="/" className="!text-white/60 hover:!text-white">Home</Link>
              <i className="fa-solid fa-chevron-right text-[8px] !text-white/40"></i>
              <Link to="/blog" className="!text-white/60 hover:!text-white">Blog</Link>
            </nav>
            <h1 className="text-2xl md:text-[40px] font-bold leading-tight !text-white">{blog.name}</h1>
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
              <span className="inline-flex items-center gap-2 !text-white/75">
                <i className="fa-solid fa-feather-pointed text-xs !text-[#7fd1c3]"></i> MSS Team
              </span>
              <span className="inline-flex items-center gap-2 !text-white/75">
                <i className="fa-regular fa-calendar text-xs !text-[#7fd1c3]"></i> {formatDate(blog.createdAt)}
              </span>
              <span className="inline-flex items-center gap-2 !text-white/75">
                <i className="fa-regular fa-clock text-xs !text-[#7fd1c3]"></i> {readMinutes(blog.description)} min read
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Article body */}
      <div className="px-4 md:px-6 lg:px-side -mt-20 md:-mt-32 relative">
        <article className="max-w-4xl mx-auto bg-white rounded-2xl md:rounded-3xl border border-gray-200/80 shadow-[0_30px_60px_-30px_rgba(2,51,80,0.35)] overflow-hidden">
          <img src={blogImage(blog.image)} alt={blog.name} className="w-full aspect-[16/8] object-cover" />
          <div className="p-5 md:p-10">
            <div
              className="prose-description text-[15px] md:text-[17px] leading-8 !text-gray-700"
              dangerouslySetInnerHTML={{ __html: blog.description }}
            />

            <div className="mt-8 pt-6 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4">
              <Link to="/blog" className="inline-flex items-center gap-2 text-sm font-semibold !text-[#023350] hover:!text-primaryColor">
                <i className="fa-solid fa-arrow-left text-xs !text-inherit"></i>
                <span className="!text-inherit">All articles</span>
              </Link>
              <button
                type="button"
                onClick={share}
                className="inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-gray-200 hover:border-[#023350] text-sm font-semibold !text-[#023350] transition"
              >
                <i className="fa-solid fa-share-nodes text-xs !text-[#023350]"></i> Share article
              </button>
            </div>
          </div>
        </article>

        {more.length > 0 && (
          <div className="max-w-6xl mx-auto mt-14 md:mt-20">
            <h2 className="text-xl md:text-2xl font-bold !text-[#023350] mb-5 md:mb-6">More from our blog</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {more.map((b) => (
                <BlogCard key={b._id} blog={b} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SingleBlog;
