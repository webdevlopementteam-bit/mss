import React from "react";

export const Policies = () => {
  const policies = [
    {
      icon: "fa-truck",
      title: "Free Delivery",
      description: "Orders Over $120",
      iconType: "regular",
    },
    {
      icon: "fa-rotate",
      title: "Get Refund",
      description: "Within 30 Days Returns",
      iconType: "solid",
    },
    {
      icon: "fa-wallet",
      title: "Safe Payment",
      description: "100% Secure Payment",
      iconType: "solid",
    },
    {
      icon: "fa-headset",
      title: "24/7 Support",
      description: "Feel Free To Call Us",
      iconType: "solid",
    },
  ];

  return (
    <section className="px-4 md:px-6 lg:px-side mt-10 md:mt-16">
      <div className="bg-secondaryColor rounded-xl md:rounded-2xl py-6 md:py-8 px-4 md:px-8 lg:px-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 lg:gap-8">
          {policies.map((policy, index) => (
            <div
              key={index}
              className="
                flex flex-col sm:flex-row
                items-center
                text-center sm:text-left
                gap-4
                xl:border-r
                border-white/30
                xl:pr-6
                last:border-r-0
              "
            >
              {/* Icon */}
              <div className="bg-primaryColor relative z-10 w-14 h-14 md:w-16 md:h-16 rounded-[30%_70%_70%_30%/30%_30%_70%_70%] flex justify-center items-center flex-shrink-0 before:content-[''] before:w-full before:h-full before:border-2 before:absolute before:-z-10 before:border-primaryColor before:rounded-[30%_70%_70%_30%/30%_30%_70%_70%] before:-top-[5px] before:-left-[5px]">
                <i
                  className={`fa-${policy.iconType} ${policy.icon} text-white text-xl md:text-2xl`}
                ></i>
              </div>

              {/* Content */}
              <div>
                <h4 className="text-white text-lg md:text-xl lg:text-[22px] font-semibold">
                  {policy.title}
                </h4>

                <p className="text-white/90 text-sm md:text-sm font-semibold mt-1">
                  {policy.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Policies;