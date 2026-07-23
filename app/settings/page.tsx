'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { CloudUpload, ShieldCheck, UserRound, Palette } from 'lucide-react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CURRENT_USER } from '@/lib/mock-data';

/** 10. Cài đặt - hồ sơ, giao diện (dark mode), phân quyền, sao lưu dữ liệu */
export default function SettingsPage() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <h1 className="text-xl font-bold text-primary dark:text-gold md:text-2xl">Cài đặt</h1>

      {/* Hồ sơ */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-primary dark:text-gold">
          <UserRound className="h-4 w-4" /> Hồ sơ cá nhân
        </CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-gold/60">
              <AvatarFallback className="text-lg">{CURRENT_USER.initials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{CURRENT_USER.name}</p>
              <Badge variant="gold" className="mt-1">{CURRENT_USER.role}</Badge>
            </div>
            <Button variant="outline" className="ml-auto" onClick={() => toast.info('Đổi ảnh - Phase 2')}>
              Đổi ảnh
            </Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5"><Label>Họ và tên</Label><Input defaultValue={CURRENT_USER.name} /></div>
            <div className="space-y-1.5"><Label>Email</Label><Input defaultValue="nguyenvana@dongtoc.vn" /></div>
          </div>
          <Button onClick={() => toast.success('Đã lưu hồ sơ (mock)')}>Lưu thay đổi</Button>
        </CardContent>
      </Card>

      {/* Giao diện */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-primary dark:text-gold">
          <Palette className="h-4 w-4" /> Giao diện
        </CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Chế độ tối (Dark Mode)</p>
              <p className="text-sm text-muted-foreground">Giao diện dịu mắt khi dùng buổi tối.</p>
            </div>
            {mounted && (
              <Switch checked={resolvedTheme === 'dark'}
                onCheckedChange={(v) => setTheme(v ? 'dark' : 'light')} aria-label="Dark mode" />
            )}
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Ngôn ngữ</p>
              <p className="text-sm text-muted-foreground">Ngôn ngữ hiển thị của ứng dụng.</p>
            </div>
            <Select defaultValue="vi">
              <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="vi">Tiếng Việt</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Phân quyền */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-primary dark:text-gold">
          <ShieldCheck className="h-4 w-4" /> Phân quyền
        </CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {[
            { name: 'Nguyễn Văn A', role: 'Quản trị viên' },
            { name: 'Nguyễn Văn D', role: 'Biên tập' },
            { name: 'Trần Thị G', role: 'Chỉ xem' },
          ].map((u) => (
            <div key={u.name} className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-gold/20 text-xs text-primary dark:text-gold">
                  {u.name.split(' ').pop()!.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className="flex-1 text-sm font-medium">{u.name}</span>
              <Select defaultValue={u.role} onValueChange={() => toast.success(`Đã đổi quyền ${u.name} (mock)`)}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['Quản trị viên', 'Biên tập', 'Chỉ xem'].map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Sao lưu */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-primary dark:text-gold">
          <CloudUpload className="h-4 w-4" /> Sao lưu dữ liệu
        </CardTitle></CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          <div className="mr-auto">
            <p className="font-medium">Sao lưu gần nhất: 12/06/2024 · 22:00</p>
            <p className="text-sm text-muted-foreground">Sao lưu và khôi phục dữ liệu gia phả.</p>
          </div>
          <Button variant="outline" onClick={() => toast.success('Đã tạo bản sao lưu (mock)')}>Sao lưu ngay</Button>
          <Button variant="gold" onClick={() => toast.info('Khôi phục - Phase 2')}>Khôi phục</Button>
        </CardContent>
      </Card>
    </div>
  );
}
