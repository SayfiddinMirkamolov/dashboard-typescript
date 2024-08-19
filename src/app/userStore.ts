import axios from "axios";
import { create } from "zustand";

export const useUserStore = create((set) => ({
  loading: false,
  users: [],
  error: "",
  
  fetchUsers: async () => {
    set({ loading: true });
    try {
      const res = await axios.get("http://localhost:3000/users");
      set({ users: res.data, loading: false, error: "" });
    } catch (err) {
      set({ users: [], loading: false, error: err.message });
    }
  },
  
  addUser: async (user) => {
    try {
      const res = await axios.post("http://localhost:3000/users", user);
      set((state) => ({ users: [...state.users, res.data] }));
    } catch (err) {
      notification.error({ message: "Failed to add user" });
    }
  },
  
  updateUser: async (id, updatedUser) => {
    try {
      await axios.put(`http://localhost:3000/users/${id}`, updatedUser);
      set((state) => ({
        users: state.users.map((user) =>
          user.id === id ? { ...user, ...updatedUser } : user
        ),
      }));
    } catch (err) {
      notification.error({ message: "Failed to update user" });
    }
  },
  
  deleteUser: async (id) => {
    try {
      await axios.delete(`http://localhost:3000/users/${id}`);
      set((state) => ({
        users: state.users.filter((user) => user.id !== id),
      }));
    } catch (err) {
      notification.error({ message: "Failed to delete user" });
    }
  },
}));
