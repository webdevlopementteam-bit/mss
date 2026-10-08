import HomeCMS from "../models/homeCMS.js";

// ===============================
// GET HOME CMS
// ===============================
export const getHomeCMS = async (req, res) => {
  try {
    const data = await HomeCMS.findOne();

    if (!data) {
      return res.json({
        banners: [],
        salesBanners: [],
        weeklyDeal: {
          heading: "",
          description: "",
          image: "",
          endDate: null,
        },
        instagramPosts: [],
        videoBanner: { url: "", poster: "" },
        gallery: [],
      });
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// ===============================
// SAVE HOME CMS
// ===============================
export const saveHomeCMS = async (req, res) => {
  try {
    const {
      banners,
      salesBanners,
      weeklyDeal,
      instagramPosts,
      videoBanner,
      gallery,
    } = req.body;

    const cmsData = {
      banners: banners || [],
      salesBanners: salesBanners || [],
      weeklyDeal: weeklyDeal || {},
      instagramPosts: instagramPosts || [],
    };

    // Optional sections — only touched when the admin sends them, so older
    // admin builds that don't know about them can't wipe them out.
    if (videoBanner !== undefined) cmsData.videoBanner = videoBanner || { url: "", poster: "" };
    if (gallery !== undefined) cmsData.gallery = Array.isArray(gallery) ? gallery : [];

    let cms = await HomeCMS.findOne();

    if (cms) {
      cms = await HomeCMS.findOneAndUpdate(
        {},
        cmsData,
        {
          new: true,
          runValidators: true,
        }
      );
    } else {
      cms = await HomeCMS.create(cmsData);
    }

    res.json(cms);
  } catch (err) {
    console.log("CMS ERROR:", err);

    res.status(400).json({
      message: err.message,
    });
  }
};