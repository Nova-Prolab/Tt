import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import MainApp from '@/components/main-app';

export default function Home() {
  const authCookie = cookies().get('auth');

  if (authCookie?.value !== 'true') {
    redirect('/login');
  }

  return <MainApp />;
}
