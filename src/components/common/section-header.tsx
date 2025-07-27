import { ReactNode } from 'react'

interface SectionHeaderProps {
  title: string
  children?: ReactNode
}

export function SectionHeader({ title, children }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-2xl font-bold">{title}</h2>
      {children && <div className="flex gap-2">{children}</div>}
    </div>
  )
}