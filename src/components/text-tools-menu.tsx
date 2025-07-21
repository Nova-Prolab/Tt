
"use client"

import { useState } from "react"
import { Wand, Sparkles, PencilRuler, Tag, Trash2, CheckSquare, Search, CaseSensitive, Replace } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuGroup
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

type TextToolsMenuProps = {
  onAction: (newText: string, newHistoryEntry?: boolean) => void;
  text: string;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
}

export function TextToolsMenu({ onAction, text, textareaRef }: TextToolsMenuProps) {
  const [isMarkSfxDialogOpen, setIsMarkSfxDialogOpen] = useState(false);
  const [sfxText, setSfxText] = useState("");
  const { toast } = useToast();
  
  const [words, setWords] = useState<string[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);

  // Find & Replace state
  const [isFindReplaceOpen, setIsFindReplaceOpen] = useState(false);
  const [findValue, setFindValue] = useState("");
  const [replaceValue, setReplaceValue] = useState("");
  const [lastReplacedIndex, setLastReplacedIndex] = useState(-1);

  const handleOpenMarkSfxDialog = () => {
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
      // Group consecutive selected indices
      const groupedIndices = selectedIndices.sort((a,b) => a-b).reduce((acc, curr) => {
          if (acc.length > 0 && acc[acc.length-1][acc[acc.length-1].length -1] === curr - 1) {
              acc[acc.length-1].push(curr);
          } else {
              acc.push([curr]);
          }
          return acc;
      }, [] as number[][]);
      
      let newText = [...words];
      groupedIndices.reverse().forEach(group => {
          const firstIndex = group[0];
          const selection = group.map(i => words[i]).join('');
          const formattedSelection = `* ${selection}`;
          // Replace the group of words with the single formatted string
          newText.splice(firstIndex, group.length, formattedSelection);
      });

      onAction(newText.join(''));
      toast({
          title: "Formato Aplicado",
          description: `Se han formateado ${groupedIndices.length} onomatopeyas.`,
      });
      setIsMarkSfxDialogOpen(false);
  };
  
  const handleCleanSfx = () => {
    // This regex looks for "* " followed by any characters until a word boundary or end of line.
    const cleanedText = text.replace(/\* ([^*]+)/g, '$1');
    onAction(cleanedText);
    toast({
        title: "Formato Limpiado",
        description: "Se han eliminado todos los formatos de onomatopeya.",
    });
  }

  const handleClearText = () => {
    onAction("");
    toast({
        title: "Texto Limpiado",
        description: "Se ha borrado todo el contenido del editor.",
    });
  }

  // --- Find and Replace Logic ---

  const handleReplaceNext = () => {
    if (!findValue) return;

    const startIndex = lastReplacedIndex + 1;
    const index = text.indexOf(findValue, startIndex);

    if (index !== -1) {
      const newText = text.substring(0, index) + replaceValue + text.substring(index + findValue.length);
      onAction(newText);
      setLastReplacedIndex(index);
      toast({
        title: "Reemplazado",
        description: `Se reemplazó una instancia de "${findValue}".`
      })
    } else {
      toast({
        title: "No se encontraron más coincidencias",
        description: `No hay más "${findValue}" en el texto.`,
        variant: "destructive"
      })
      setLastReplacedIndex(-1); // Reset for next time
    }
  }

  const handleReplaceAll = () => {
     if (!findValue) return;
     const newText = text.replaceAll(findValue, replaceValue);
     if (text === newText) {
        toast({
            title: "No se encontraron coincidencias",
            description: `No se encontró "${findValue}" en el texto.`,
            variant: "destructive"
        })
     } else {
        onAction(newText);
        toast({
            title: "Todo Reemplazado",
            description: `Se reemplazaron todas las instancias de "${findValue}".`
        })
     }
     setIsFindReplaceOpen(false);
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
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => setIsFindReplaceOpen(true)}>
              <Search className="mr-2 h-4 w-4" />
              <span>Buscar y reemplazar</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuLabel>Onomatopeyas (SFX)</DropdownMenuLabel>
            <DropdownMenuItem onClick={handleOpenMarkSfxDialog} disabled={!text}>
              <CheckSquare className="mr-2 h-4 w-4" />
              <span>Marcar SFX en el texto...</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleCleanSfx} disabled={!text.includes('* ')}>
              <PencilRuler className="mr-2 h-4 w-4" />
              <span>Limpiar formato de SFX</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
           <DropdownMenuItem onClick={handleClearText} className="text-destructive focus:text-destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            <span>Limpiar todo el texto</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

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
                <Tag className="mr-2 h-4 w-4" /> Aplicar Formato a {selectedIndices.length} {selectedIndices.length === 1 ? 'Palabra' : 'Palabras'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog for Find and Replace */}
      <Dialog open={isFindReplaceOpen} onOpenChange={(isOpen) => {
        setIsFindReplaceOpen(isOpen);
        if (!isOpen) {
          setLastReplacedIndex(-1); // Reset on close
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Buscar y Reemplazar</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="find-input" className="text-right">
                Buscar
              </Label>
              <Input
                id="find-input"
                value={findValue}
                onChange={(e) => setFindValue(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="replace-input" className="text-right">
                Reemplazar con
              </Label>
              <Input
                id="replace-input"
                value={replaceValue}
                onChange={(e) => setReplaceValue(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter className="sm:justify-between">
             <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Cerrar
                </Button>
            </DialogClose>
            <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={handleReplaceNext} disabled={!findValue}>
                  Reemplazar Siguiente
                </Button>
                <Button type="submit" onClick={handleReplaceAll} disabled={!findValue}>Reemplazar Todo</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

    