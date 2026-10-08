import { useEffect, useState } from "react";
import API from "../api/axios";
import { ProductRail } from "../components/ui/ProductRail";

export const TrendingItems = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/product/section/trending")
      .then((res) => setProducts(res.data?.data || []))
      .catch((error) => console.log(error))
      .finally(() => setLoading(false));
  }, []);

  return (
    <ProductRail
      eyebrow="Customer Favourites"
      title="Trending Now"
      subtitle="Most-ordered medical and surgical essentials this week."
      viewAllTo="/shop?section=trending"
      products={products}
      loading={loading}
    />
  );
};

export default TrendingItems;
