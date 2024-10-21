import { useState, useEffect, useCallback } from 'react';

export const useFetch = (url, headers) => {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState(null);

  const getProducts = useCallback(async () => {
    const response = await fetch(url + '?offset=0&limit=1', { headers });
    const products = await response.json();
    setProducts(products);
    setLoading(false);
  }, [url, headers]);

  useEffect(() => {
    getProducts();
  }, [getProducts]);

  return { loading, products };
};
