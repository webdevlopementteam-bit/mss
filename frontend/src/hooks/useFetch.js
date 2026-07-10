import { useEffect, useState } from "react";

const useFetch = (apiFunc) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const res = await apiFunc();
      const result = res.data.data || res.data;
      setData(result);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading };
};

export default useFetch;