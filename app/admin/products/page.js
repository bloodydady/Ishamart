'use client';

import { useState, useEffect } from 'react';
import { getProducts, addProduct, updateProduct, deleteProduct } from '@/lib/firestore';
import { formatPrice, CATEGORIES } from '@/lib/utils';
import LoadingSpinner from '@/components/LoadingSpinner';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiX, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProductId, setCurrentProductId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: CATEGORIES[0].id,
    imageUrl: '',
    featured: false
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    const { products: data } = await getProducts({ pageSize: 100 }); // Get a lot for admin view
    setProducts(data || []);
    setLoading(false);
  };

  const handleOpenAddModal = () => {
    setIsEditing(false);
    setCurrentProductId(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      stock: '',
      category: CATEGORIES[0].id,
      imageUrl: '',
      featured: false
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product) => {
    setIsEditing(true);
    setCurrentProductId(product.id);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      category: product.category,
      imageUrl: product.imageUrl,
      featured: product.featured || false
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    
    const { error } = await deleteProduct(id);
    if (error) {
      toast.error('Failed to delete product');
    } else {
      toast.success('Product deleted successfully');
      setProducts(products.filter(p => p.id !== id));
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Convert numeric fields
    const productData = {
      ...formData,
      price: Number(formData.price),
      stock: Number(formData.stock)
    };

    setIsSubmitting(true);
    
    if (isEditing) {
      const { error } = await updateProduct(currentProductId, productData);
      if (error) {
        toast.error('Failed to update product');
      } else {
        toast.success('Product updated successfully');
        setIsModalOpen(false);
        fetchProducts(); // Refresh list
      }
    } else {
      const { error } = await addProduct(productData);
      if (error) {
        toast.error('Failed to add product');
      } else {
        toast.success('Product added successfully');
        setIsModalOpen(false);
        fetchProducts(); // Refresh list
      }
    }
    
    setIsSubmitting(false);
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Manage Products</h1>
        <button 
          onClick={handleOpenAddModal}
          className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)] text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 shadow-sm transition-colors"
        >
          <FiPlus size={20} /> Add New Product
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search products by name or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:bg-white transition-colors text-sm"
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="py-20"><LoadingSpinner /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-100">
                  <th className="p-4 font-semibold w-16">Image</th>
                  <th className="p-4 font-semibold">Name</th>
                  <th className="p-4 font-semibold">Category</th>
                  <th className="p-4 font-semibold">Price</th>
                  <th className="p-4 font-semibold text-center">Stock</th>
                  <th className="p-4 font-semibold text-center">Featured</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-gray-500">
                      No products found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map(product => {
                    const categoryInfo = CATEGORIES.find(c => c.id === product.category);
                    return (
                      <tr key={product.id} className="hover:bg-gray-50 transition-colors group">
                        <td className="p-4">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                            {/* Using a simplified image view for admin table */}
                            <div className="w-full h-full bg-blue-50 flex items-center justify-center text-xs text-blue-300">IMG</div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="font-bold text-gray-900 line-clamp-1">{product.name}</div>
                        </td>
                        <td className="p-4">
                          <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md text-xs font-medium">
                            {categoryInfo ? categoryInfo.name : product.category}
                          </span>
                        </td>
                        <td className="p-4 font-bold text-gray-900">{formatPrice(product.price)}</td>
                        <td className="p-4 text-center">
                          <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                            product.stock > 10 ? 'bg-green-100 text-green-700' : 
                            product.stock > 0 ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {product.stock}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          {product.featured ? (
                            <span className="inline-flex text-green-500"><FiCheck size={18} /></span>
                          ) : (
                            <span className="text-gray-300">-</span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => handleOpenEditModal(product)}
                              className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded transition-colors"
                              title="Edit"
                            >
                              <FiEdit2 size={16} />
                            </button>
                            <button 
                              onClick={() => handleDelete(product.id)}
                              className="p-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded transition-colors"
                              title="Delete"
                            >
                              <FiTrash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl my-8 shadow-2xl animate-scale-in">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">
                {isEditing ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors"
              >
                <FiX size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] outline-none bg-gray-50 focus:bg-white"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                  <textarea
                    name="description"
                    required
                    rows="4"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] outline-none bg-gray-50 focus:bg-white resize-none"
                  ></textarea>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    name="price"
                    required
                    min="0"
                    step="1"
                    value={formData.price}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] outline-none bg-gray-50 focus:bg-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity *</label>
                  <input
                    type="number"
                    name="stock"
                    required
                    min="0"
                    step="1"
                    value={formData.stock}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] outline-none bg-gray-50 focus:bg-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select
                    name="category"
                    required
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] outline-none bg-gray-50 focus:bg-white cursor-pointer"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Google Drive Image URL *</label>
                  <input
                    type="url"
                    name="imageUrl"
                    required
                    value={formData.imageUrl}
                    onChange={handleChange}
                    placeholder="https://drive.google.com/file/d/..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] outline-none bg-gray-50 focus:bg-white"
                  />
                  <p className="text-xs text-gray-500 mt-1">Must be a shareable Google Drive link.</p>
                </div>

                <div className="md:col-span-2 pt-2">
                  <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <input
                      type="checkbox"
                      name="featured"
                      checked={formData.featured}
                      onChange={handleChange}
                      className="w-5 h-5 text-[var(--color-primary)] focus:ring-[var(--color-primary)] rounded"
                    />
                    <div>
                      <span className="block text-sm font-bold text-gray-900">Featured Product</span>
                      <span className="block text-xs text-gray-500">Show this product on the home page</span>
                    </div>
                  </label>
                </div>
                
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-[var(--color-primary)] text-white rounded-lg font-medium hover:bg-[var(--color-primary-light)] transition-colors disabled:opacity-70 shadow-sm"
                >
                  {isSubmitting ? 'Saving...' : (isEditing ? 'Update Product' : 'Save Product')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
