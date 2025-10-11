import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import API_BASE_URL from '@/config/api';

const fetchProducts = async (filters, sort) => {
  // Transform filters to match backend expectations
  const queryParams = {
    sortBy: sort || 'price-lowtohigh'
  }

  // Add filters only if they exist and have values
  if (filters.recipient?.length) queryParams.recipient = filters.recipient.join(',')
  if (filters.category?.length) queryParams.category = filters.category.join(',')
  if (filters.jewellery?.length) queryParams.jewellery = filters.jewellery.join(',')

  const response = await axios.get(`${API_BASE_URL}/api/shop/products/get`, {
    params: queryParams,
    withCredentials: true
  })
  return response.data
}

export function useProducts(filters, sort) {
  return useQuery({
    queryKey: ['products', filters, sort],
    queryFn: () => fetchProducts(filters, sort),
    staleTime: 5 * 60 * 1000,
  })
}

// This is client/src/hooks/useProducts.js


