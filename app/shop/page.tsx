'use client';

import { useEffect, useState } from 'react';
import { getProducts } from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import type { Product } from '@/types';
import styles from './shop.module.css';

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);
  const [selectedFabric, setSelectedFabric] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  const categories = ['All', 'Silk Sarees', 'Cotton Sarees', 'Fancy Sarees', 'Blouses'];
  const fabrics = ['Silk', 'Cotton', 'Art Silk', 'Blend'];
  const colors = ['Red', 'Blue', 'Green', 'Gold', 'Maroon', 'White'];

  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      try {
        const data = await getProducts(activeCategory === 'All' ? undefined : activeCategory);
        setProducts(data);
        setPage(1);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, [activeCategory]);

  const filteredProducts = products
    .filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1])
    .filter((p) => !selectedFabric || p.fabric === selectedFabric)
    .filter((p) => !selectedColor || p.color === selectedColor)
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(0, page * ITEMS_PER_PAGE);

  const clearFilters = () => {
    setPriceRange([0, 50000]);
    setSelectedFabric('');
    setSelectedColor('');
    setSortBy('');
    setPage(1);
  };

  const hasActiveFilters = selectedFabric || selectedColor || sortBy || priceRange[1] < 50000;

  return (
    <div className={styles.shopContainer}>
      <aside className={styles.sidebar}>
        <div className={styles.filterSection}>
          <h3>Category</h3>
          <ul className={styles.categoryNav}>
            {categories.map((cat) => (
              <li
                key={cat}
                className={activeCategory === cat ? styles.active : ''}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.filterSection}>
          <h3>Price Range</h3>
          <div className={styles.priceInputs}>
            <input
              type="number"
              value={priceRange[0]}
              onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
              placeholder="Min"
              min={0}
            />
            <span>to</span>
            <input
              type="number"
              value={priceRange[1]}
              onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
              placeholder="Max"
              min={0}
            />
          </div>
        </div>

        <div className={styles.filterSection}>
          <h3>Fabric</h3>
          <div className={styles.filterOptions}>
            {fabrics.map((fabric) => (
              <label key={fabric} className={styles.filterOption}>
                <input
                  type="radio"
                  name="fabric"
                  checked={selectedFabric === fabric}
                  onChange={() => setSelectedFabric(selectedFabric === fabric ? '' : fabric)}
                />
                {fabric}
              </label>
            ))}
          </div>
        </div>

        <div className={styles.filterSection}>
          <h3>Color</h3>
          <div className={styles.filterOptions}>
            {colors.map((color) => (
              <label key={color} className={styles.filterOption}>
                <input
                  type="radio"
                  name="color"
                  checked={selectedColor === color}
                  onChange={() => setSelectedColor(selectedColor === color ? '' : color)}
                />
                {color}
              </label>
            ))}
          </div>
        </div>

        <div className={styles.filterSection}>
          <h3>Sort By</h3>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className={styles.sortSelect}>
            <option value="">Default</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name">Name: A to Z</option>
          </select>
        </div>

        {hasActiveFilters && (
          <button className={styles.clearFilters} onClick={clearFilters}>
            Clear All Filters
          </button>
        )}
      </aside>

      <main className={styles.content}>
        <div className={styles.resultsHeader}>
          <span>{filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}</span>
          {hasActiveFilters && (
            <button className={styles.mobileFilterToggle} onClick={clearFilters}>
              Clear Filters
            </button>
          )}
        </div>

        {loading ? (
          <div className={styles.loader}>Loading products...</div>
        ) : paginatedProducts.length === 0 ? (
          <div className={styles.noResults}>
            <p>No products match your filters.</p>
            <button onClick={clearFilters}>Clear All Filters</button>
          </div>
        ) : (
          <>
            <div className={styles.grid}>
              {paginatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            {page < totalPages && (
              <button className={styles.loadMore} onClick={() => setPage((p) => p + 1)}>
                Load More ({filteredProducts.length - paginatedProducts.length} remaining)
              </button>
            )}
          </>
        )}
      </main>
    </div>
  );
}
