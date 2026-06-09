import { getAllProducts } from '@/lib/firestore';

export default async function sitemap() {
  const baseUrl = 'https://ishamart.vercel.app';
  
  // Core static routes
  const routes = ['', '/shop', '/pathology', '/allrounder'].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'daily',
    priority: route === '' ? 1 : 0.8,
  }));

  // Fetch all products to create dynamic URLs
  const { products } = await getAllProducts();
  
  const productRoutes = (products || []).map((product) => {
    // Firebase timestamps need to be converted to JS Date objects
    let lastMod = new Date();
    if (product.updatedAt && product.updatedAt.toMillis) {
      lastMod = new Date(product.updatedAt.toMillis());
    } else if (product.createdAt && product.createdAt.toMillis) {
      lastMod = new Date(product.createdAt.toMillis());
    }

    return {
      url: `${baseUrl}/product/${product.id}`,
      lastModified: lastMod.toISOString(),
      changeFrequency: 'weekly',
      priority: 0.6,
    };
  });

  return [...routes, ...productRoutes];
}
