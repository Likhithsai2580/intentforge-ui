import { redirect } from 'next/navigation';

// /pro now redirects to / (pro is the default experience)
export default function ProRedirect({ searchParams }: { searchParams: Record<string, string> }) {
  const params = new URLSearchParams(searchParams).toString();
  redirect(params ? `/?${params}` : '/');
}
