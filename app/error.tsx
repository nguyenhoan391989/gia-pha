'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

/** Error Boundary toàn cục (App Router) */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[app:error]', error);
  }, [error]);

  return (
    <div className="grid min-h-[60vh] place-items-center p-4">
      <div className="w-full max-w-md rounded-lg border bg-card p-6 text-center shadow-sm">
        <div className="mb-3 text-4xl">⚠️</div>
        <h2 className="mb-2 text-lg font-bold text-primary dark:text-gold">Đã xảy ra lỗi</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Rất tiếc, có lỗi không mong muốn. Vui lòng thử lại.
        </p>
        <Button onClick={reset}>Thử lại</Button>
      </div>
    </div>
  );
}
