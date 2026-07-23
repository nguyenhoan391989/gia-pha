'use client';

import { useTheme } from 'next-themes';
import { Toaster as Sonner } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

/** Toast (sonner) đồng bộ dark mode */
export function Toaster({ ...props }: ToasterProps) {
  const { theme = 'system' } = useTheme();
  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      position="top-right"
      richColors
      toastOptions={{
        classNames: {
          toast: 'group border-border shadow-lg',
        },
      }}
      {...props}
    />
  );
}
