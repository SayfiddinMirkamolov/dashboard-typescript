import axios from "axios";
import { create } from "zustand";
import { notification } from "antd";

// Product interfeysi
interface Product {
  id: string;
  title: string;
  price: number;
}

interface ProductStore {
  loading: boolean;
  products: Product[];
  error: string;
  fetchProducts: () => Promise<void>;
  addProduct: (product: Omit<Product, "id">) => Promise<void>;
  updateProduct: (id: string, updatedProduct: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
}

export const useProductStore = create<ProductStore>((set) => ({
  loading: false,
  products: [],
  error: "",

  fetchProducts: async () => {
    set({ loading: true });
    try {
      const res = await axios.get<Product[]>("http://localhost:3000/products");
      set({ products: res.data, loading: false, error: "" });
    } catch (err) {
      if (err instanceof Error) {
        set({ products: [], loading: false, error: err.message });
      } else {
        set({ products: [], loading: false, error: "An unexpected error occurred" });
      }
    }
  },

  addProduct: async (product: Omit<Product, "id">) => {
    try {
      const res = await axios.post<Product>("http://localhost:3000/products", product);
      set((state) => ({ products: [...state.products, res.data] }));
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
      set((state) => ({
        products: state.products.map((product) =>
          product.id === id ? { ...product, ...updatedProduct } : product
        ),
      }));
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
      set((state) => ({
        products: state.products.filter((product) => product.id !== id),
      }));
      notification.success({ message: "Product deleted successfully" });
    } catch (err) {
      if (err instanceof Error) {
        notification.error({ message: "Failed to delete product", description: err.message });
      } else {
        notification.error({ message: "Failed to delete product", description: "An unexpected error occurred" });
      }
    }
  },
}));
