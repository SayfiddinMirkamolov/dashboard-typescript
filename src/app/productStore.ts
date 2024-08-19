import axios from "axios";
import { create } from "zustand";

export const useProductStore = create((set) => ({
  loading: false,
  products: [],
  error: "",
  
  fetchProducts: async () => {
    set({ loading: true });
    try {
      const res = await axios.get("http://localhost:3000/products");
      set({ products: res.data, loading: false, error: "" });
    } catch (err) {
      set({ products: [], loading: false, error: err.message });
    }
  },
  
  addProduct: async (product) => {
    try {
      const res = await axios.post("http://localhost:3000/products", product);
      set((state) => ({ products: [...state.products, res.data] }));
    } catch (err) {
      notification.error({ message: "Failed to add product" });
    }
  },
  
  updateProduct: async (id, updatedProduct) => {
    try {
      await axios.put(`http://localhost:3000/products/${id}`, updatedProduct);
      set((state) => ({
        products: state.products.map((product) =>
          product.id === id ? { ...product, ...updatedProduct } : product
        ),
      }));
    } catch (err) {
      notification.error({ message: "Failed to update product" });
    }
  },
  
  deleteProduct: async (id) => {
    try {
      await axios.delete(`http://localhost:3000/products/${id}`);
      set((state) => ({
        products: state.products.filter((product) => product.id !== id),
      }));
    } catch (err) {
      notification.error({ message: "Failed to delete product" });
    }
  },
}));
