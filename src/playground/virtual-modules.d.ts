declare module 'virtual:prototype-meta' {
  export const PROTOTYPE_META: Record<
    string,
    {
      lastModified: string;
      title?: string;
      description?: string;
    }
  >;
}
