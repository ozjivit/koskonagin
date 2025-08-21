import { useEffect } from "react";
import CategoryItem from "../components/CategoryItem";
import { useProductStore } from "../stores/useProductStore";
import FeaturedProducts from "../components/FeaturedProducts";

const categories = [
  { href: "/Beauty-quality", name: "Beauty-quality", imageUrl: "/beauty.jpg" },
  { href: "/brilliant-sky", name: "brilliant-sky", imageUrl: "/brilliant.jpg" },
  { href: "/b", name: "b", imageUrl: "/b.jpg" },
  { href: "/Honest-Glow", name: "Honest-Glow", imageUrl: "/honest.jpg" },
  { href: "/Gluta-Lipo", name: "Gluta-Lipo", imageUrl: "/gluta.jpg" },
  { href: "/Fairy-Skin", name: "Fairy-Skin", imageUrl: "/fairy.jpg" },
  { href: "/You-Glow", name: "You-Glow", imageUrl: "/youglow.jpg" }, // no space
  { href: "/dr-alviim", name: "dr-alviim", imageUrl: "/dr.jpg" }, // no space
  { href: "/luxe-organix", name: "luxe-organix", imageUrl: "/luxe.jpg" }, // no space
];

const HomePage = () => {
  const { fetchFeaturedProducts, products, isLoading } = useProductStore();

  useEffect(() => {
		fetchFeaturedProducts();
	}, [fetchFeaturedProducts]);


  return (
    <div className='relative min-h-screen text-white overflow-hidden bg-gray-900'>
      <div className='relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16'>
        <h1 className='text-center text-5xl sm:text-6xl font-bold text-emerald-400 mb-4'>
          Explore Our Categories
        </h1>
        <p className='text-center text-xl text-gray-300 mb-12'>
          Toronto Beauty – Naturally You.
        </p>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
          {categories.map((category) => (
            <CategoryItem category={category} key={category.name} />
          ))}
        </div>
        {!isLoading && products.length > 0 && <FeaturedProducts featuredProducts={products} />}

      </div>
    </div>
  );
};

export default HomePage;
