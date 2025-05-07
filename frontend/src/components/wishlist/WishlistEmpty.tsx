import Link from "next/link";

export default function WishlistEmpty() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-8 text-center">
      <div className="h-24 w-24 mx-auto mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300 w-full h-full">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
      </div>
      <h2 className="text-xl font-medium mb-3">Your wishlist is empty</h2>
      <p className="text-gray-500 mb-8 max-w-md mx-auto">
        Items added to your wishlist will be saved here. Start exploring our collection and add your favorite items!
      </p>
      <Link
        href="/shop"
        className="inline-block px-6 py-3 bg-amber-800 text-white rounded-md hover:bg-amber-900 transition-colors"
      >
        Explore Collection
      </Link>
    </div>
  );
}
