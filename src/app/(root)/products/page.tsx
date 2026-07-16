import { redirect } from "next/navigation";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{
    sector?: string | string[];
    price?: string | string[];
    sort?: string | string[];
  }>;
}) {
  const incoming = await searchParams;
  const query = new URLSearchParams();

  for (const key of ["sector", "price", "sort"] as const) {
    const value = incoming[key];
    const first = Array.isArray(value) ? value[0] : value;
    if (first) query.set(key, first);
  }

  const search = query.toString();
  redirect(`/${search ? `?${search}` : ""}#catalogue`);
}
