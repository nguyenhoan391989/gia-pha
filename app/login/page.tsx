'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createSupabaseBrowser } from '@/lib/supabase/client';

const SUPABASE_READY = !!process.env.NEXT_PUBLIC_SUPABASE_URL;

/** 01. Trang đăng nhập - panel đỏ với cây gia phả vàng + form (theo storyboard) */
export default function LoginPage() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);

    // Chưa cấu hình Supabase -> chế độ demo (giữ nguyên trải nghiệm Phase 1)
    if (!SUPABASE_READY) {
      setTimeout(() => {
        toast.success('Đăng nhập (demo)', { description: 'Chưa cấu hình Supabase - đang dùng dữ liệu mẫu.' });
        router.push('/');
      }, 700);
      return;
    }

    try {
      const supabase = createSupabaseBrowser();
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) throw error;
      toast.success('Đăng nhập thành công', { description: 'Chào mừng bạn trở lại!' });
      router.push('/');
      router.refresh();
    } catch (err) {
      toast.error('Đăng nhập thất bại', { description: (err as Error).message });
      setBusy(false);
    }
  };

  const register = async () => {
    if (!SUPABASE_READY) { toast.info('Cần cấu hình Supabase để đăng ký'); return; }
    if (!email.trim() || !password) { toast.error('Nhập email và mật khẩu để đăng ký'); return; }
    try {
      const supabase = createSupabaseBrowser();
      const { error } = await supabase.auth.signUp({ email: email.trim(), password });
      if (error) throw error;
      toast.success('Đã tạo tài khoản', { description: 'Kiểm tra email để xác nhận (nếu được bật).' });
    } catch (err) {
      toast.error('Đăng ký thất bại', { description: (err as Error).message });
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-gradient-to-br from-primary-dark via-primary to-[#5a0000] p-4">
      <div className="grid w-full max-w-3xl overflow-hidden rounded-2xl bg-card shadow-2xl md:grid-cols-2 animate-fade-in">
        {/* Panel trái: cây gia phả tông đỏ - vàng */}
        <div className="relative hidden items-center justify-center bg-gradient-to-b from-primary to-primary-dark p-8 md:flex">
          <svg viewBox="0 0 200 260" className="w-56 drop-shadow-[0_0_24px_rgba(212,175,55,.35)]" aria-hidden>
            <g fill="none" stroke="#D4AF37" strokeWidth="5" strokeLinecap="round">
              <path d="M100 250 V150 M100 150 C100 110 60 120 55 85 M100 150 C100 110 140 120 145 85 M100 150 C100 95 100 90 100 60 M55 85 C50 65 40 60 35 45 M55 85 C60 68 72 62 75 48 M145 85 C150 65 160 60 165 45 M145 85 C140 68 128 62 125 48 M100 60 C95 45 85 40 82 28 M100 60 C105 45 115 40 118 28"/>
            </g>
            <g fill="#D4AF37">
              <circle cx="35" cy="40" r="9"/><circle cx="75" cy="43" r="9"/><circle cx="82" cy="23" r="9"/>
              <circle cx="118" cy="23" r="9"/><circle cx="125" cy="43" r="9"/><circle cx="165" cy="40" r="9"/>
              <circle cx="100" cy="55" r="10"/>
            </g>
            <rect x="60" y="248" width="80" height="8" rx="4" fill="#D4AF37"/>
          </svg>
          <div className="absolute inset-0 opacity-[0.06]"
            style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, #fff 1px, transparent 1px)', backgroundSize: '18px 18px' }} />
        </div>

        {/* Form */}
        <form onSubmit={submit} className="flex flex-col justify-center gap-4 p-8 md:p-10">
          <div className="mb-2 text-center">
            <h1 className="text-2xl font-bold text-primary dark:text-gold">Gia Phả Dòng Tộc</h1>
            <p className="mt-1 text-sm text-muted-foreground">Đăng nhập để tiếp tục</p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required autoComplete="username" placeholder="nguyenvana@dongtoc.vn"
              value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Mật khẩu</Label>
            <Input id="password" type="password" required autoComplete="current-password" placeholder="••••••••"
              value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div className="flex items-center justify-between text-sm">
            <label className="flex cursor-pointer items-center gap-2 text-muted-foreground">
              <input type="checkbox" className="h-4 w-4 accent-[#8B0000]" /> Ghi nhớ đăng nhập
            </label>
            <button type="button" className="font-medium text-primary hover:underline dark:text-gold"
              onClick={() => toast.info('Dùng "Quên mật khẩu" trong Supabase Auth')}>
              Quên mật khẩu?
            </button>
          </div>
          <Button type="submit" size="lg" className="mt-1 w-full font-semibold tracking-wide" disabled={busy}>
            {busy && <Loader2 className="animate-spin" />}
            {busy ? 'ĐANG ĐĂNG NHẬP...' : 'ĐĂNG NHẬP'}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Chưa có tài khoản?{' '}
            <button type="button" className="font-semibold text-primary hover:underline dark:text-gold"
              onClick={register}>
              Đăng ký
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
