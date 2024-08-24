export interface PageProps<
  P extends Record<string, unknown> = undefined,
  S extends Record<string, unknown> = undefined,
> {
  params: P;
  searchParams: S;
}
