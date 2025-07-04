"use client"

import { BookMarked, Download, LogOut } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { logout } from "@/app/login/actions"
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type HeaderProps = {
  onExport: (format: 'txt' | 'srt' | 'docx') => void;
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
                <Download className="mr-2 h-4 w-4" /> Exportar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onExport('txt')}>
                como .txt
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExport('srt')}>
                como .srt
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExport('docx')}>
                como .docx
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <ThemeToggle />
           <form action={logout}>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" type="submit">
                            <LogOut className="h-5 w-5" />
                            <span className="sr-only">Cerrar sesión</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Cerrar sesión</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
          </form>
        </div>
      </div>
    </header>
  )
}
