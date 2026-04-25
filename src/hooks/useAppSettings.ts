import { useQuery } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';

export function useAppSettings() {
  return useQuery({
    queryKey: ['appSettings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('app_settings')
        .select('*')
        .order('key');

      if (error) throw error;
      return data;
    },
  });
}

export function useCustomDesignApparelTypes() {
  return useQuery({
    queryKey: ['customDesignApparelTypes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_custom_design_apparel_types');

      if (error) throw error;
      return data as string[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useApparelBasePrices() {
  return useQuery({
    queryKey: ['apparelBasePrices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_apparel_base_prices');

      if (error) throw error;
      return data as { hoodie: number; tshirt: number };
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useApparelPrintPrices() {
  return useQuery({
    queryKey: ['apparelPrintPrices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_apparel_print_prices');

      if (error) throw error;
      return data as { single: number; both: number };
    },
    staleTime: 5 * 60 * 1000,
  });
}
