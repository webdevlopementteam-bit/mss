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
import { Popularitem } from "../sections/Popularitem";
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
      <Hero />

    
      <Category />

     

      <Productbanner />
      <TrendingItems />
      

      <Popularitem />


      <Popularbrands />
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
      <FeaturedItem />
      

      <VideoBanner />

      {/* catalogue type */}
      <Catalogtype />
      

      {/* gallery */}
      <Gallery />
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
      <Testimonial />
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
      <Blogsection />
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
      <Emailsubscription />
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
      <Instagrammedion />
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
