
'use client';
import { useEffect } from 'react';
import { useActionState } from 'react';
import { useRouter } from 'next/navigation';
import { login, LoginState } from '@/app/login/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { BookMarked, LogIn } from 'lucide-react';
import { cn } from '@/lib/utils';


export default function LoginPage() {
    const router = useRouter();
    const [state, formAction, isPending] = useActionState<LoginState, FormData>(login, undefined);
    const { toast } = useToast();

    useEffect(() => {
        if (state?.success) {
            router.push('/');
        }
        if (state?.error) {
            toast({
                title: 'Error de inicio de sesión',
                description: state.error,
                variant: 'destructive',
            });
        }
    }, [state, router, toast]);

    return (
        <div className="min-h-screen w-full lg:grid lg:grid-cols-2">
            <div className="relative flex items-center justify-center py-12">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-background" />
                 <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob"></div>
                <div className="absolute top-1/2 right-1/4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-1/4 left-1/2 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob animation-delay-4000"></div>
                
                <div className="relative mx-auto grid w-[380px] gap-8 p-8 border rounded-2xl bg-white/50 dark:bg-black/50 backdrop-blur-xl shadow-2xl animate-in fade-in slide-in-from-bottom-10 duration-700">
                    <div className="grid gap-4 text-center">
                         <div className="mx-auto group">
                            <BookMarked className="h-16 w-16 text-primary transition-transform duration-300 ease-in-out group-hover:rotate-[-10deg]"/>
                        </div>
                        <h1 className="text-3xl font-bold font-headline">Manhwa Scribe</h1>
                        <p className="text-balance text-muted-foreground">
                            Introduce tus credenciales para acceder a la herramienta de traducción.
                        </p>
                    </div>
                    <form action={formAction} className="grid gap-6">
                        <div className="grid gap-3">
                            <Label htmlFor="username">Usuario</Label>
                             <Input
                                id="username"
                                name="username"
                                type="text"
                                placeholder="usuario"
                                required
                                className="transition-all duration-300 focus:scale-[1.02] focus:shadow-md"
                            />
                        </div>
                        <div className="grid gap-3">
                             <Label htmlFor="password">Contraseña</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="••••••••"
                                required
                                className="transition-all duration-300 focus:scale-[1.02] focus:shadow-md"
                                onKeyDown={(e) => {
                                    if (e.key === 'Backspace') {
                                        e.currentTarget.classList.add('animate-shake');
                                        setTimeout(() => e.currentTarget.classList.remove('animate-shake'), 600);
                                    }
                                }}
                            />
                        </div>
                        <Button type="submit" className="w-full transition-all duration-300 hover:shadow-lg hover:scale-105" disabled={isPending}>
                            {isPending ? (
                                <>
                                    <LogIn className="mr-2 h-4 w-4 animate-spin" />
                                    Verificando...
                                </>
                            ) : (
                                <>
                                    <LogIn className="mr-2 h-4 w-4" />
                                    Iniciar Sesión
                                </>
                            )}
                        </Button>
                    </form>
                </div>
            </div>
             <div className="hidden bg-muted lg:flex items-center justify-center p-10">
                <img
                src="https://placehold.co/800x600.png"
                alt="Manhwa Art"
                data-ai-hint="manhwa art"
                className="h-full w-full object-cover dark:brightness-[0.7] rounded-3xl shadow-2xl"
                />
            </div>
        </div>
    );
}
