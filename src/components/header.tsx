"use client"

import { BookMarked, Download } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"

type HeaderProps = {
  onExport: (format: 'txt' | 'srt') => void;
}

export function Header({ onExport }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center">
        <div className="mr-4 flex items-center">
          <BookMarked className="h-6 w-6 mr-2 text-primary" />
          <span className="font-bold text-xl font-headline">Manhwa Scribe</span>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                <Download className="mr-2 h-4 w-4" /> Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onExport('txt')}>
                as .txt
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExport('srt')}>
                as .srt
              </DropdownMenuItem>
              <DropdownMenuItem disabled>
                as .docx (coming soon)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
