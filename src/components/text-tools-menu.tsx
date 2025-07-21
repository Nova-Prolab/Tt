
"use client"

import { useState } from "react"
import { Wand, Sparkles, PencilRuler, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

type TextToolsMenuProps = {
  onAction: (newText: string) => void;
  text: string;
  selectedText: string;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
}

export function TextToolsMenu({ onAction, text, selectedText, textareaRef }: TextToolsMenuProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [sfxText, setSfxText] = useState("");
  const { toast } = useToast();

  const handleAddSfx = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const formattedSfx = `*${sfxText}*`;
    const newText = text.substring(0, start) + formattedSfx + text.substring(end);
    
    onAction(newText);
    
    // Move cursor after the inserted SFX
    setTimeout(() => {
        textarea.focus();
        textarea.selectionStart = textarea.selectionEnd = start + formattedSfx.length;
    }, 0);
    
    setSfxText("");
    setIsDialogOpen(false);
    toast({
      title: "SFX Añadido",
      description: `Se ha insertado "${formattedSfx}" en tu traducción.`,
    });
  }

  const handleFormatSelectedSfx = () => {
    const textarea = textareaRef.current;
    if (!textarea || !selectedText) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Por favor, selecciona el texto que quieres formatear como SFX.",
        });
        return;
    }
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const formattedSfx = `*${selectedText}*`;
    const newText = text.substring(0, start) + formattedSfx + text.substring(end);

    onAction(newText);

    setTimeout(() => {
        textarea.focus();
        textarea.selectionStart = start;
        textarea.selectionEnd = start + formattedSfx.length;
    }, 0);
    
    toast({
      title: "SFX Formateado",
      description: `Se ha formateado "${selectedText}" como onomatopeya.`,
    });
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Wand className="mr-2 h-4 w-4" />
            Herramientas
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setIsDialogOpen(true)}>
            <Sparkles className="mr-2 h-4 w-4" />
            <span>Añadir Onomatopeya (SFX)</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleFormatSelectedSfx} disabled={!selectedText}>
            <PencilRuler className="mr-2 h-4 w-4" />
            <span>Formatear SFX Seleccionado</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Añadir Onomatopeya (SFX)</AlertDialogTitle>
            <AlertDialogDescription>
              Escribe el texto de la onomatopeya (ej: BOOM, ¡CRASH!, ZAS) y se insertará en tu traducción con el formato correcto (*SFX*).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="grid gap-2 py-2">
            <Label htmlFor="sfx-input">Texto de la Onomatopeya</Label>
            <Input 
                id="sfx-input" 
                value={sfxText}
                onChange={(e) => setSfxText(e.target.value)}
                placeholder="Ej: ¡BOOM!"
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSfx();
                    }
                }}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleAddSfx} disabled={!sfxText}>Añadir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
