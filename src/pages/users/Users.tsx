import { useEffect, useState } from "react";
import { useUserStore } from "../../app/userStore";
import { Button, Modal, Form, Input, notification } from "antd";

const Users = () => {
  const { loading, users, error, fetchUsers, addUser, updateUser, deleteUser } = useUserStore();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAdd = () => {
    setEditingUser(null);
    setIsModalVisible(true);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setIsModalVisible(true);
  };

  const handleDelete = (id) => {
    deleteUser(id);
    notification.success({ message: "User deleted successfully" });
  };

  const handleSave = (values) => {
    if (editingUser) {
      updateUser(editingUser.id, values);
      notification.success({ message: "User updated successfully" });
    } else {
      addUser(values);
      notification.success({ message: "User added successfully" });
    }
    setIsModalVisible(false);
  };

  return (
    <div>
      <Button type="primary" onClick={handleAdd}>Add User</Button>

      {loading && <h2>Loading...</h2>}
      {error && <h2>{error}</h2>}
      {users.length > 0 && (
        <div>
          {users.map((user, i) => (
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
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form onFinish={handleSave} initialValues={editingUser || { firstName: "", lastName: "", email: "" }}>
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
