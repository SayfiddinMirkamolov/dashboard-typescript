import axios from "axios";
import { create } from "zustand";
import { notification } from "antd";

// Product interfeysi
interface Product {
  id: string;
  title: string;
  price: number;
  description: string; // Agar productning descriptioni bo'lsa
}

interface ProductStore {
  loading: boolean;
  products: Product[];
  filteredProducts: Product[];
  error: string;
  searchQuery: string;
  sortField: keyof Product | null;
  sortOrder: "asc" | "desc" | null;
  fetchProducts: () => Promise<void>;
  addProduct: (product: Omit<Product, "id">) => Promise<void>;
  updateProduct: (id: string, updatedProduct: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  setSearchQuery: (query: string) => void;
  setSort: (field: keyof Product) => void;
  filterProducts: () => void;
}

export const useProductStore = create<ProductStore>((set, get) => ({
  loading: false,
  products: [],
  filteredProducts: [],
  error: "",
  searchQuery: "",
  sortField: null,
  sortOrder: null,

  fetchProducts: async () => {
    set({ loading: true });
    try {
      const res = await axios.get<Product[]>("http://localhost:3000/products");
      set({ products: res.data, filteredProducts: res.data, loading: false, error: "" });
    } catch (err) {
      if (err instanceof Error) {
        set({ products: [], filteredProducts: [], loading: false, error: err.message });
      } else {
        set({ products: [], filteredProducts: [], loading: false, error: "An unexpected error occurred" });
      }
    }
  },

  addProduct: async (product: Omit<Product, "id">) => {
    try {
      const res = await axios.post<Product>("http://localhost:3000/products", product);
      set((state) => {
        const newProducts = [...state.products, res.data];
        return { products: newProducts, filteredProducts: newProducts };
      });
      notification.success({ message: "Product added successfully" });
    } catch (err) {
      if (err instanceof Error) {
        notification.error({ message: "Failed to add product", description: err.message });
      } else {
        notification.error({ message: "Failed to add product", description: "An unexpected error occurred" });
      }
    }
  },

  updateProduct: async (id: string, updatedProduct: Partial<Product>) => {
    try {
      await axios.put(`http://localhost:3000/products/${id}`, updatedProduct);
      set((state) => {
        const updatedProducts = state.products.map((product) =>
          product.id === id ? { ...product, ...updatedProduct } : product
        );
        return { products: updatedProducts, filteredProducts: updatedProducts };
      });
      notification.success({ message: "Product updated successfully" });
    } catch (err) {
      if (err instanceof Error) {
        notification.error({ message: "Failed to update product", description: err.message });
      } else {
        notification.error({ message: "Failed to update product", description: "An unexpected error occurred" });
      }
    }
  },

  deleteProduct: async (id: string) => {
    try {
      await axios.delete(`http://localhost:3000/products/${id}`);
      set((state) => {
        const remainingProducts = state.products.filter((product) => product.id !== id);
        return { products: remainingProducts, filteredProducts: remainingProducts };
      });
      notification.success({ message: "Product deleted successfully" });
    } catch (err) {
      if (err instanceof Error) {
        notification.error({ message: "Failed to delete product", description: err.message });
      } else {
        notification.error({ message: "Failed to delete product", description: "An unexpected error occurred" });
      }
    }
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
    get().filterProducts();
  },

  setSort: (field: keyof Product) => {
    const { sortField, sortOrder } = get();
    let newSortOrder: "asc" | "desc" | null = "asc";

    if (sortField === field) {
      newSortOrder = sortOrder === "asc" ? "desc" : "asc";
    }

    set({ sortField: field, sortOrder: newSortOrder });
    get().filterProducts();
  },

  filterProducts: () => {
    const { products, searchQuery, sortField, sortOrder } = get();

    let filtered = products.filter((product) =>
      product.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (sortField) {
      filtered = filtered.sort((a, b) => {
        if (a[sortField] < b[sortField]) return sortOrder === "asc" ? -1 : 1;
        if (a[sortField] > b[sortField]) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
    }

    set({ filteredProducts: filtered });
  },
}));
