import axios from "axios";
import { create } from "zustand";
import { notification } from "antd";

// User interfeysi
interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface UserStore {
  loading: boolean;
  users: User[];
  error: string;
  fetchUsers: () => Promise<void>;
  addUser: (user: Omit<User, "id">) => Promise<void>;
  updateUser: (id: string, updatedUser: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
}

export const useUserStore = create<UserStore>((set) => ({
  loading: false,
  users: [],
  error: "",

  fetchUsers: async () => {
    set({ loading: true });
    try {
      const res = await axios.get("http://localhost:3000/users");
      set({ users: res.data, loading: false, error: "" });
    } catch (err: any) {
      set({ users: [], loading: false, error: err.message });
    }
  },

  addUser: async (user) => {
    try {
      const res = await axios.post("http://localhost:3000/users", user);
      set((state) => ({ users: [...state.users, res.data] }));
      notification.success({ message: "User added successfully" });
    } catch (err: any) {
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
      notification.success({ message: "User updated successfully" });
    } catch (err: any) {
      notification.error({ message: "Failed to update user" });
    }
  },

  deleteUser: async (id) => {
    try {
      await axios.delete(`http://localhost:3000/users/${id}`);
      set((state) => ({
        users: state.users.filter((user) => user.id !== id),
      }));
      notification.success({ message: "User deleted successfully" });
    } catch (err: any) {
      notification.error({ message: "Failed to delete user" });
    }
  },
}));
