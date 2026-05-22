'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productSchema } from '@/lib/validations';
import { getProducts, createProduct, updateProduct, deleteProduct } from '@/lib/api';
import type { Product } from '@/types';
import type { z } from 'zod';
import ImageUpload from '@/components/ui/ImageUpload';
import styles from './products.module.css';

type ProductForm = z.infer<typeof productSchema>;

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      category: '',
      fabric: '',
      weaveType: '',
      color: '',
      occasion: '',
      blouseIncluded: false,
      weight: '',
      length: '',
      inStock: true,
      stockQuantity: 0,
      images: [],
    },
  });

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const onSubmit = async (data: ProductForm) => {
    setSubmitting(true);
    try {
      const productData = {
        name: data.name,
        description: data.description,
        category: data.category,
        price: data.price,
        sku: `${data.category.substring(0, 3).toUpperCase()}-${Date.now()}`,
        quantity: data.stockQuantity || 0,
        status: data.inStock ? 'ACTIVE' : 'INACTIVE',
        isHandloom: true,
        images: data.images || [],
      };

      if (editingId) {
        await updateProduct(editingId, productData);
      } else {
        await createProduct(productData);
      }

      reset();
      setShowForm(false);
      setEditingId(null);
      await loadProducts();
    } catch (err) {
      console.error('Failed to save product:', err);
      alert('Failed to save product. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setShowForm(true);
    setValue('name', product.name);
    setValue('description', product.description);
    setValue('price', product.price);
    setValue('category', product.category);
    setValue('fabric', product.fabric || '');
    setValue('weaveType', product.weaveType || '');
    setValue('color', product.color || '');
    setValue('occasion', product.occasion || '');
    setValue('blouseIncluded', product.blouseIncluded || false);
    setValue('weight', product.weight || '');
    setValue('length', product.length || '');
    setValue('inStock', product.inStock);
    setValue('stockQuantity', product.stockQuantity || 0);
    setValue('images', product.images || []);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(id);
        await loadProducts();
      } catch (err) {
        console.error('Failed to delete product:', err);
        alert('Failed to delete product. Please try again.');
      }
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !filterCategory || p.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(products.map((p) => p.category))];

  if (loading) {
    return <div className={styles.loading}>Loading products...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Products ({products.length})</h1>
        <button className={styles.addButton} onClick={() => { setShowForm(true); setEditingId(null); reset(); }}>
          + Add Product
        </button>
      </div>

      {showForm && (
        <div className={styles.formModal}>
          <div className={styles.formContent}>
            <h2>{editingId ? 'Edit Product' : 'Add Product'}</h2>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className={styles.formGrid}>
                <div className={styles.inputGroup}>
                  <label>Product Name</label>
                  <input {...register('name')} />
                  {errors.name && <p className={styles.fieldError}>{errors.name.message}</p>}
                </div>
                <div className={styles.inputGroup}>
                  <label>Price (₹)</label>
                  <input type="number" {...register('price', { valueAsNumber: true })} />
                  {errors.price && <p className={styles.fieldError}>{errors.price.message}</p>}
                </div>
                <div className={styles.inputGroup}>
                  <label>Category</label>
                  <select {...register('category')}>
                    <option value="">Select category</option>
                    <option value="Silk Sarees">Silk Sarees</option>
                    <option value="Cotton Sarees">Cotton Sarees</option>
                    <option value="Fancy Sarees">Fancy Sarees</option>
                    <option value="Blouses">Blouses</option>
                  </select>
                  {errors.category && <p className={styles.fieldError}>{errors.category.message}</p>}
                </div>
                <div className={styles.inputGroup}>
                  <label>Fabric</label>
                  <input {...register('fabric')} />
                </div>
                <div className={styles.inputGroup}>
                  <label>Weave Type</label>
                  <input {...register('weaveType')} />
                </div>
                <div className={styles.inputGroup}>
                  <label>Color</label>
                  <input {...register('color')} />
                </div>
                <div className={styles.inputGroup}>
                  <label>Occasion</label>
                  <input {...register('occasion')} />
                </div>
                <div className={styles.inputGroup}>
                  <label>Stock Quantity</label>
                  <input type="number" {...register('stockQuantity', { valueAsNumber: true })} />
                </div>
                <div className={styles.inputGroup}>
                  <label>Weight</label>
                  <input {...register('weight')} placeholder="e.g., 500g" />
                </div>
                <div className={styles.inputGroup}>
                  <label>Length</label>
                  <input {...register('length')} placeholder="e.g., 5.5m" />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label>Description</label>
                <textarea {...register('description')} rows={3} />
                {errors.description && <p className={styles.fieldError}>{errors.description.message}</p>}
              </div>

              <div className={styles.inputGroup}>
                <label>Product Images</label>
                <ImageUpload
                  value={watch('images') || []}
                  onChange={(urls) => setValue('images', urls)}
                  maxFiles={5}
                />
              </div>

              <div className={styles.checkboxGroup}>
                <label>
                  <input type="checkbox" {...register('blouseIncluded')} />
                  Blouse Included
                </label>
                <label>
                  <input type="checkbox" {...register('inStock')} />
                  In Stock
                </label>
              </div>

              <div className={styles.formActions}>
                <button type="button" className={styles.cancelButton} onClick={() => { setShowForm(false); setEditingId(null); }}>
                  Cancel
                </button>
                <button type="submit" className={styles.submitButton} disabled={submitting}>
                  {submitting ? 'Saving...' : (editingId ? 'Update Product' : 'Add Product')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className={styles.filters}>
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.searchInput}
        />
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className={styles.filterSelect}>
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Category</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.map((product) => (
            <tr key={product.id}>
              <td>{product.name}</td>
              <td>{product.category}</td>
              <td>₹{product.price.toLocaleString()}</td>
              <td>{product.stockQuantity || 'N/A'}</td>
              <td>
                <span className={`${styles.badge} ${product.inStock ? styles.inStock : styles.outOfStock}`}>
                  {product.inStock ? 'In Stock' : 'Out of Stock'}
                </span>
              </td>
              <td className={styles.actions}>
                <button onClick={() => handleEdit(product)} className={styles.editButton}>Edit</button>
                <button onClick={() => handleDelete(product.id)} className={styles.deleteButton}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {filteredProducts.length === 0 && (
        <p className={styles.empty}>No products found.</p>
      )}
    </div>
  );
}
