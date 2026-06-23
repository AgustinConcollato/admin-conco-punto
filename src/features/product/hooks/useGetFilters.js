import { useMemo } from "react";

export function useGetFilters(searchParams) {
    return useMemo(() => {
        return {
            search: searchParams.get('search') || '',
            category_id: searchParams.get('category_id') || '',
            supplier_id: searchParams.get('supplier_id') || '',
            stock_min: searchParams.get('stock_min') || '',
            stock_max: searchParams.get('stock_max') || '',
            price_min: searchParams.get('price_min') || '',
            price_max: searchParams.get('price_max') || '',
            price_list_id: searchParams.get('price_list_id') || '',
            is_dropshipping: searchParams.get('is_dropshipping') || '',
            sort_by: searchParams.get('sort_by') || 'created_at',
            sort_order: searchParams.get('sort_order') || 'desc',
            per_page: searchParams.get('per_page') || '20',
            page: searchParams.get('page') || '1',
        };
    }, [searchParams]);
}