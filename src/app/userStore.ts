import axios from "axios";
import { create } from "zustand";
import { notification } from "antd";

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

interface UserStore {
  loading: boolean;
  users: User[];
  error: string;
  fetchUsers: () => Promise<void>;
  addUser: (user: User) => Promise<void>;
  updateUser: (id: number, updatedUser: User) => Promise<void>;
  deleteUser: (id: number) => Promise<void>;
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
    } catch (err: unknown) {
      if (err instanceof Error) {
        set({ users: [], loading: false, error: err.message });
      } else {
        set({ users: [], loading: false, error: "Unknown error occurred" });
      }
    }
  },

  addUser: async (user: User) => {
    try {
      const res = await axios.post("http://localhost:3000/users", user);
      set((state) => ({ users: [...state.users, res.data] }));
      notification.success({ message: "User added successfully" });
    } catch (err: unknown) {
      if (err instanceof Error) {
        notification.error({ message: `Failed to add user: ${err.message}` });
      } else {
        notification.error({ message: "Failed to add user: Unknown error" });
      }
    }
  },

  updateUser: async (id: number, updatedUser: User) => {
    try {
      await axios.put(`http://localhost:3000/users/${id}`, updatedUser);
      set((state) => ({
        users: state.users.map((user) =>
          user.id === id ? { ...user, ...updatedUser } : user
        ),
      }));
      notification.success({ message: "User updated successfully" });
    } catch (err: unknown) {
      if (err instanceof Error) {
        notification.error({ message: `Failed to update user: ${err.message}` });
      } else {
        notification.error({ message: "Failed to update user: Unknown error" });
      }
    }
  },

  deleteUser: async (id: number) => {
    try {
      await axios.delete(`http://localhost:3000/users/${id}`);
      set((state) => ({
        users: state.users.filter((user) => user.id !== id),
      }));
      notification.success({ message: "User deleted successfully" });
    } catch (err: unknown) {
      if (err instanceof Error) {
        notification.error({ message: `Failed to delete user: ${err.message}` });
      } else {
        notification.error({ message: "Failed to delete user: Unknown error" });
      }
    }
  },
}));
