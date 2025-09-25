import { useQuery } from '@tanstack/react-query';
import { AnalyticsData } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

export function useAnalytics() {
  const { token } = useAuth();
  
  return useQuery({
    queryKey: ['/api/analytics'],
    queryFn: async (): Promise<AnalyticsData> => {
      const response = await fetch('/api/analytics', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }
      
      return response.json();
    },
    enabled: !!token,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}
