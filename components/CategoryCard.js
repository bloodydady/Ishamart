'use client';

import Link from 'next/link';

export default function CategoryCard({ category }) {
  return (
    <Link 
      href={`/shop?category=${category.id}`}
      className="category-card block relative overflow-hidden rounded-2xl aspect-square shadow-lg group"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-90 transition-opacity group-hover:opacity-100`}></div>
      <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-white">
        <span className="text-5xl mb-4 transform transition-transform group-hover:scale-110 group-hover:-translate-y-2 duration-300">
          {category.icon}
        </span>
        <h3 className="font-semibold text-lg text-center tracking-wide">
          {category.name}
        </h3>
      </div>
    </Link>
  );
}
