import mongoose from "mongoose";

const homeCmsSchema = new mongoose.Schema(
  {
    banners: [
      {
        image: {
          type: String,
          default: "",
        },
      },
    ],

    salesBanners: [
      {
        image: {
          type: String,
          default: "",
        },
      },
    ],

    weeklyDeal: {
      heading: {
        type: String,
        default: "",
      },

      description: {
        type: String,
        default: "",
      },

      image: {
        type: String,
        default: "",
      },

      endDate: {
        type: Date,
        default: null,
      },
    },

    instagramPosts: [
      {
        image: {
          type: String,
          default: "",
        },

        link: {
          type: String,
          default: "",
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("HomeCMS", homeCmsSchema);