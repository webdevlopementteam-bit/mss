import { useEffect, useMemo, useState } from "react";
import { getBlogs } from "../api/services";
import { PageHeader } from "../components/ui/PageHeader";
import { BlogCard, BlogCardSkeleton } from "../components/ui/BlogCard";
import { stripHtml } from "../components/ui/blogUtils";

const Blog = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    getBlogs()
      .then((res) => setBlogs((res.data.data || []).filter((b) => b.isPublished)))
      .catch((err) => console.log(err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return blogs;
    return blogs.filter((b) => `${b.name} ${stripHtml(b.description)}`.toLowerCase().includes(q));
  }, [blogs, query]);

  const searching = query.trim() !== "";
  const [lead, ...rest] = filtered;

  return (
    <div className="bg-[#F6F7F9] pb-14 md:pb-20">
      <PageHeader title="Our Blog" crumb="Blog" icon="fa-newspaper" subtitle="Product guides, healthcare tips and updates from Medical & Surgical Solutions.">
        <div className="relative w-full sm:w-72">
          <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-sm !text-white/50"></i>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search articles…"
            className="w-full h-11 pl-10 pr-4 rounded-xl bg-white/10 border border-white/20 text-sm !text-white placeholder:text-white/50 outline-none focus:bg-white/15 focus:border-white/40 transition"
          />
        </div>
      </PageHeader>

      <div className="px-4 md:px-6 lg:px-side pt-8 md:pt-10">
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <BlogCardSkeleton key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-200/80">
            <i className="fa-regular fa-newspaper text-3xl !text-gray-300"></i>
            <p className="mt-3 font-semibold !text-gray-700">{searching ? "No articles match your search." : "No articles published yet."}</p>
          </div>
        ) : (
          <>
            {/* Lead story (hidden while searching so results read as one list) */}
            {!searching && (
              <div className="mb-6 md:mb-8">
                <BlogCard blog={lead} featured />
              </div>
            )}

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {(searching ? filtered : rest).map((b) => (
                <BlogCard key={b._id} blog={b} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Blog;
