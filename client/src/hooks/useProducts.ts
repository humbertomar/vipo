import { useState, useEffect } from 'react';

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  priceInCents: number;
  sku: string;
  totalStock: number;
  isActive: boolean;
  isFeatured: boolean;
  categoryId: string;
  collectionId?: string;
  images: Array<{ id: string; url: string; altText?: string }>;
  variants: Array<{ id: string; size: string; color?: string; stock: number }>;
  attributes: Array<{ id: string; name: string; value: string }>;
  category?: { id: string; name: string };
  collection?: { id: string; name: string };
}

export interface ProductsResponse {
  data: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

/**
 * Hook para buscar produtos da API
 */
export function useProducts(page: number = 1, limit: number = 20, filters?: any) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page,
    limit,
    total: 0,
    pages: 0,
  });

  useEffect(() => {
    let isMounted = true;
    
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        // Construir query string com filtros
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          ...(filters?.search && { search: filters.search }),
          ...(filters?.categoryId && { categoryId: filters.categoryId }),
          ...(filters?.collectionId && { collectionId: filters.collectionId }),
          ...(filters?.minPrice && { minPrice: filters.minPrice.toString() }),
          ...(filters?.maxPrice && { maxPrice: filters.maxPrice.toString() }),
        });

        const url = `/api/products?${params}`;
        console.log('Fetching from:', url);
        
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Response data:', data);
        
        if (!isMounted) return;
        
        // Lidar com diferentes formatos de resposta
        if (Array.isArray(data)) {
          setProducts(data);
          setPagination({
            page,
            limit,
            total: data.length,
            pages: 1,
          });
        } else if (data.data) {
          setProducts(data.data);
          setPagination(data.pagination || { page, limit, total: data.data.length, pages: 1 });
        } else {
          setProducts([]);
          setPagination({ page, limit, total: 0, pages: 0 });
        }
      } catch (err) {
        if (!isMounted) return;
        const errorMsg = err instanceof Error ? err.message : 'Erro desconhecido';
        console.error('Erro ao buscar produtos:', errorMsg);
        setError(errorMsg);
        setProducts([]);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProducts();
    
    return () => {
      isMounted = false;
    };
  }, [page, limit, filters]);

  return { products, loading, error, pagination };
}

/**
 * Hook para buscar produto por slug
 */
export function useProductBySlug(slug: string) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    let isMounted = true;

    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/products/slug/${slug}`);

        if (!response.ok) {
          throw new Error('Produto não encontrado');
        }

        const data = await response.json();
        if (isMounted) {
          setProduct(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Erro desconhecido');
          setProduct(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProduct();
    
    return () => {
      isMounted = false;
    };
  }, [slug]);

  return { product, loading, error };
}

/**
 * Hook para buscar produtos em destaque
 */
export function useFeaturedProducts(limit: number = 8) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchFeatured = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/products/featured?limit=${limit}`);

        if (!response.ok) {
          throw new Error('Erro ao buscar produtos em destaque');
        }

        const data = await response.json();
        if (isMounted) {
          if (Array.isArray(data)) {
            setProducts(data);
          } else if (data.data) {
            setProducts(data.data);
          } else {
            setProducts([]);
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Erro desconhecido');
          setProducts([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchFeatured();
    
    return () => {
      isMounted = false;
    };
  }, [limit]);

  return { products, loading, error };
}

