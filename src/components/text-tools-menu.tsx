
"use client"

import { useState } from "react"
import { Wand, Sparkles, PencilRuler, Tag, Trash2, CheckSquare } from "lucide-react"
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

type TextToolsMenuProps = {
  onAction: (newText: string) => void;
  text: string;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
}

export function TextToolsMenu({ onAction, text, textareaRef }: TextToolsMenuProps) {
  const [isAddSfxDialogOpen, setIsAddSfxDialogOpen] = useState(false);
  const [isMarkSfxDialogOpen, setIsMarkSfxDialogOpen] = useState(false);
  const [sfxText, setSfxText] = useState("");
  const { toast } = useToast();
  
  const [words, setWords] = useState<string[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);

  const handleAddSfx = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const formattedSfx = `* ${sfxText}`; // Correct format
    const newText = text.substring(0, start) + formattedSfx + text.substring(end);
    
    onAction(newText);
    
    setTimeout(() => {
        textarea.focus();
        textarea.selectionStart = textarea.selectionEnd = start + formattedSfx.length;
    }, 0);
    
    setSfxText("");
    setIsAddSfxDialogOpen(false);
    toast({
      title: "SFX Añadido",
      description: `Se ha insertado "${formattedSfx}" en tu traducción.`,
    });
  }

  const handleOpenMarkSfxDialog = () => {
    // Split text into words/tokens for selection
    const textTokens = text.split(/(\s+)/).filter(Boolean); // Split by space and keep delimiters
    setWords(textTokens);
    setSelectedIndices([]);
    setIsMarkSfxDialogOpen(true);
  };

  const handleToggleWordSelection = (index: number) => {
    setSelectedIndices(prev => 
        prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };
  
  const handleApplyMarkedSfx = () => {
      let newText = "";
      let lastIndex = -1;

      // Group consecutive selected indices
      const groupedIndices = selectedIndices.sort((a,b) => a-b).reduce((acc, curr) => {
          if (acc.length > 0 && acc[acc.length-1][acc[acc.length-1].length -1] === curr - 1) {
              acc[acc.length-1].push(curr);
          } else {
              acc.push([curr]);
          }
          return acc;
      }, [] as number[][]);

      const formattedTextParts: string[] = [];
      let currentIndexInOriginal = 0;

      groupedIndices.forEach(group => {
          // Add text before the selection
          const startIndex = group[0];
          formattedTextParts.push(words.slice(currentIndexInOriginal, startIndex).join(''));

          // Add the formatted selection
          const selectedWords = group.map(i => words[i]).join('');
          formattedTextParts.push(`* ${selectedWords}`);

          // Update current index
          currentIndexInOriginal = group[group.length - 1] + 1;
      });

      // Add any remaining text
      formattedTextParts.push(words.slice(currentIndexInOriginal).join(''));
      
      const finalFormattedText = formattedTextParts.join('');

      onAction(finalFormattedText);
      toast({
          title: "Formato Aplicado",
          description: `Se han formateado ${groupedIndices.length} onomatopeyas.`,
      });
      setIsMarkSfxDialogOpen(false);
  };
  
  const handleCleanSfx = () => {
    const cleanedText = text.replace(/\* /g, '');
    onAction(cleanedText);
    toast({
        title: "Formato Limpiado",
        description: "Se han eliminado todos los formatos de onomatopeya.",
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
          <DropdownMenuItem onClick={() => setIsAddSfxDialogOpen(true)}>
            <Sparkles className="mr-2 h-4 w-4" />
            <span>Añadir Onomatopeya (SFX)</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleOpenMarkSfxDialog} disabled={!text}>
            <CheckSquare className="mr-2 h-4 w-4" />
            <span>Marcar Onomatopeyas en Texto</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleCleanSfx} disabled={!text.includes('* ')}>
            <Trash2 className="mr-2 h-4 w-4" />
            <span>Limpiar Formato SFX</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dialog for adding a single SFX */}
      <AlertDialog open={isAddSfxDialogOpen} onOpenChange={setIsAddSfxDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Añadir Onomatopeya (SFX)</AlertDialogTitle>
            <AlertDialogDescription>
              Escribe la onomatopeya (ej: BOOM, ¡CRASH!) y se insertará en tu traducción con el formato correcto (* SFX).
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
                    if (e.key === 'Enter' && sfxText) {
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

      {/* Dialog for marking multiple SFX */}
      <Dialog open={isMarkSfxDialogOpen} onOpenChange={setIsMarkSfxDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Marcar Onomatopeyas</DialogTitle>
            <DialogDescription>
              Haz clic en las palabras o frases que son onomatopeyas. Puedes seleccionar varias. Se agruparán si son consecutivas.
            </DialogDescription>
          </DialogHeader>
          <div className="my-4 p-4 border rounded-md max-h-[50vh] overflow-y-auto">
            <p className="whitespace-pre-wrap leading-relaxed">
              {words.map((word, index) => (
                <span
                  key={index}
                  onClick={() => handleToggleWordSelection(index)}
                  className={cn(
                    "cursor-pointer rounded-sm transition-colors",
                    selectedIndices.includes(index) ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                  )}
                >
                  {word}
                </span>
              ))}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMarkSfxDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleApplyMarkedSfx} disabled={selectedIndices.length === 0}>
                <Tag className="mr-2 h-4 w-4" /> Aplicar Formato a {selectedIndices.length} {selectedIndices.length === 1 ? 'Selección' : 'Selecciones'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
