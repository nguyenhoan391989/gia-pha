'use client';

import Link from 'next/link';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { TreeNode as TreeNodeType } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

/** Thẻ 1 người trong cây: avatar tròn + tên + năm (theo storyboard màn 03) */
function PersonCard({ name, years, href }: { name: string; years: string; href?: string }) {
  const inner = (
    <span className="flex items-center gap-2.5 rounded-md border bg-card px-3 py-2 shadow-sm transition-all hover:-translate-y-0.5 hover:border-gold hover:shadow-md">
      <Avatar className="h-8 w-8">
        <AvatarFallback className="bg-gold/20 text-xs text-primary dark:text-gold">
          {name.split(' ').pop()!.charAt(0)}
        </AvatarFallback>
      </Avatar>
      <span className="text-left leading-tight">
        <span className="block whitespace-nowrap text-[13px] font-semibold">{name}</span>
        <span className="block text-[11px] text-muted-foreground">({years})</span>
      </span>
    </span>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

/**
 * Node đệ quy của cây: cụm (người + vợ/chồng) ở trên, đường nối xuống hàng con.
 * Đường nối vẽ bằng div border - responsive, cuộn ngang khi cây rộng.
 */
export function TreeNodeBox({ node, isRoot = false }: { node: TreeNodeType; isRoot?: boolean }) {
  const hasChildren = !!node.children?.length;
  return (
    <div className={cn('flex flex-col items-center', !isRoot && 'relative pt-5')}>
      {/* Nhánh dọc từ cha xuống */}
      {!isRoot && <span className="absolute left-1/2 top-0 h-5 w-px -translate-x-1/2 bg-border" />}

      {/* Cụm người + vợ/chồng */}
      <div className="flex items-center gap-2">
        <PersonCard name={node.name} years={node.years} href={`/members/${node.id}`} />
        {node.spouse && (
          <>
            <span className="h-px w-4 bg-gold" />
            <PersonCard name={node.spouse.name} years={node.spouse.years} />
          </>
        )}
      </div>

      {hasChildren && (
        <>
          {/* Nhánh dọc xuống hàng con */}
          <span className="h-5 w-px bg-border" />
          {/* Hàng con với thanh ngang nối */}
          <div className="relative flex items-start gap-6">
            {node.children!.length > 1 && (
              <span className="absolute left-[calc(0%+3rem)] right-[calc(0%+3rem)] top-0 h-px bg-border"
                style={{ left: '25%', right: '25%' }} />
            )}
            {node.children!.map((c) => (
              <TreeNodeBox key={c.id} node={c} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
