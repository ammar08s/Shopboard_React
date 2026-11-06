export interface AdminProductDraft {
  title: string;
  category: string;
  priceCents: number;
  inStock: boolean;
}

export interface AdminProduct extends AdminProductDraft {
  id: number;
}

export interface ProductFormValues {
  title: string;
  category: string;
  price: string;
  inStock: boolean;
}

export type DraftValidation =
  { success: true; product: AdminProductDraft } | { success: false; message: string };
