import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const HomeCMS = () => {
  const [form, setForm] = useState({
    banners: [],

    salesBanners: [],

    weeklyDeal: {
      heading: "",
      description: "",
      image: "",
      endDate: "",
    },

    instagramPosts: [],
  });

  const [loading, setLoading] = useState(true);

  // =========================
  // FETCH
  // =========================

  const fetchData = async (url) => {
    const res = await fetch(url);
    const data = await res.json();

    if (url.includes("/cms/home")) return data;

    if (Array.isArray(data)) return data;
    if (data.data) return data.data;

    return [];
  };

  const load = async () => {
    try {
      const cms = await fetchData(`${BASE_URL}/cms/home`);

      setForm({
        banners: cms?.banners || [],

        salesBanners: cms?.salesBanners || [],

        weeklyDeal:
          cms?.weeklyDeal || {
            heading: "",
            description: "",
            image: "",
            endDate: "",
          },

        instagramPosts: cms?.instagramPosts || [],
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // =========================
  // IMAGE UPLOAD
  // =========================

  const uploadImage = async (file) => {
    const fd = new FormData();
    fd.append("file", file);

    const res = await fetch(
      `${import.meta.env.VITE_IMAGE_BASE_URL}/api/upload`,
      {
        method: "POST",
        body: fd,
      }
    );

    const data = await res.json();

    return data.url;
  };

  const getImage = (img) => {
    if (!img) return "https://dummyimage.com/400x250/000/fff";

    return img.startsWith("http")
      ? img
      : `${import.meta.env.VITE_IMAGE_BASE_URL}${img}`;
  };

  // =========================
  // MAIN BANNERS
  // =========================

  const addBanner = () => {
    setForm({
      ...form,
      banners: [...form.banners, { image: "" }],
    });
  };

  const removeBanner = (index) => {
    setForm({
      ...form,
      banners: form.banners.filter((_, i) => i !== index),
    });
  };

  const updateBanner = async (index, file) => {
    const url = await uploadImage(file);

    const updated = [...form.banners];
    updated[index].image = url;

    setForm({
      ...form,
      banners: updated,
    });
  };

  // =========================
  // SALES BANNERS
  // =========================

  const addSalesBanner = () => {
    if (form.salesBanners.length >= 3) {
      return toast.error("Maximum 3 sales banners allowed");
    }

    setForm({
      ...form,
      salesBanners: [...form.salesBanners, { image: "" }],
    });
  };

  const removeSalesBanner = (index) => {
    setForm({
      ...form,
      salesBanners: form.salesBanners.filter((_, i) => i !== index),
    });
  };

  const updateSalesBanner = async (index, file) => {
    const url = await uploadImage(file);

    const updated = [...form.salesBanners];
    updated[index].image = url;

    setForm({
      ...form,
      salesBanners: updated,
    });
  };

  // =========================
  // INSTAGRAM
  // =========================

  const addInstagramPost = () => {
    setForm({
      ...form,
      instagramPosts: [
        ...form.instagramPosts,
        {
          image: "",
          link: "",
        },
      ],
    });
  };

  const removeInstagramPost = (index) => {
    setForm({
      ...form,
      instagramPosts: form.instagramPosts.filter((_, i) => i !== index),
    });
  };

  const updateInstagramPost = async (index, key, value) => {
    const updated = [...form.instagramPosts];

    if (key === "image") {
      value = await uploadImage(value);
    }

    updated[index][key] = value;

    setForm({
      ...form,
      instagramPosts: updated,
    });
  };

  // =========================
  // SAVE
  // =========================

  const handleSave = async () => {
    const payload = {
      banners: form.banners.filter((b) => b.image),

      salesBanners: form.salesBanners.filter((b) => b.image),

      weeklyDeal: form.weeklyDeal,

      instagramPosts: form.instagramPosts.filter(
        (p) => p.image && p.link
      ),
    };

    try {
      const res = await fetch(`${BASE_URL}/cms/home`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        return toast.error(data.message);
      }

      toast.success("CMS Saved Successfully");
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) {
    return (
      <div className="p-10 text-center text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          Home CMS
        </h1>
        <p className="text-white/60 mt-1">
          Manage homepage content
        </p>
      </div>

      {/* ===========================
          HERO BANNERS
      =========================== */}

      <div className="bg-[var(--surface-container-high)] border border-white/10 rounded-2xl p-6">
        <div className="flex justify-between mb-6">
          <h2 className="text-lg text-white font-semibold">
            Hero Banner Slider
          </h2>

          <button
            onClick={addBanner}
            className="px-4 py-2 bg-[var(--primary)] rounded-lg text-white"
          >
            + Add Banner
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {form.banners.map((banner, index) => (
            <div
              key={index}
              className="relative bg-[#121826] rounded-xl p-4"
            >
              <img
                src={getImage(banner.image)}
                className="w-full h-40 rounded-lg object-cover"
              />

              <label className="block mt-3 cursor-pointer text-center text-sm text-white/60">
                Upload Banner
                <input
                  hidden
                  type="file"
                  onChange={(e) =>
                    updateBanner(index, e.target.files[0])
                  }
                />
              </label>

              <button
                onClick={() => removeBanner(index)}
                className="absolute top-2 right-2 bg-red-500 p-2 rounded-md"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ===========================
          SALES BANNERS
      =========================== */}

      <div className="bg-[var(--surface-container-high)] border border-white/10 rounded-2xl p-6">
        <div className="flex justify-between mb-6">
          <h2 className="text-lg text-white font-semibold">
            Sales Banners (Max 3)
          </h2>

          <button
            onClick={addSalesBanner}
            className="px-4 py-2 bg-[var(--primary)] rounded-lg text-white"
          >
            + Add Sales Banner
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {form.salesBanners.map((banner, index) => (
            <div
              key={index}
              className="relative bg-[#121826] rounded-xl p-4"
            >
              <img
                src={getImage(banner.image)}
                className="w-full h-40 rounded-lg object-cover"
              />

              <input
                type="file"
                className="mt-3 text-white"
                onChange={(e) =>
                  updateSalesBanner(index, e.target.files[0])
                }
              />

              <button
                onClick={() =>
                  removeSalesBanner(index)
                }
                className="absolute top-2 right-2 bg-red-500 p-2 rounded-md"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ===========================
          WEEKLY DEAL
      =========================== */}

      <div className="bg-[var(--surface-container-high)] border border-white/10 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-6">
          Weekly Deal Section
        </h2>

        <div className="grid lg:grid-cols-2 gap-6">

          <div className="space-y-4">
            <input
              type="text"
              placeholder="Deal Heading"
              value={form.weeklyDeal.heading}
              onChange={(e) =>
                setForm({
                  ...form,
                  weeklyDeal: {
                    ...form.weeklyDeal,
                    heading: e.target.value,
                  },
                })
              }
              className="w-full bg-[#121826] border border-white/10 rounded-lg p-3 text-white"
            />

            <textarea
              rows={5}
              placeholder="Deal Description"
              value={form.weeklyDeal.description}
              onChange={(e) =>
                setForm({
                  ...form,
                  weeklyDeal: {
                    ...form.weeklyDeal,
                    description: e.target.value,
                  },
                })
              }
              className="w-full bg-[#121826] border border-white/10 rounded-lg p-3 text-white"
            />

            <input
              type="datetime-local"
              value={form.weeklyDeal.endDate}
              onChange={(e) =>
                setForm({
                  ...form,
                  weeklyDeal: {
                    ...form.weeklyDeal,
                    endDate: e.target.value,
                  },
                })
              }
              className="w-full bg-[#121826] border border-white/10 rounded-lg p-3 text-white"
            />
          </div>

          <div>
            <img
              src={getImage(form.weeklyDeal.image)}
              className="w-full h-72 rounded-xl object-cover"
            />

            <input
              type="file"
              className="mt-4 text-white"
              onChange={async (e) => {
                const url = await uploadImage(
                  e.target.files[0]
                );

                setForm({
                  ...form,
                  weeklyDeal: {
                    ...form.weeklyDeal,
                    image: url,
                  },
                });
              }}
            />
          </div>
        </div>
      </div>

      {/* ===========================
          INSTAGRAM POSTS
      =========================== */}

      <div className="bg-[var(--surface-container-high)] border border-white/10 rounded-2xl p-6">
        <div className="flex justify-between mb-6">
          <h2 className="text-lg text-white font-semibold">
            Instagram Posts
          </h2>

          <button
            onClick={addInstagramPost}
            className="px-4 py-2 bg-[var(--primary)] rounded-lg text-white"
          >
            + Add Post
          </button>
        </div>

        <div className="space-y-5">
          {form.instagramPosts.map((post, index) => (
            <div
              key={index}
              className="bg-[#121826] rounded-xl p-4"
            >
              <img
                src={getImage(post.image)}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />

              <input
                type="text"
                placeholder="Instagram Post URL"
                value={post.link}
                onChange={(e) =>
                  updateInstagramPost(
                    index,
                    "link",
                    e.target.value
                  )
                }
                className="w-full bg-[#0f131c] border border-white/10 rounded-lg p-3 text-white mb-3"
              />

              <input
                type="file"
                className="text-white"
                onChange={(e) =>
                  updateInstagramPost(
                    index,
                    "image",
                    e.target.files[0]
                  )
                }
              />

              <button
                onClick={() =>
                  removeInstagramPost(index)
                }
                className="mt-3 text-red-500"
              >
                Remove Post
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* SAVE */}

      <button
        onClick={handleSave}
        className="w-full py-4 rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--primary-container)] text-white font-semibold"
      >
        Save Home CMS
      </button>
    </div>
  );
};

export default HomeCMS;