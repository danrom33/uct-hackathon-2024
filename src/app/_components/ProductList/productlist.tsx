// components/ProductList.js

import Product from "../Product/product";


const ProductList = ({ products, onSelect }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
    {products.map((product) => (
      <Product key={product.id} product={product} onSelect={onSelect} />
    ))}
  </div>
);

export default ProductList;
