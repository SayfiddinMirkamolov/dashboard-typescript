import { useEffect, useState } from "react";
import { Button, Modal, Form, Input, InputNumber, notification } from "antd";
import { useProductStore } from "../../app/productStore";

interface Product {
  id: string;
  title: string;
  price: number;
  description: string;
}

const Products = () => {
  const {
    loading,
    filteredProducts,
    error,
    fetchProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    setSearchQuery,
    setSort,
    sortField,
    sortOrder,
  } = useProductStore();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleAdd = () => {
    setEditingProduct(null);
    setIsModalVisible(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProduct(id);
      notification.success({ message: "Product deleted successfully" });
    } catch {
      notification.error({ message: "Failed to delete product" });
    }
  };

  const handleSave = async (values: Omit<Product, "id">) => {
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, values);
        notification.success({ message: "Product updated successfully" });
      } else {
        await addProduct(values);
        notification.success({ message: "Product added successfully" });
      }
      setIsModalVisible(false);
    } catch {
      notification.error({ message: "Failed to save product" });
    }
  };

  return (
    <div>
      <Button type="primary" onClick={handleAdd}>
        Add Product
      </Button>

      <Input
        placeholder="Search..."
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{ width: 200, marginBottom: 20 }}
      />

      <Button onClick={() => setSort("title")}>
        Sort by Title {sortField === "title" && (sortOrder === "asc" ? "↑" : "↓")}
      </Button>
      <Button onClick={() => setSort("price")}>
        Sort by Price {sortField === "price" && (sortOrder === "asc" ? "↑" : "↓")}
      </Button>

      {loading && <h2>Loading...</h2>}
      {error && <h2>{error}</h2>}
      {filteredProducts.length > 0 && (
        <div>
          {filteredProducts.map((product) => (
            <div key={product.id}>
              {product.title} - ${product.price}
              <Button onClick={() => handleEdit(product)}>Edit</Button>
              <Button danger onClick={() => handleDelete(product.id)}>Delete</Button>
            </div>
          ))}
        </div>
      )}

      <Modal
        title={editingProduct ? "Edit Product" : "Add Product"}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form
          onFinish={handleSave}
          initialValues={editingProduct || { title: "", price: 0, description: "" }}
        >
          <Form.Item name="title" label="Title" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="price" label="Price" rules={[{ required: true, type: "number", min: 0 }]}>
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea />
          </Form.Item>
          <Button type="primary" htmlType="submit">
            {editingProduct ? "Update" : "Add"}
          </Button>
        </Form>
      </Modal>
    </div>
  );
};

export default Products;
