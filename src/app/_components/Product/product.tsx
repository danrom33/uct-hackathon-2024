// components/Product.js
import Image from 'next/image';

const Product = ({ product, onSelect }) => (
  <div className="border border-gray-200 p-4 rounded-lg text-center">
    <div className="relative w-full h-80 mb-4">
      <Image
        src={product.image}
        alt={product.name}
        layout="fill"
        objectFit="cover"
        className="rounded"
      />
    </div>
    <h2 className="text-xl font-semibold mb-2">{product.name}</h2>
    <p className="text-gray-600 mb-4">${product.price.toFixed(2)}</p>
    <button
      className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
      onClick={() => onSelect(product)}
    >
      Select
    </button>
  </div>
);

export default Product;
