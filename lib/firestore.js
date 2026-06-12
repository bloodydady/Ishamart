// lib/firestore.js
import { db } from './firebase';
import {
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';

// ==================== PRODUCTS ====================

export async function getProducts({ category, search, sortBy, pageSize = 12, lastDoc } = {}) {
  try {
    let q;
    const constraints = [];

    if (category && category !== 'all') {
      constraints.push(where('category', '==', category));
    }

    if (sortBy === 'price-asc') {
      constraints.push(orderBy('price', 'asc'));
    } else if (sortBy === 'price-desc') {
      constraints.push(orderBy('price', 'desc'));
    } else {
      constraints.push(orderBy('createdAt', 'desc'));
    }

    if (lastDoc) {
      constraints.push(startAfter(lastDoc));
    }

    constraints.push(limit(pageSize));
    q = query(collection(db, 'products'), ...constraints);

    const snapshot = await getDocs(q);
    let products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Client-side search filtering (Firestore doesn't support full-text search)
    if (search) {
      const searchLower = search.toLowerCase();
      products = products.filter(p =>
        p.name?.toLowerCase().includes(searchLower) ||
        p.description?.toLowerCase().includes(searchLower)
      );
    }

    const lastVisible = snapshot.docs[snapshot.docs.length - 1];
    return { products, lastVisible, error: null };
  } catch (error) {
    console.error('Error fetching products:', error);
    return { products: [], lastVisible: null, error: error.message };
  }
}

export async function getFeaturedProducts(count = 8) {
  try {
    const q = query(
      collection(db, 'products'),
      where('featured', '==', true),
      orderBy('createdAt', 'desc'),
      limit(count)
    );
    const snapshot = await getDocs(q);
    const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return { products, error: null };
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return { products: [], error: error.message };
  }
}

export async function getProductById(productId) {
  try {
    const docRef = doc(db, 'products', productId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { product: { id: docSnap.id, ...docSnap.data() }, error: null };
    }
    return { product: null, error: 'Product not found' };
  } catch (error) {
    return { product: null, error: error.message };
  }
}

export async function addProduct(productData) {
  try {
    const docRef = await addDoc(collection(db, 'products'), {
      ...productData,
      price: Number(productData.price),
      stock: Number(productData.stock),
      featured: productData.featured || false,
      createdAt: serverTimestamp(),
    });
    return { id: docRef.id, error: null };
  } catch (error) {
    return { id: null, error: error.message };
  }
}

export async function updateProduct(productId, productData) {
  try {
    await updateDoc(doc(db, 'products', productId), {
      ...productData,
      price: Number(productData.price),
      stock: Number(productData.stock),
      updatedAt: serverTimestamp(),
    });
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
}

export async function deleteProduct(productId) {
  try {
    await deleteDoc(doc(db, 'products', productId));
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
}

export async function getAllProducts() {
  try {
    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return { products, error: null };
  } catch (error) {
    return { products: [], error: error.message };
  }
}

// ==================== ORDERS ====================

export async function createOrder(orderData) {
  try {
    const docRef = await addDoc(collection(db, 'orders'), {
      ...orderData,
      status: 'pending',
      createdAt: serverTimestamp(),
    });
    return { id: docRef.id, error: null };
  } catch (error) {
    return { id: null, error: error.message };
  }
}

export async function getUserOrders(userId) {
  try {
    const q = query(
      collection(db, 'orders'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return { orders, error: null };
  } catch (error) {
    return { orders: [], error: error.message };
  }
}

export async function getAllOrders(statusFilter) {
  try {
    const constraints = [];
    if (statusFilter && statusFilter !== 'all') {
      constraints.push(where('status', '==', statusFilter));
    }
    constraints.push(orderBy('createdAt', 'desc'));

    const q = query(collection(db, 'orders'), ...constraints);
    const snapshot = await getDocs(q);
    const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return { orders, error: null };
  } catch (error) {
    return { orders: [], error: error.message };
  }
}

export async function updateOrderStatus(orderId, status) {
  try {
    await updateDoc(doc(db, 'orders', orderId), {
      status,
      updatedAt: serverTimestamp(),
    });
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
}

export async function getRecentOrders(count = 10) {
  try {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(count));
    const snapshot = await getDocs(q);
    const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return { orders, error: null };
  } catch (error) {
    return { orders: [], error: error.message };
  }
}

// ==================== USERS ====================

export async function getUserProfile(userId) {
  try {
    const docSnap = await getDoc(doc(db, 'users', userId));
    if (docSnap.exists()) {
      return { profile: { id: docSnap.id, ...docSnap.data() }, error: null };
    }
    return { profile: null, error: 'User not found' };
  } catch (error) {
    return { profile: null, error: error.message };
  }
}

export async function updateUserProfile(userId, data) {
  try {
    await updateDoc(doc(db, 'users', userId), {
      ...data,
      updatedAt: serverTimestamp(),
    });
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
}

export async function getAllUsers() {
  try {
    const snapshot = await getDocs(collection(db, 'users'));
    const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    // Sort client-side instead of requiring a Firestore index
    users.sort((a, b) => {
      const dateA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
      const dateB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
      return dateB - dateA;
    });
    return { users, error: null };
  } catch (error) {
    console.error('getAllUsers error:', error);
    return { users: [], error: error.message };
  }
}

export async function toggleBlockUser(userId, blocked) {
  try {
    await updateDoc(doc(db, 'users', userId), { blocked });
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
}

export async function updateUserRole(userId, role) {
  try {
    await updateDoc(doc(db, 'users', userId), { role });
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
}

export async function deleteUser(userId) {
  try {
    await deleteDoc(doc(db, 'users', userId));
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
}

// ==================== REVIEWS ====================

export async function getProductReviews(productId) {
  try {
    const q = query(
      collection(db, 'reviews'),
      where('productId', '==', productId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    const reviews = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return { reviews, error: null };
  } catch (error) {
    return { reviews: [], error: error.message };
  }
}

export async function addReview(reviewData) {
  try {
    const docRef = await addDoc(collection(db, 'reviews'), {
      ...reviewData,
      createdAt: serverTimestamp(),
    });
    return { id: docRef.id, error: null };
  } catch (error) {
    return { id: null, error: error.message };
  }
}

export async function deleteReview(reviewId) {
  try {
    await deleteDoc(doc(db, 'reviews', reviewId));
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
}

// ==================== CART ====================

export async function getUserCart(userId) {
  try {
    const docSnap = await getDoc(doc(db, 'carts', userId));
    if (docSnap.exists()) {
      return { cart: docSnap.data().items || [], error: null };
    }
    return { cart: [], error: null };
  } catch (error) {
    return { cart: [], error: error.message };
  }
}

export async function saveUserCart(userId, items) {
  try {
    await setDoc(doc(db, 'carts', userId), {
      items,
      updatedAt: serverTimestamp(),
    });
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
}

// ==================== PATHOLOGY ====================

export async function getPathologyPackages() {
  try {
    const q = query(collection(db, 'pathologyPackages'), orderBy('name', 'asc'));
    const snapshot = await getDocs(q);
    const packages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return { packages, error: null };
  } catch (error) {
    return { packages: [], error: error.message };
  }
}

export async function addPathologyPackage(data) {
  try {
    const docRef = await addDoc(collection(db, 'pathologyPackages'), {
      ...data,
      price: Number(data.price),
      createdAt: serverTimestamp(),
    });
    return { id: docRef.id, error: null };
  } catch (error) {
    return { id: null, error: error.message };
  }
}

export async function updatePathologyPackage(packageId, data) {
  try {
    await updateDoc(doc(db, 'pathologyPackages', packageId), {
      ...data,
      price: Number(data.price),
    });
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
}

export async function deletePathologyPackage(packageId) {
  try {
    await deleteDoc(doc(db, 'pathologyPackages', packageId));
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
}

export async function createPathologyAppointment(data) {
  try {
    const docRef = await addDoc(collection(db, 'pathologyAppointments'), {
      ...data,
      done: false,
      createdAt: serverTimestamp(),
    });
    return { id: docRef.id, error: null };
  } catch (error) {
    return { id: null, error: error.message };
  }
}

export async function getPathologyAppointments() {
  try {
    const q = query(collection(db, 'pathologyAppointments'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    const appointments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return { appointments, error: null };
  } catch (error) {
    return { appointments: [], error: error.message };
  }
}

export async function updateAppointmentStatus(appointmentId, done) {
  try {
    await updateDoc(doc(db, 'pathologyAppointments', appointmentId), { done });
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
}

export async function updatePathologyAppointmentStatus(appointmentId, status) {
  try {
    await updateDoc(doc(db, 'pathologyAppointments', appointmentId), { status });
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
}

export async function deleteAppointment(appointmentId) {
  try {
    await deleteDoc(doc(db, 'pathologyAppointments', appointmentId));
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
}

// ==================== ALL ROUNDER ====================

export async function createAllRounderEnquiry(data) {
  try {
    const docRef = await addDoc(collection(db, 'allrounderEnquiries'), {
      ...data,
      createdAt: serverTimestamp(),
    });
    return { id: docRef.id, error: null };
  } catch (error) {
    return { id: null, error: error.message };
  }
}

export async function getAllRounderEnquiries() {
  try {
    const q = query(collection(db, 'allrounderEnquiries'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    const enquiries = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return { enquiries, error: null };
  } catch (error) {
    return { enquiries: [], error: error.message };
  }
}

export async function updateAllRounderEnquiryStatus(enquiryId, status) {
  try {
    await updateDoc(doc(db, 'allrounderEnquiries', enquiryId), { status });
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
}

export async function deleteEnquiry(enquiryId) {
  try {
    await deleteDoc(doc(db, 'allrounderEnquiries', enquiryId));
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
}

// ==================== SETTINGS ====================

export async function getSettings(settingId) {
  try {
    const docSnap = await getDoc(doc(db, 'settings', settingId));
    if (docSnap.exists()) {
      return { settings: docSnap.data(), error: null };
    }
    return { settings: null, error: null };
  } catch (error) {
    return { settings: null, error: error.message };
  }
}

export async function updateSettings(settingId, data) {
  try {
    await setDoc(doc(db, 'settings', settingId), {
      ...data,
      updatedAt: serverTimestamp(),
    }, { merge: true });
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
}

// ==================== STATS (Admin Dashboard) ====================

export async function getDashboardStats() {
  try {
    const [usersSnap, productsSnap, ordersSnap] = await Promise.all([
      getDocs(collection(db, 'users')),
      getDocs(collection(db, 'products')),
      getDocs(collection(db, 'orders')),
    ]);

    const orders = ordersSnap.docs.map(doc => doc.data());
    const totalRevenue = orders
      .filter(o => o.status === 'delivered')
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    return {
      stats: {
        totalUsers: usersSnap.size,
        totalProducts: productsSnap.size,
        totalOrders: ordersSnap.size,
        pendingOrders: orders.filter(o => o.status === 'pending').length,
        deliveredOrders: orders.filter(o => o.status === 'delivered').length,
        totalRevenue,
        ordersByStatus: {
          pending: orders.filter(o => o.status === 'pending').length,
          confirmed: orders.filter(o => o.status === 'confirmed').length,
          shipped: orders.filter(o => o.status === 'shipped').length,
          delivered: orders.filter(o => o.status === 'delivered').length,
          cancelled: orders.filter(o => o.status === 'cancelled').length,
        },
      },
      error: null,
    };
  } catch (error) {
    return { stats: null, error: error.message };
  }
}
