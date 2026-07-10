import { useState } from "react";
import {
  blogsdata,
  categories,
  instapost,
  popularProducts,
  products,
  testimonials,
} from "../data";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import NextArrow from "../components/NextArrow";
import PrevArrow from "../components/PrevArrow";
import doctor from "../assets/home/doctor.png";
import banner from "../assets/home/banner.jpg";
import banner1 from "../assets/home/banner1.jpg";
import banner2 from "../assets/home/banner2.png";
import banner3 from "../assets/home/banner3.jpg";
import productbanner from "../assets/home/productbanner.png";
import testimonialbanner from "../assets/home/testimonialbanner.png";
import quotes from "../assets/home/quote.png";
import subscriptionbanner from "../assets/home/subscriptionbanner.avif";
/* import sliderbanner1 from "../assets/home/sliderbanner1.png";
import sliderbanner2 from "../assets/home/sliderbanner2.png"; */
import { Category } from "../sections/Category";
import { Hero } from "../sections/Hero";
import { Productbanner } from "../sections/Productbanner";
import { TrendingItems } from "../sections/TrendingItems";
import { Policies } from "../sections/Policies";
import { Popularitem } from "../sections/Popularitem";
import { Singlebanner } from "../sections/Singlebanner";
import { Popularbrands } from "../sections/Popularbrands";
import { FeaturedItem } from "../sections/FeaturedItem";
import { Catalogtype } from "../sections/Catalogtype";
import { SaleCarousel } from "../sections/SaleCarousel";
import { Gallery } from "../sections/Gallery";
import { Testimonial } from "../sections/Testimonial";
import { Blogsection } from "../sections/Blogsection";
import { Emailsubscription } from "../sections/Emailsubscription";
import { Instagrammedion } from "../sections/Instagrammedion";
import ProductGrid from "../demo/ProductGrid";
import CategoryPage from "../demo/CategoryPage";
import BrandPage from "../demo/BrandPage";
import { VideoBanner } from "../sections/VideoBanner";


const Home = () => {
  const [selectedCategory, setSelectedCategory] = useState(categories[0].name);
  const filteredProducts = popularProducts
    .filter((product) => product.category === selectedCategory)
    .slice(0, 4);

  var categorySetting = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 6,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: true,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
  };
  var testimonialsettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: false,
  };
  var settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 5,
    slidesToScroll: 1,
    arrows: true,
    autoplay: true,
    autoplaySpeed: 3000,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
  };
  var carouselsettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    slidesToScroll: 1,
    arrows: false,
  };

  return (
    <>
      {/* slider */}
      <Hero/>

      {/* <div className="bg-primaryColor/30 h-[430px] overflow-hidden relative rounded-3xl mt-7 mx-side before:content-[' '] before:absolute before:w-[360px] before:h-[340px] before:bg-primaryColor before:rotate-12 before:-top-[20px] before:right-20 before:rounded-r-[50%] before:rounded-b-[50%]"></div> */}

   {/*    <div className="rounded-3xl mt-7 mx-side">
        <Slider {...carouselsettings}>
          <img src={sliderbanner1} alt="sliderbanner1" className="rounded-3xl h-[600px] object-fill"/>
          <img src={sliderbanner2} alt="sliderbanner2" className="rounded-3xl h-[600px] object-fill"/>
        </Slider>
      </div> */}
          {/* top categories */}
<Category/>
  
     {/*  <div className="flex justify-between items-center mx-side mt-16">
        <div>
          <h2 className="text-2xl font-semibold relative before:content-[' '] before:absolute before:h-[3px] before:w-8 before:bg-primaryColor before:top-[42px] after:content-[' '] after:absolute after:w-[80%] after:h-8 after:left-0 after:-bottom-3 after:bg-primaryColor/10 after:rounded-l-none after:rounded-b-2xl">
            Top Category
          </h2>
        </div>
        <div>
          <p className="text-primaryColor font-semibold">
            View More <i class="fa-solid fa-angles-right text-primaryColor"></i>
          </p>
        </div>
      </div>

      <div className="mx-side mt-10">
        <Slider {...categorySetting}>
          {categories.map((category) => (
            <div key={category.id} className="px-3">
              <div className="border-[2px] border-primaryColor/20 py-[20px] rounded-[70px] transition-all duration-700 group hover:border-primaryColor flex flex-col justify-center items-center text-center">
                <div className="border-[2px] border-dashed rounded-full border-primaryColor p-2">
                  <div className="p-5 bg-primaryColor rounded-full flex justify-center items-center text-center">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="group-hover:scale-110 transition-all duration-500 w-14 invert"
                    />
                  </div>
                </div>
                <p className="mt-4 font-semibold text-[17px] text-[#023350]">
                  {category.name}
                </p>
              </div>
            </div>
          ))}
        </Slider>
      </div> */}

      {/* display products banner */}
    {/*   <div className="grid grid-cols-3 gap-5 mx-side mt-16">
        <div
          style={{
            backgroundImage: `url(${banner2})`,
            backgroundPosition: "center center",
            backgroundSize: "cover",
          }}
          className="px-6 py-16 rounded-2xl flex flex-col items-start justify-center"
        >
          <p className="text-white bg-secondaryColor px-3 py-1 rounded-2xl uppercase text-xs">
            Beauty Product
          </p>
          <p className="mt-3 text-xl font-semibold">
            VLCC Anti <br />
            Blemish <br />
            Facial Kit
          </p>
          <a
            href="#"
            className="mt-2 text-sm pb-1 border-b-2 border-black hover:text-secondaryColor hover:border-secondaryColor transition-all duration-300"
          >
            DISCOVER MORE
          </a>
        </div>
        <div
          style={{
            backgroundImage: `url(${banner2})`,
            backgroundPosition: "center center",
            backgroundSize: "cover",
          }}
          className="px-6 py-16 rounded-2xl flex flex-col items-start justify-center"
        >
          <p className="text-white bg-secondaryColor px-3 py-1 rounded-2xl uppercase text-xs">
            Beauty Product
          </p>
          <p className="mt-2 text-xl font-semibold">
            VLCC Anti <br />
            Blemish <br />
            Facial Kit
          </p>
          <a
            href="#"
            className="mt-4 text-sm pb-1 border-b-2 border-black hover:text-secondaryColor hover:border-secondaryColor transition-all duration-300"
          >
            DISCOVER MORE
          </a>
        </div>
        <div
          style={{
            backgroundImage: `url(${banner2})`,
            backgroundPosition: "center center",
            backgroundSize: "cover",
          }}
          className="px-6 py-16 rounded-2xl flex flex-col items-start justify-center"
        >
          <p className="text-white bg-secondaryColor px-3 py-1 rounded-2xl uppercase text-xs">
            Beauty Product
          </p>
          <p className="mt-2 text-xl font-semibold">
            VLCC Anti <br />
            Blemish <br />
            Facial Kit
          </p>
          <a
            href="#"
            className="mt-4 text-sm pb-1 border-b-2 border-black hover:text-secondaryColor hover:border-secondaryColor transition-all duration-300"
          >
            DISCOVER MORE
          </a>
        </div>
      </div> */}

      <Productbanner/>
      <TrendingItems/>
      {/* trending items */}
  {/*     <div className="flex justify-between items-center mx-side mt-16">
        <div>
          <h2 className="text-2xl font-semibold relative before:content-[' '] before:absolute before:h-[3px] before:w-8 before:bg-primaryColor before:top-[42px] after:content-[' '] after:absolute after:w-[80%] after:h-8 after:left-0 after:-bottom-3 after:bg-primaryColor/10 after:rounded-l-none after:rounded-b-2xl">
            Trending Items
          </h2>
        </div>
        <div>
          <p className="text-primaryColor font-semibold">
            View More <i class="fa-solid fa-angles-right text-primaryColor"></i>
          </p>
        </div>
      </div>

      <div className="mx-side mt-10">
        <Slider {...settings}>
          {products.map((product) => (
            <div key={product.id} className="px-3">
              <div className="bg-primaryColor/10 rounded-3xl p-5 h-full relative group">
                <p
                  className={`absolute text-white right-7 top-4  px-2 rounded-xl uppercase text-xs ${product.badge == "sale" ? "py-1 bg-primaryColor" : product.badge ? "bg-secondaryColor py-1" : "py-0"}`}
                >
                  {product.badge}
                </p>
                <img src={product.image} alt={product.name} />
                <div className="flex gap-2 justify-center items-center absolute transition-all duration-500 opacity-0 group-hover:opacity-100 -translate-y-7 group-hover:-translate-y-10 left-1/3">
                  <div className="bg-primaryColor rounded-full w-10 h-10 flex items-center justify-center relative group/eye">
                    <i class="fa-regular fa-eye text-white"></i>
                    <p className="absolute -top-7 whitespace-nowrap rounded-md bg-primaryColor text-white text-xs px-3 py-1 opacity-0 scale-95 group-hover/eye:opacity-100 group-hover/eye:scale-100 transition-all duration-300 pointer-events-none ">
                      Quick View
                    </p>
                  </div>
                  <div className="bg-primaryColor rounded-full w-10 h-10 flex items-center justify-center relative group/wishlist">
                    <i class="fa-regular fa-heart text-white"></i>
                    <p className="absolute -top-7 whitespace-nowrap rounded-md bg-primaryColor text-white text-xs px-3 py-1 opacity-0 scale-95 group-hover/wishlist:opacity-100 group-hover/wishlist:scale-100 transition-all duration-300 pointer-events-none ">
                      Wishlist
                    </p>
                  </div>
                </div>
                <p className="font-semibold text-[17px] mb-2">{product.name}</p>
                <i className="fa-solid fa-star text-[#FBA707]"></i>
                <i className="fa-solid fa-star text-[#FBA707]"></i>
                <i className="fa-solid fa-star text-[#FBA707]"></i>
                <i className="fa-solid fa-star text-[#FBA707]"></i>
                <i className="fa-regular fa-star text-[#FBA707]"></i>
                <div className="flex items-end justify-between">
                  <p className="text-primaryColor font-semibold">
                    ₹{product.price}
                  </p>

                  <div className="bg-primaryColor rounded-full w-10 h-10 flex items-center justify-center relative group/bag">
                    <i class="fa-solid fa-bag-shopping text-lg text-white "></i>
                    <p className="absolute -left-[90px] whitespace-nowrap rounded-[20px_90%_90%_20px] bg-primaryColor text-white text-xs px-3 py-1 opacity-0 scale-95 group-hover/bag:opacity-100 group-hover/bag:scale-100 transition-all duration-300 pointer-events-none ">
                      Add To Cart
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </div>
 */}
 <Policies/>
      {/* policies */}
     {/*  <div className="mx-side mt-16">
        <div className="bg-secondaryColor py-8 px-12 rounded-xl">
          <div className="grid grid-cols-4 gap-7">
            <div className="flex items-center justify-center gap-4 border-r-[1px] border-white/30">
              <div className="bg-primaryColor relative z-10 w-14 h-14 rounded-[30%_70%_70%_30%/30%_30%_70%_70%] flex justify-center items-center before:content-[' '] before:w-14 before:h-14 before:border-2 before:absolute before:-z-0 before:border-primaryColor before:rounded-[30%_70%_70%_30%/30%_30%_70%_70%] before:-top-[5px] before:-left-[5px]">
                <i className="fa-regular fa-truck text-white text-2xl "></i>
              </div>
              <div>
                <h4 className="text-white text-[22px] font-semibold">
                  Free Delivery
                </h4>
                <p className="text-white mt-1">Orders Over $120</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-4 border-r-[1px] border-white/30">
              <div className="bg-primaryColor relative z-10 w-14 h-14 rounded-[30%_70%_70%_30%/30%_30%_70%_70%] flex justify-center items-center before:content-[' '] before:w-14 before:h-14 before:border-2 before:absolute before:-z-0 before:border-primaryColor before:rounded-[30%_70%_70%_30%/30%_30%_70%_70%] before:-top-[5px] before:-left-[5px]">
                <i class="fa-solid fa-rotate text-white text-2xl"></i>
              </div>
              <div>
                <h4 className="text-white text-[22px] font-semibold">
                  Get Refund
                </h4>
                <p className="text-white mt-1">Within 30 Days Returns</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-4 border-r-[1px] border-white/30">
              <div className="bg-primaryColor relative z-10 w-14 h-14 rounded-[30%_70%_70%_30%/30%_30%_70%_70%] flex justify-center items-center before:content-[' '] before:w-14 before:h-14 before:border-2 before:absolute before:-z-0 before:border-primaryColor before:rounded-[30%_70%_70%_30%/30%_30%_70%_70%] before:-top-[5px] before:-left-[5px]">
                <i class="fa-solid fa-wallet text-white text-2xl"></i>
              </div>
              <div>
                <h4 className="text-white text-[22px] font-semibold">
                  Safe Payment
                </h4>
                <p className="text-white mt-1">100% Secure Payment</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-4">
              <div className="bg-primaryColor relative z-10 w-14 h-14 rounded-[30%_70%_70%_30%/30%_30%_70%_70%] flex justify-center items-center before:content-[' '] before:w-14 before:h-14 before:border-2 before:absolute before:-z-0 before:border-primaryColor before:rounded-[30%_70%_70%_30%/30%_30%_70%_70%] before:-top-[5px] before:-left-[5px]">
                <i class="fa-solid fa-headset text-white text-2xl"></i>
              </div>
              <div>
                <h4 className="text-white text-[22px] font-semibold">
                  24/7 Support
                </h4>
                <p className="text-white mt-1">Feel Free To Call Us</p>
              </div>
            </div>
          </div>
        </div>
      </div>
 */}
 <Popularitem/>
      {/* popular items */}
     {/*  <div className="grid grid-cols-4 gap-10 mx-side mt-20">
        <div className="col-span-3">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-semibold relative before:content-[' '] before:absolute before:h-[3px] before:w-8 before:bg-primaryColor before:top-[42px] after:content-[' '] after:absolute after:w-[80%] after:h-8 after:left-0 after:-bottom-3 after:bg-primaryColor/10 after:rounded-l-none after:rounded-b-2xl">
                Popular Items
              </h2>
            </div>
            <div>
              <p className="text-primaryColor font-semibold">
                All Products{" "}
                <i class="fa-solid fa-angles-right text-primaryColor"></i>
              </p>
            </div>
          </div>
          <div className="flex gap-3 justify-center items-center mt-8">
            {categories.map((category) => (
              <p
                className={` font-semibold text-sm py-2 px-6 rounded-3xl text-white  transition-all duration-500 cursor-pointer ${selectedCategory == category.name ? "bg-primaryColor text-white" : "bg-primaryColor/70 hover:bg-primaryColor hover:text-white"}`}
                key={category.id}
                onClick={() => setSelectedCategory(category.name)}
              >
                {category.name}
              </p>
            ))}
          </div>
          <div className="flex justify-center items-center mt-10">
            {filteredProducts.map((product) => (
              <div key={product.id} className="px-3">
                <div className="bg-primaryColor/10 rounded-3xl p-5 h-full relative group">
                  <p
                    className={`absolute text-white right-7 top-4  px-2 rounded-xl uppercase text-xs ${product.badge == "sale" ? "py-1 bg-primaryColor" : product.badge == "hot" ? "bg-secondaryColor py-1" : product.badge == "10% off" ? "bg-yellow-500 py-1" : product.badge ? "py-1 bg-sky-400" : " "}`}
                  >
                    {product.badge}
                  </p>
                  <img src={product.image} alt={product.name} />
                  <div className="flex gap-2 justify-center items-center absolute transition-all duration-500 opacity-0 group-hover:opacity-100 -translate-y-7 group-hover:-translate-y-10 left-1/3">
                    <div className="bg-primaryColor rounded-full w-10 h-10 flex items-center justify-center relative group/eye">
                      <i class="fa-regular fa-eye text-white"></i>
                      <p className="absolute -top-7 whitespace-nowrap rounded-md bg-primaryColor text-white text-xs px-3 py-1 opacity-0 scale-95 group-hover/eye:opacity-100 group-hover/eye:scale-100 transition-all duration-300 pointer-events-none ">
                        Quick View
                      </p>
                    </div>
                    <div className="bg-primaryColor rounded-full w-10 h-10 flex items-center justify-center relative group/wishlist">
                      <i class="fa-regular fa-heart text-white"></i>
                      <p className="absolute -top-7 whitespace-nowrap rounded-md bg-primaryColor text-white text-xs px-3 py-1 opacity-0 scale-95 group-hover/wishlist:opacity-100 group-hover/wishlist:scale-100 transition-all duration-300 pointer-events-none ">
                        Wishlist
                      </p>
                    </div>
                  </div>
                  <p className="font-semibold text-[17px] mb-2">
                    {product.name}
                  </p>
                  <i className="fa-solid fa-star text-[#FBA707]"></i>
                  <i className="fa-solid fa-star text-[#FBA707]"></i>
                  <i className="fa-solid fa-star text-[#FBA707]"></i>
                  <i className="fa-solid fa-star text-[#FBA707]"></i>
                  <i className="fa-regular fa-star text-[#FBA707]"></i>
                  <div className="flex items-end justify-between">
                    <p className="text-primaryColor font-semibold">
                      ₹{product.price}
                    </p>

                    <div className="bg-primaryColor rounded-full w-10 h-10 flex items-center justify-center relative group/bag">
                      <i class="fa-solid fa-bag-shopping text-lg text-white "></i>
                      <p className="absolute -left-[90px] whitespace-nowrap rounded-[20px_90%_90%_20px] bg-primaryColor text-white text-xs px-3 py-1 opacity-0 scale-95 group-hover/bag:opacity-100 group-hover/bag:scale-100 transition-all duration-300 pointer-events-none ">
                        Add To Cart
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-primaryColor/20 flex justify-center items-end rounded-3xl">
          <img src={doctor} alt="doctor" className="w-72" />
        </div>
      </div> */}

      {/* banner */}
      <Singlebanner/>
     {/*  <div
        style={{
          backgroundImage: `url(${banner})`,
          backgroundPosition: "center center",
          backgroundSize: "cover",
        }}
        className="py-16 mx-side mt-16 rounded-3xl flex flex-col justify-end items-center"
      >
        <p className="text-xl font-semibold text-white">Mega Collections</p>
        <h4 className="text-4xl mt-2 font-semibold text-white">
          Huge Sale Up To 40% Off
        </h4>
        <span className="text-xl mt-5 py-1 border-y-[2px] text-white">
          at our outlet stores
        </span>
        <button className="relative overflow-hidden px-6 py-2 mt-5 font-semibold text-white bg-secondaryColor/70 rounded-full group">
          <span className="relative z-10 text-white transition-colors duration-300">
            Shop Now <i className="fa-solid fa-arrow-right text-white"></i>
          </span>

          <span className="absolute inset-0 rounded-full scale-0 opacity-0 bg-primaryColor group-hover:scale-100 group-hover:opacity-100  transition-all duration-500 ease-in-out"></span>
        </button>
      </div> */}

      {/* popular brands */}
      <Popularbrands/>
    {/*   <div className="flex justify-between items-center mx-side mt-16">
        <div>
          <h2 className="text-2xl font-semibold relative before:content-[' '] before:absolute before:h-[3px] before:w-8 before:bg-primaryColor before:top-[42px] after:content-[' '] after:absolute after:w-[80%] after:h-8 after:left-0 after:-bottom-3 after:bg-primaryColor/10 after:rounded-l-none after:rounded-b-2xl">
            Popular Brands
          </h2>
        </div>
        <div>
          <p className="text-primaryColor font-semibold">
            All Brands{" "}
            <i class="fa-solid fa-angles-right text-primaryColor"></i>
          </p>
        </div>
      </div>
      <div className="mx-side mt-10">
        <Slider {...categorySetting}>
          {categories.map((category) => (
            <div key={category.id} className="px-3">
              <div className="border-[2px] border-primaryColor/20 py-[20px] rounded-3xl transition-all duration-700 group hover:border-primaryColor flex flex-col justify-center items-center text-center">
                <div className="p-5 flex justify-center items-center text-center">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="group-hover:scale-110 transition-all duration-500 w-14 invert"
                  />
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </div> */}

      {/* featured items */}
      <FeaturedItem/>
   {/*    <div className="flex justify-between items-center mx-side mt-16">
        <div>
          <h2 className="text-2xl font-semibold relative before:content-[' '] before:absolute before:h-[3px] before:w-8 before:bg-primaryColor before:top-[42px] after:content-[' '] after:absolute after:w-[80%] after:h-8 after:left-0 after:-bottom-3 after:bg-primaryColor/10 after:rounded-l-none after:rounded-b-2xl">
            Featured Items
          </h2>
        </div>
        <div>
          <p className="text-primaryColor font-semibold">
            View More <i class="fa-solid fa-angles-right text-primaryColor"></i>
          </p>
        </div>
      </div>

      <div className="mx-side mt-10">
        <Slider {...settings}>
          {products.map((product) => (
            <div key={product.id} className="px-3">
              <div className="bg-primaryColor/10 rounded-3xl p-5 h-full relative group">
                <p
                  className={`absolute text-white right-7 top-4  px-2 rounded-xl uppercase text-xs ${product.badge == "sale" ? "py-1 bg-primaryColor" : product.badge ? "bg-secondaryColor py-1" : "py-0"}`}
                >
                  {product.badge}
                </p>
                <img src={product.image} alt={product.name} />
                <div className="flex gap-2 justify-center items-center absolute transition-all duration-500 opacity-0 group-hover:opacity-100 -translate-y-7 group-hover:-translate-y-10 left-1/3">
                  <div className="bg-primaryColor rounded-full w-10 h-10 flex items-center justify-center relative group/eye">
                    <i class="fa-regular fa-eye text-white"></i>
                    <p className="absolute -top-7 whitespace-nowrap rounded-md bg-primaryColor text-white text-xs px-3 py-1 opacity-0 scale-95 group-hover/eye:opacity-100 group-hover/eye:scale-100 transition-all duration-300 pointer-events-none ">
                      Quick View
                    </p>
                  </div>
                  <div className="bg-primaryColor rounded-full w-10 h-10 flex items-center justify-center relative group/wishlist">
                    <i class="fa-regular fa-heart text-white"></i>
                    <p className="absolute -top-7 whitespace-nowrap rounded-md bg-primaryColor text-white text-xs px-3 py-1 opacity-0 scale-95 group-hover/wishlist:opacity-100 group-hover/wishlist:scale-100 transition-all duration-300 pointer-events-none ">
                      Wishlist
                    </p>
                  </div>
                </div>
                <p className="font-semibold text-[17px] mb-2">{product.name}</p>
                <i className="fa-solid fa-star text-[#FBA707]"></i>
                <i className="fa-solid fa-star text-[#FBA707]"></i>
                <i className="fa-solid fa-star text-[#FBA707]"></i>
                <i className="fa-solid fa-star text-[#FBA707]"></i>
                <i className="fa-regular fa-star text-[#FBA707]"></i>
                <div className="flex items-end justify-between">
                  <p className="text-primaryColor font-semibold">
                    ₹{product.price}
                  </p>

                  <div className="bg-primaryColor rounded-full w-10 h-10 flex items-center justify-center relative group/bag">
                    <i class="fa-solid fa-bag-shopping text-lg text-white "></i>
                    <p className="absolute -left-[90px] whitespace-nowrap rounded-[20px_90%_90%_20px] bg-primaryColor text-white text-xs px-3 py-1 opacity-0 scale-95 group-hover/bag:opacity-100 group-hover/bag:scale-100 transition-all duration-300 pointer-events-none ">
                      Add To Cart
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </div> */}

      {/* <ProductGrid/> */}
      {/* <CategoryPage/>
       <BrandPage/> */}
      {/* video banner */}
  {/*     <div
        className="mt-16 py-44 flex justify-center items-center  "
        style={{
          backgroundImage: `url(${banner1})`,
          backgroundPosition: "center center",
          backgroundSize: "cover",
        }}
      >
        <a
          href="#"
          className="bg-primaryColor rounded-full w-16 h-16 flex justify-center items-center animate-ringing"
        >
          <i className="fa-solid fa-play text-white text-xl"></i>
        </a>
      </div> */}

      <VideoBanner/>

      {/* catalogue type */}
      <Catalogtype/>
    {/*   <div className="mx-side mt-16 grid grid-cols-3 gap-6">
        <div className="border-[1px] rounded-2xl px-5 pt-5 border-black/20">
          <h3 className="text-2xl font-semibold pb-2 relative border-b-[1px] border-black/15 before:content-[' '] before:absolute before:h-[1px] before:bottom-0 before:w-10 before:bg-primaryColor">
            On sale
          </h3>
          <div className="mt-7">
            {popularProducts
              .filter((item) => item.category === "Sutures")
              .slice(0, 3)
              .map((item) => (
                <div
                  key={item.id}
                  className="bg-primaryColor/20 p-3 rounded-xl mb-5 flex justify-start items-center relative gap-3"
                >
                  <div>
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-28 bg-white p-2 rounded-xl border-[1px]"
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">{item.name}</h4>
                    <i className="fa-solid fa-star text-[#FBA707]"></i>
                    <i className="fa-solid fa-star text-[#FBA707]"></i>
                    <i className="fa-solid fa-star text-[#FBA707]"></i>
                    <i className="fa-solid fa-star text-[#FBA707]"></i>
                    <i className="fa-regular fa-star text-[#FBA707]"></i>
                    <p className="text-primaryColor font-semibold mt-1">
                      ₹{item.price}
                    </p>
                  </div>
                  <div className="bg-primaryColor rounded-full w-12 h-12 flex items-center justify-center absolute -bottom-1 -right-1 border-[5px] border-white group/bag">
                    <i class="fa-solid fa-bag-shopping text-lg text-white"></i>
                    <p className="absolute -left-[94px] whitespace-nowrap rounded-[20px_90%_90%_20px] bg-primaryColor text-white text-xs px-3 py-1 opacity-0 scale-95 group-hover/bag:opacity-100 group-hover/bag:scale-100 transition-all duration-300 pointer-events-none ">
                      Add To Cart
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div className="border-[1px] rounded-2xl px-5 pt-5 border-black/20">
          <h3 className="text-2xl font-semibold pb-2 relative border-b-[1px] border-black/15 before:content-[' '] before:absolute before:h-[1px] before:bottom-0 before:w-10 before:bg-primaryColor">
            Best Seller
          </h3>
          <div className="mt-7">
            {popularProducts
              .filter((item) => item.category === "Chemicals")
              .slice(0, 3)
              .map((item) => (
                <div
                  key={item.id}
                  className="bg-primaryColor/20 p-3 rounded-xl mb-5 flex justify-start items-center relative gap-3"
                >
                  <div>
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-28 bg-white p-2 rounded-xl border-[1px]"
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">{item.name}</h4>
                    <i className="fa-solid fa-star text-[#FBA707]"></i>
                    <i className="fa-solid fa-star text-[#FBA707]"></i>
                    <i className="fa-solid fa-star text-[#FBA707]"></i>
                    <i className="fa-solid fa-star text-[#FBA707]"></i>
                    <i className="fa-regular fa-star text-[#FBA707]"></i>
                    <p className="text-primaryColor font-semibold mt-1">
                      ₹{item.price}
                    </p>
                  </div>
                  <div className="bg-primaryColor rounded-full w-12 h-12 flex items-center justify-center absolute -bottom-1 -right-1 border-[5px] border-white group/bag">
                    <i class="fa-solid fa-bag-shopping text-lg text-white"></i>
                    <p className="absolute -left-[94px] whitespace-nowrap rounded-[20px_90%_90%_20px] bg-primaryColor text-white text-xs px-3 py-1 opacity-0 scale-95 group-hover/bag:opacity-100 group-hover/bag:scale-100 transition-all duration-300 pointer-events-none ">
                      Add To Cart
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div className="border-[1px] rounded-2xl px-5 pt-5 border-black/20">
          <h3 className="text-2xl font-semibold pb-2 relative border-b-[1px] border-black/15 before:content-[' '] before:absolute before:h-[1px] before:bottom-0 before:w-10 before:bg-primaryColor">
            Top Rated
          </h3>
          <div className="mt-7">
            {popularProducts
              .filter((item) => item.category === "Personal Care")
              .slice(0, 3)
              .map((item) => (
                <div
                  key={item.id}
                  className="bg-primaryColor/20 p-3 rounded-xl mb-5 flex justify-start items-center relative gap-3"
                >
                  <div>
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-28 bg-white p-2 rounded-xl border-[1px]"
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">{item.name}</h4>
                    <i className="fa-solid fa-star text-[#FBA707]"></i>
                    <i className="fa-solid fa-star text-[#FBA707]"></i>
                    <i className="fa-solid fa-star text-[#FBA707]"></i>
                    <i className="fa-solid fa-star text-[#FBA707]"></i>
                    <i className="fa-regular fa-star text-[#FBA707]"></i>
                    <p className="text-primaryColor font-semibold mt-1">
                      ₹{item.price}
                    </p>
                  </div>
                  <div className="bg-primaryColor rounded-full w-12 h-12 flex items-center justify-center absolute -bottom-1 -right-1 border-[5px] border-white group/bag">
                    <i class="fa-solid fa-bag-shopping text-lg text-white"></i>
                    <p className="absolute -left-[94px] whitespace-nowrap rounded-[20px_90%_90%_20px] bg-primaryColor text-white text-xs px-3 py-1 opacity-0 scale-95 group-hover/bag:opacity-100 group-hover/bag:scale-100 transition-all duration-300 pointer-events-none ">
                      Add To Cart
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
 */}
      {/* sale carousel */}
      <SaleCarousel/>
      {/* <div className="bg-primaryColor/20 px-side py-20 mt-16 relative overflow-hidden before:content-[' '] before:absolute before:w-96 before:h-96 before:bg-primaryColor/10 before:rounded-full before:-top-40 after:content-['DEAL'] after:absolute after:-right-32 after:text-[170px] after:font-bold after:top-1/4 after:text-primaryColor/20 after:-rotate-90 ">
        <Slider {...carouselsettings}>
          <div>
            <div className="flex justify-between items-center gap-10 pr-24">
              <div>
                <h4 className="uppercase text-2xl font-semibold tracking-widest text-secondaryColor">
                  Weekly Deal
                </h4>
                <h3 className="mt-3 text-4xl font-semibold">
                  Best Deal For This Week
                </h3>
                <p className="mt-3 text-black/80 tracking-wide">
                  There are many variations of passages available but the
                  majority have <br /> suffered alteration in some form by
                  injected humour, or randomised <br /> words which don't look
                  even slightly believable.
                </p>
                <div className="grid grid-cols-4 gap-3 mt-5">
                  <div className="bg-white rounded-2xl p-2 flex flex-col items-center justify-center">
                    <h2 className="text-secondaryColor text-5xl font-semibold">
                      1
                    </h2>
                    <p className="uppercase font-semibold">Day</p>
                  </div>
                  <div className="bg-white rounded-2xl p-2 flex flex-col items-center justify-center">
                    <h2 className="text-secondaryColor text-5xl font-semibold">
                      7
                    </h2>
                    <p className="uppercase font-semibold">Hours</p>
                  </div>
                  <div className="bg-white rounded-2xl p-2 flex flex-col items-center justify-center">
                    <h2 className="text-secondaryColor text-5xl font-semibold">
                      59
                    </h2>
                    <p className="uppercase font-semibold">Minutes</p>
                  </div>
                  <div className="bg-white rounded-2xl p-2 flex flex-col items-center justify-center">
                    <h2 className="text-secondaryColor text-5xl font-semibold">
                      45
                    </h2>
                    <p className="uppercase font-semibold">Seconds</p>
                  </div>
                </div>
                <button className="relative overflow-hidden px-6 py-3 mt-7 font-semibold text-white bg-secondaryColor/70 rounded-xl group">
                  <span className="relative z-10 text-white transition-colors duration-300">
                    Shop Now{" "}
                    <i className="fa-solid fa-arrow-right text-white"></i>
                  </span>

                  <span className="absolute inset-0 rounded-xl scale-0 opacity-0 bg-primaryColor group-hover:scale-100 group-hover:opacity-100  transition-all duration-500 ease-in-out"></span>
                </button>
              </div>
              <div>
                <img
                  src={productbanner}
                  alt="productbanner"
                  className="w-[600px] h-[350px]"
                />
              </div>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center gap-10 pr-24">
              <div>
                <h4 className="uppercase text-2xl font-semibold tracking-widest text-secondaryColor">
                  Weekly Deal
                </h4>
                <h3 className="mt-3 text-4xl font-semibold">
                  Best Deal For This Week
                </h3>
                <p className="mt-3 text-black/80 tracking-wide">
                  There are many variations of passages available but the
                  majority have <br /> suffered alteration in some form by
                  injected humour, or randomised <br /> words which don't look
                  even slightly believable.
                </p>
                <div className="grid grid-cols-4 gap-3 mt-5">
                  <div className="bg-white rounded-2xl p-2 flex flex-col items-center justify-center">
                    <h2 className="text-secondaryColor text-5xl font-semibold">
                      1
                    </h2>
                    <p className="uppercase font-semibold">Day</p>
                  </div>
                  <div className="bg-white rounded-2xl p-2 flex flex-col items-center justify-center">
                    <h2 className="text-secondaryColor text-5xl font-semibold">
                      7
                    </h2>
                    <p className="uppercase font-semibold">Hours</p>
                  </div>
                  <div className="bg-white rounded-2xl p-2 flex flex-col items-center justify-center">
                    <h2 className="text-secondaryColor text-5xl font-semibold">
                      59
                    </h2>
                    <p className="uppercase font-semibold">Minutes</p>
                  </div>
                  <div className="bg-white rounded-2xl p-2 flex flex-col items-center justify-center">
                    <h2 className="text-secondaryColor text-5xl font-semibold">
                      45
                    </h2>
                    <p className="uppercase font-semibold">Seconds</p>
                  </div>
                </div>
                <button className="relative overflow-hidden px-6 py-3 mt-7 font-semibold text-white bg-secondaryColor/70 rounded-xl group">
                  <span className="relative z-10 text-white transition-colors duration-300">
                    Shop Now{" "}
                    <i className="fa-solid fa-arrow-right text-white"></i>
                  </span>

                  <span className="absolute inset-0 rounded-xl scale-0 opacity-0 bg-primaryColor group-hover:scale-100 group-hover:opacity-100  transition-all duration-500 ease-in-out"></span>
                </button>
              </div>
              <div>
                <img
                  src={productbanner}
                  alt="productbanner"
                  className="w-[600px] h-[350px]"
                />
              </div>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center gap-10 pr-24">
              <div>
                <h4 className="uppercase text-2xl font-semibold tracking-widest text-secondaryColor">
                  Weekly Deal
                </h4>
                <h3 className="mt-3 text-4xl font-semibold">
                  Best Deal For This Week
                </h3>
                <p className="mt-3 text-black/80 tracking-wide">
                  There are many variations of passages available but the
                  majority have <br /> suffered alteration in some form by
                  injected humour, or randomised <br /> words which don't look
                  even slightly believable.
                </p>
                <div className="grid grid-cols-4 gap-3 mt-5">
                  <div className="bg-white rounded-2xl p-2 flex flex-col items-center justify-center">
                    <h2 className="text-secondaryColor text-5xl font-semibold">
                      1
                    </h2>
                    <p className="uppercase font-semibold">Day</p>
                  </div>
                  <div className="bg-white rounded-2xl p-2 flex flex-col items-center justify-center">
                    <h2 className="text-secondaryColor text-5xl font-semibold">
                      7
                    </h2>
                    <p className="uppercase font-semibold">Hours</p>
                  </div>
                  <div className="bg-white rounded-2xl p-2 flex flex-col items-center justify-center">
                    <h2 className="text-secondaryColor text-5xl font-semibold">
                      59
                    </h2>
                    <p className="uppercase font-semibold">Minutes</p>
                  </div>
                  <div className="bg-white rounded-2xl p-2 flex flex-col items-center justify-center">
                    <h2 className="text-secondaryColor text-5xl font-semibold">
                      45
                    </h2>
                    <p className="uppercase font-semibold">Seconds</p>
                  </div>
                </div>
                <button className="relative overflow-hidden px-6 py-3 mt-7 font-semibold text-white bg-secondaryColor/70 rounded-xl group">
                  <span className="relative z-10 text-white transition-colors duration-300">
                    Shop Now{" "}
                    <i className="fa-solid fa-arrow-right text-white"></i>
                  </span>

                  <span className="absolute inset-0 rounded-xl scale-0 opacity-0 bg-primaryColor group-hover:scale-100 group-hover:opacity-100  transition-all duration-500 ease-in-out"></span>
                </button>
              </div>
              <div>
                <img
                  src={productbanner}
                  alt="productbanner"
                  className="w-[600px] h-[350px]"
                />
              </div>
            </div>
          </div>
        </Slider>
      </div> */}

      {/* gallery */}
      <Gallery/>
   {/*    <div className="mx-side mt-16 text-center">
        <p className="font-semibold uppercase tracking-wider text-lg text-primaryColor">
          Our Gallery
        </p>
        <h3 className="text-3xl font-bold mt-3">
          Let's Check Our Photo{" "}
          <span className="text-primaryColor">Gallery</span>
        </h3>
      </div>

      <div className="mt-10 mx-side">
        <div className="grid grid-cols-4 gap-7">
          <div className="col-span-2 group relative rounded-3xl overflow-hidden">
            <img
              src={banner1}
              alt="productbanner"
              className="rounded-3xl h-80 object-cover overflow-hidden group"
            />
            <div className="absolute inset-0 bg-secondaryColor/30 h-0 opcaity-0 group-hover:h-full group-hover:opacity-100 transition-all duration-500 w-full">
              <div className="absolute inset-0 bg-secondaryColor/50 h-0 opcaity-0 group-hover:h-full delay-300 group-hover:opacity-100 transition-all duration-500 w-full"></div>
            </div>
          </div>
          <div className="group relative rounded-3xl overflow-hidden">
            <img
              src={banner2}
              alt="productbanner"
              className="rounded-3xl h-80 object-cover"
            />
            <div className="absolute inset-0 bg-secondaryColor/30 h-0 opcaity-0 group-hover:h-full group-hover:opacity-100 transition-all duration-500 w-full">
              <div className="absolute inset-0 bg-secondaryColor/50 h-0 opcaity-0 group-hover:h-full delay-300 group-hover:opacity-100 transition-all duration-500 w-full"></div>
            </div>
          </div>
          <div className="group relative rounded-3xl overflow-hidden">
            <img
              src={banner3}
              alt="productbanner"
              className="rounded-3xl h-80 object-cover"
            />
            <div className="absolute inset-0 bg-secondaryColor/30 h-0 opcaity-0 group-hover:h-full group-hover:opacity-100 transition-all duration-500 w-full">
              <div className="absolute inset-0 bg-secondaryColor/50 h-0 opcaity-0 group-hover:h-full delay-300 group-hover:opacity-100 transition-all duration-500 w-full"></div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-7 mt-7">
          <div className="group relative rounded-3xl overflow-hidden">
            <img
              src={banner2}
              alt="productbanner"
              className="rounded-3xl h-80 object-cover"
            />
            <div className="absolute inset-0 bg-secondaryColor/30 h-0 opcaity-0 group-hover:h-full group-hover:opacity-100 transition-all duration-500 w-full">
              <div className="absolute inset-0 bg-secondaryColor/50 h-0 opcaity-0 group-hover:h-full delay-300 group-hover:opacity-100 transition-all duration-500 w-full"></div>
            </div>
          </div>
          <div className="group relative rounded-3xl overflow-hidden">
            <img
              src={banner3}
              alt="productbanner"
              className="rounded-3xl h-80 object-cover"
            />
            <div className="absolute inset-0 bg-secondaryColor/30 h-0 opcaity-0 group-hover:h-full group-hover:opacity-100 transition-all duration-500 w-full">
              <div className="absolute inset-0 bg-secondaryColor/50 h-0 opcaity-0 group-hover:h-full delay-300 group-hover:opacity-100 transition-all duration-500 w-full"></div>
            </div>
          </div>
          <div className="col-span-2 group relative rounded-3xl overflow-hidden">
            <img
              src={banner1}
              alt="productbanner"
              className="rounded-3xl h-80 object-cover"
            />
            <div className="absolute inset-0 bg-secondaryColor/30 h-0 opcaity-0 group-hover:h-full group-hover:opacity-100 transition-all duration-500 w-full">
              <div className="absolute inset-0 bg-secondaryColor/50 h-0 opcaity-0 group-hover:h-full delay-300 group-hover:opacity-100 transition-all duration-500 w-full"></div>
            </div>
          </div>
        </div>
      </div>
 */}
      {/* testimonial section */}
      <Testimonial/>
      {/* <div
        style={{
          backgroundImage: `url(${testimonialbanner})`,
          backgroundSize: "cover",
          backgroundPosition: "center center",
        }}
        className="mt-16 py-16 px-side text-center"
      >
        <p className="text-lg uppercase text-white font-semibold tracking-widest">
          Testimonials
        </p>
        <h3 className="mt-3 text-4xl text-white font-semibold">
          What Our Client Say's About Us
        </h3>

        <div className="mt-10">
          <Slider {...testimonialsettings}>
            {testimonials.map((test) => (
              <div key={test.id} className="px-3">
                <div className="bg-white p-7 rounded-[60px] relative">
                  <div
                    className="absolute inset-0 "
                    style={{
                      backgroundImage: `url(${quotes})`,
                      backgroundSize: "35%",
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "calc(100% - 20px) calc(100% - 20px)",
                      opacity: 0.3,
                      zIndex: 0,
                    }}
                  ></div>
                  <div className="flex justify-start items-center gap-2 bg-secondaryColor rounded-full p-2">
                    <div>
                      <img
                        src={test.image}
                        alt="test1"
                        className="rounded-full w-20"
                      />
                    </div>
                    <div className="text-start">
                      <p className="text-white font-semibold text-xl">
                        {test.name}
                      </p>
                      <p className="text-blue-900 text-lg font-semibold">
                        {test.role}
                      </p>
                    </div>
                  </div>
                  <p className="mt-4 text-black/60">{test.comment}</p>
                  <div className="mt-4">
                    <i className="fa-solid fa-star text-secondaryColor"></i>
                    <i className="fa-solid fa-star text-secondaryColor"></i>
                    <i className="fa-solid fa-star text-secondaryColor"></i>
                    <i className="fa-solid fa-star text-secondaryColor"></i>
                    <i className="fa-solid fa-star text-secondaryColor"></i>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        </div>
      </div> */}

      {/* blog */}
      <Blogsection/>
  {/*     <div className="mt-16 mx-side">
        <div className="text-center">
          <p className="font-semibold uppercase tracking-wider text-lg text-primaryColor">
            Our Blog
          </p>
          <h3 className="text-3xl font-bold mt-3">
            Our Latest News & <span className="text-primaryColor">Blog</span>
          </h3>
        </div>

        <div className="flex gap-4 justify-center items-center">
          {blogsdata
            .map((blogitem) => (
              <div key={blogitem.id} className="mt-10">
                <div className="border-[1px] rounded-2xl p-5 group">
                  <div className="relative overflow-hidden rounded-2xl">
                    <img
                      src={blogitem.image}
                      alt={blogitem.name}
                      className="rounded-2xl transition-all duration-500 group-hover:scale-110"
                    />
                    <p className="absolute bottom-8 right-0 py-1 px-4 rounded-l-3xl text-white bg-primaryColor">
                      <i className="fa-solid fa-calendar-days text-white"></i>{" "}
                      {blogitem.date}
                    </p>
                  </div>
                  <div className="flex gap-7 py-3 border-b-[1px] justify-start items-center">
                    <div>
                      <i className="fa-regular fa-circle-user text-primaryColor"></i>{" "}
                      {blogitem.name}
                    </div>
                    <div>
                      <i className="fa-regular fa-comments text-primaryColor"></i>{" "}
                      {blogitem.comment}
                    </div>
                  </div>
                  <p className="mt-2 text-xl font-semibold">{blogitem.title}</p>
                  <p className="mt-2 text-black/50">{blogitem.description}</p>
                  <button className="mt-7 relative py-3 px-6 bg-primaryColor text-white rounded-2xl group/btn overflow-hidden">
                    <span className="text-white relative z-10">
                      Read More{" "}
                      <i className="fa-solid fa-arrow-right text-white"></i>
                    </span>
                    <div className="absolute inset-0 scale-0 opacity-0 transition-all duration-500 origin-center group-hover/btn:opacity-100 group-hover/btn:scale-100 rounded-2xl bg-secondaryColor"></div>
                  </button>
                </div>
              </div>
            ))
            .slice(0, 3)}
        </div>
      </div> */}

      {/* email subscription section */}
      <Emailsubscription/>
   {/*    <div
        className="mx-side mt-16 py-16 rounded-3xl relative overflow-hidden flex flex-col justify-center items-center"
        style={{ backgroundImage: `url(${subscriptionbanner})` }}
      >
        <div className="relative z-10 text-center">
          <p className="text-2xl uppercase text-white font-semibold">
            Get <span className="text-yellow-500 tracking-widest">20%</span> Off
            Discount Coupon
          </p>
          <p className="text-white lowercase text-lg mt-1">
            By Subscribe Our Newsletter
          </p>

          <div className="relative mt-7">
            <input
              type="email"
              placeholder="Your Email Address"
              className="py-4 px-7 rounded-full w-[580px] outline-none border-none"
            />
            <button className="absolute -right-3 top-1 py-3 px-5 rounded-3xl bg-secondaryColor overflow-hidden group">
              <span className="text-white relative z-10">
                Subscribe{" "}
                <i className="fa-regular fa-paper-plane text-white"></i>
              </span>
              <div className="absolute bg-primaryColor inset-0 scale-0 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:scale-100 rounded-full"></div>
            </button>
          </div>
        </div>
        <div className="absolute inset-0 bg-black/30"></div>
      </div> */}

      {/* instagram medion */}
      <Instagrammedion/>
   {/*    <div className="my-16 mx-side text-center">
        <h4 className="text-3xl font-bold">
          Instagram <span className="text-primaryColor">@Medion</span>
        </h4>
        <div className="mt-10">
          <Slider {...settings}>
            {instapost.map((post) => (
              <div key={post.id} className="px-3">
                <div className="relative rounded-2xl overflow-hidden group">
                  <img
                    src={post.image}
                    alt="insta"
                    className="rounded-2xl h-64 w-full object-fill relative"
                  />
                  <div className="absolute inset-0 bg-black/30 w-0 opacity-0 skew-y-12 transition-all duration-500 group-hover:opacity-100 group-hover:w-full group-hover:skew-y-0 rounded-2xl "></div>
                  <div className="absolute inset-0 flex flex-col justify-center items-center">
                    <span className=" bg-primaryColor rounded-full opacity-0 p-2 group-hover:opacity-100 transition-all duration-500">
                      <i class="fa-brands fa-instagram text-2xl text-white"></i>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        </div>
      </div> */}
    </>
  );
};

export default Home;
