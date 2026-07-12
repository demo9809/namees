"use client";

import React from "react";

interface Category {
  id: string;
  name: string;
}

export function CategoryFilter({
  categories,
  categoryFilter,
}: {
  categories: Category[];
  categoryFilter: string;
}) {
  return (
    <div className="relative w-48">
      <select
        name="category"
        defaultValue={categoryFilter}
        onChange={(e) => e.target.form?.submit()}
        className="block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
      >
        <option value="">All Categories</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>
    </div>
  );
}
