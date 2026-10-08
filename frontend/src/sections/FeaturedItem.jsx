import { useEffect, useState } from "react";
import API from "../api/axios";
import { ProductRail } from "../components/ui/ProductRail";

export const FeaturedItem = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/product/section/featured")
      .then((res) => setProducts(res.data?.data || []))
      .catch((error) => console.log(error))
      .finally(() => setLoading(false));
  }, []);

  return (
    <ProductRail
      eyebrow="Curated For You"
      title="Featured Products"
      subtitle="Hand-picked, quality-assured products trusted by healthcare professionals."
      viewAllTo="/shop?section=featured"
      products={products}
      loading={loading}
    />
  );
};

export default FeaturedItem;
