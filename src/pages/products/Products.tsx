import { useEffect, useState } from "react";
import { useProductStore } from "../../app/productStore";
import { Button, Modal, Form, Input, InputNumber, notification } from "antd";

interface Product {
  id: string;
  title: string;
  price: number;
}

const Products = () => {
  const { loading, products, error, fetchProducts, addProduct, updateProduct, deleteProduct } = useProductStore();
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
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

  const handleDelete = (id: string) => {
    deleteProduct(id);
    notification.success({ message: "Product deleted successfully" });
  };

  const handleSave = (values: { title: string; price: number }) => {
    if (editingProduct) {
      updateProduct(editingProduct.id, values);
      notification.success({ message: "Product updated successfully" });
    } else {
      addProduct(values);
      notification.success({ message: "Product added successfully" });
    }
    setIsModalVisible(false);
  };

  return (
    <div>
      <Button type="primary" onClick={handleAdd}>Add Product</Button>

      {loading && <h2>Loading...</h2>}
      {error && <h2>{error}</h2>}
      {products.length > 0 && (
        <div>
          {products.map((product: Product, i: number) => (
            <div key={product.id}>
              {i + 1}. {product.title} - ${product.price}
              <Button onClick={() => handleEdit(product)}>Edit</Button>
              <Button danger onClick={() => handleDelete(product.id)}>Delete</Button>
            </div>
          ))}
        </div>
      )}

      <Modal
        title={editingProduct ? "Edit Product" : "Add Product"}
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form onFinish={handleSave} initialValues={editingProduct || { title: "", price: 0 }}>
          <Form.Item name="title" label="Title" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="price" label="Price" rules={[{ required: true }]}>
            <InputNumber style={{ width: "100%" }} />
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
