import { redirect } from 'next/navigation';
import { appConfig } from '@/lib/config/env';

export default function HomePage() {
  redirect(appConfig.defaultRedirect);
}
