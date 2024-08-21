import { useEffect, useState } from "react";
import { Button, Modal, Form, Input, notification } from "antd";
import { useUserStore } from "../../app/userStore";

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

const Users = () => {
  const { loading, filteredUsers, error, fetchUsers, addUser, updateUser, deleteUser, setSearchQuery, setSort, sortField, sortOrder } = useUserStore();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleAdd = () => {
    setEditingUser(null);
    setIsModalVisible(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsModalVisible(true);
  };

  const handleDelete = (id: number) => {
    deleteUser(id);
    notification.success({ message: "User deleted successfully" });
  };

  const handleSave = async (values: Omit<User, "id">) => {
    try {
      if (editingUser) {
        await updateUser(editingUser.id, values);
        notification.success({ message: "User updated successfully" });
      } else {
        await addUser(values);
        notification.success({ message: "User added successfully" });
      }
      setIsModalVisible(false);
    } catch {
      notification.error({ message: "Failed to save user" });
    }
  };

  return (
    <div>
      <Button type="primary" onClick={handleAdd}>
        Add User
      </Button>

      <Input
        placeholder="Search..."
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{ width: 200, marginBottom: 20 }}
      />

      <Button onClick={() => setSort("firstName")}>
        Sort by First Name {sortField === "firstName" && (sortOrder === "asc" ? "↑" : "↓")}
      </Button>
      <Button onClick={() => setSort("lastName")}>
        Sort by Last Name {sortField === "lastName" && (sortOrder === "asc" ? "↑" : "↓")}
      </Button>
      <Button onClick={() => setSort("email")}>
        Sort by Email {sortField === "email" && (sortOrder === "asc" ? "↑" : "↓")}
      </Button>

      {loading && <h2>Loading...</h2>}
      {error && <h2>{error}</h2>}
      {filteredUsers.length > 0 && (
        <div>
          {filteredUsers.map((user, i) => (
            <div key={user.id}>
              {i + 1}. {user.firstName} {user.lastName} - {user.email}
              <Button onClick={() => handleEdit(user)}>Edit</Button>
              <Button danger onClick={() => handleDelete(user.id)}>Delete</Button>
            </div>
          ))}
        </div>
      )}

      <Modal
        title={editingUser ? "Edit User" : "Add User"}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form
          onFinish={handleSave}
          initialValues={editingUser || { firstName: "", lastName: "", email: "" }}
        >
          <Form.Item name="firstName" label="First Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="lastName" label="Last Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Button type="primary" htmlType="submit">
            {editingUser ? "Update" : "Add"}
          </Button>
        </Form>
      </Modal>
    </div>
  );
};

export default Users;
