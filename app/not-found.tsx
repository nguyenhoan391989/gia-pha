import Link from 'next/link';
import { Button } from '@/components/ui/button';

/** Trang 404 */
export default function NotFound() {
  return (
    <div className="grid min-h-[60vh] place-items-center p-4">
      <div className="w-full max-w-md rounded-lg border bg-card p-6 text-center shadow-sm">
        <div className="mb-3 text-4xl">🔍</div>
        <h2 className="mb-2 text-lg font-bold text-primary dark:text-gold">Không tìm thấy trang</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Trang bạn tìm không tồn tại hoặc đã bị di chuyển.
        </p>
        <Button asChild>
          <Link href="/">Về trang chủ</Link>
        </Button>
      </div>
    </div>
  );
}
