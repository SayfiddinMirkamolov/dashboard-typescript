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
  filteredUsers: User[];
  error: string;
  searchQuery: string;
  sortField: keyof User | null;
  sortOrder: "asc" | "desc" | null;
  fetchUsers: () => Promise<void>;
  addUser: (user: Omit<User, "id">) => Promise<void>;
  updateUser: (id: number, updatedUser: Partial<User>) => Promise<void>;
  deleteUser: (id: number) => Promise<void>;
  setSearchQuery: (query: string) => void;
  setSort: (field: keyof User) => void;
  filterUsers: () => void;
}

export const useUserStore = create<UserStore>((set, get) => ({
  loading: false,
  users: [],
  filteredUsers: [],
  error: "",
  searchQuery: "",
  sortField: null,
  sortOrder: null,

  fetchUsers: async () => {
    set({ loading: true });
    try {
      const res = await axios.get<User[]>("http://localhost:3000/users");
      set({ users: res.data, filteredUsers: res.data, loading: false, error: "" });
    } catch (err) {
      if (err instanceof Error) {
        set({ users: [], filteredUsers: [], loading: false, error: err.message });
      } else {
        set({ users: [], filteredUsers: [], loading: false, error: "Unknown error occurred" });
      }
    }
  },

  addUser: async (user: Omit<User, "id">) => {
    try {
      const res = await axios.post<User>("http://localhost:3000/users", user);
      set((state) => {
        const newUsers = [...state.users, res.data];
        return { users: newUsers, filteredUsers: newUsers };
      });
      notification.success({ message: "User added successfully" });
    } catch (err) {
      if (err instanceof Error) {
        notification.error({ message: `Failed to add user: ${err.message}` });
      } else {
        notification.error({ message: "Failed to add user: Unknown error" });
      }
    }
  },

  updateUser: async (id: number, updatedUser: Partial<User>) => {
    try {
      await axios.put(`http://localhost:3000/users/${id}`, updatedUser);
      set((state) => {
        const updatedUsers = state.users.map((user) =>
          user.id === id ? { ...user, ...updatedUser } : user
        );
        return { users: updatedUsers, filteredUsers: updatedUsers };
      });
      notification.success({ message: "User updated successfully" });
    } catch (err) {
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
      set((state) => {
        const remainingUsers = state.users.filter((user) => user.id !== id);
        return { users: remainingUsers, filteredUsers: remainingUsers };
      });
      notification.success({ message: "User deleted successfully" });
    } catch (err) {
      if (err instanceof Error) {
        notification.error({ message: `Failed to delete user: ${err.message}` });
      } else {
        notification.error({ message: "Failed to delete user: Unknown error" });
      }
    }
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
    get().filterUsers();
  },

  setSort: (field: keyof User) => {
    const { sortField, sortOrder } = get();
    let newSortOrder: "asc" | "desc" | null = "asc";

    if (sortField === field) {
      newSortOrder = sortOrder === "asc" ? "desc" : "asc";
    }

    set({ sortField: field, sortOrder: newSortOrder });
    get().filterUsers();
  },

  filterUsers: () => {
    const { users, searchQuery, sortField, sortOrder } = get();

    let filtered = users.filter((user) =>
      user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (sortField) {
      filtered = filtered.sort((a, b) => {
        if (a[sortField] < b[sortField]) return sortOrder === "asc" ? -1 : 1;
        if (a[sortField] > b[sortField]) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
    }

    set({ filteredUsers: filtered });
  },
}));
