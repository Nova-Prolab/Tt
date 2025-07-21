
"use client"

import { BookMarked, Download, ChevronsUpDown, PlusCircle, Pencil, Trash2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"

type HeaderProps = {
  onExport: (format: 'txt' | 'srt' | 'docx') => void;
  projects: { id: string; name: string }[];
  activeProjectId: string | null;
  onSwitchProject: (id: string) => void;
  onNewProject: () => void;
  onRenameProject: () => void;
  onDeleteProject: () => void;
}

export function Header({ 
  onExport, 
  projects, 
  activeProjectId, 
  onSwitchProject, 
  onNewProject, 
  onRenameProject, 
  onDeleteProject 
}: HeaderProps) {
  const activeProject = projects.find(p => p.id === activeProjectId);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center">
        <div className="mr-4 flex items-center">
          <BookMarked className="h-6 w-6 mr-2 text-primary" />
          <span className="font-bold text-xl font-headline">Manhwa Scribe</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="ml-2">
                <span className="mr-2 font-semibold">{activeProject?.name || "Lienzo"}</span>
                <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>Lienzos de Traducción</DropdownMenuLabel>
              <DropdownMenuGroup>
                {projects.map(project => (
                  <DropdownMenuItem 
                    key={project.id} 
                    onClick={() => onSwitchProject(project.id)}
                    disabled={project.id === activeProjectId}
                  >
                    {project.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onNewProject}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Nuevo Lienzo
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onRenameProject} disabled={!activeProject}>
                <Pencil className="mr-2 h-4 w-4" />
                Renombrar Lienzo Actual
              </DropdownMenuItem>
               <DropdownMenuItem onClick={onDeleteProject} disabled={projects.length <= 1} className="text-destructive focus:text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar Lienzo Actual
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
        </div>
      </div>
    </header>
  )
}
