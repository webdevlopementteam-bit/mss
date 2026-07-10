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
    } = req.body;

    const cmsData = {
      banners: banners || [],
      salesBanners: salesBanners || [],
      weeklyDeal: weeklyDeal || {},
      instagramPosts: instagramPosts || [],
    };

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