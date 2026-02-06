import { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';

interface ConnectionStatusBadgeProps {
  isConnected: boolean;
  connectionQuality: 'good' | 'poor' | 'disconnected';
  reconnectAttempts: number;
}

export const ConnectionStatusBadge = ({
  isConnected,
  connectionQuality,
  reconnectAttempts,
}: ConnectionStatusBadgeProps) => {
  const status = useMemo(() => {
    if (!isConnected && reconnectAttempts > 0) {
      return {
        label: `재연결 중... (${reconnectAttempts}/10)`,
        variant: 'warning' as const,
        animate: true,
      };
    }
    if (isConnected && connectionQuality === 'poor') {
      return {
        label: '연결 불안정',
        variant: 'warning' as const,
        animate: false,
      };
    }
    if (isConnected) {
      return {
        label: '실시간',
        variant: 'success' as const,
        animate: true,
      };
    }
    return {
      label: '연결 끊김',
      variant: 'destructive' as const,
      animate: false,
    };
  }, [isConnected, connectionQuality, reconnectAttempts]);

  return (
    <Badge variant={status.variant} className="flex items-center gap-2">
      <div
        className={`w-2 h-2 rounded-full ${
          status.animate ? 'animate-pulse' : ''
        }`}
      />
      {status.label}
    </Badge>
  );
};
