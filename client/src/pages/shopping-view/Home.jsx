import { Card } from "@/components/ui/card";
import { Button } from '@/components/ui/button'
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllFilteredProducts,
  fetchProductDetails,
} from "@/store/shop/product-slice";
import ShoppingProductTile from "@/components/shopping-view/ProductTile";
import ProductDetailsDialog from "@/components/shopping-view/ProductDetailsPage";
import SearchAndFilter from "../../components/shopping-view/SearchAndFilter";
import { useNavigate } from "react-router-dom";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { useToast } from "@/hooks/use-toast";
import BannerSlider from "@/components/shopping-view/BannerSlider";

const categories = [
  {
    id: "silver",
    label: "Silver",
    image:
      "https://images.pexels.com/photos/16095157/pexels-photo-16095157/free-photo-of-close-up-of-a-black-ouroboros-ring.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  },
  {
    id: "gold",
    label: "Gold",
    image:
      "https://images.unsplash.com/photo-1705326452395-1d35e6add570?q=80&w=1480&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: "diamond",
    label: "Diamond",
    image:
      "https://images.unsplash.com/photo-1679156271420-e6c596e9c10a?q=80&w=1480&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: "customized",
    label: "Customized",
    image:
      "https://images.unsplash.com/photo-1617038220319-276d3cfab638?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
];

const recipients = [
  {
    id: "men",
    label: "Men",
    image:
      "https://plus.unsplash.com/premium_photo-1669703777435-ce0cfcde3bbf?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: "women",
    label: "Women",
    image:
      "https://images.unsplash.com/photo-1643237143064-986c761eed1c?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
];

const jewelleries = [
  {
    id: "rings",
    label: "Rings",
    image:
      "https://images.pexels.com/photos/3266703/pexels-photo-3266703.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  },
  {
    id: "necklaces",
    label: "Necklaces",
    image:
      "https://images.pexels.com/photos/29385413/pexels-photo-29385413/free-photo-of-elegant-gold-and-silver-necklace-on-white-background.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  },
  {
    id: "pendants",
    label: "Pendants",
    image:
      "https://images.pexels.com/photos/10983780/pexels-photo-10983780.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1https://images.pexels.com/photos/12026054/pexels-photo-12026054.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  },
  {
    id: "bracelets",
    label: "Bracelets",
    image:
      "https://images.pexels.com/photos/12026054/pexels-photo-12026054.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  },
  {
    id: "earrings",
    label: "Earrings",
    image:
      "https://images.pexels.com/photos/7882737/pexels-photo-7882737.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  },
  {
    id: "anklets",
    label: "Anklets",
    image:
      "https://images.pexels.com/photos/7067963/pexels-photo-7067963.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  },
];

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { productList, productDetails } = useSelector(
    (state) => state.shopProducts
  );
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [hasActiveFilters, setHasActiveFilters] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();

  function handleNavigateToListingPage(getCurrentItem, section) {
    sessionStorage.removeItem("filters");
    const currentFilter = {
      [section]: [getCurrentItem.id],
    };

    sessionStorage.setItem("filters", JSON.stringify(currentFilter));
    navigate(`/shop/listing`);
  }

  function handleGetProductDetails(getCurrentProductId) {
    console.log(getCurrentProductId);

    dispatch(fetchProductDetails(getCurrentProductId));
  }

  function handleAddtoCart(getCurrentProductId) {
    dispatch(
      addToCart({
        userId: user?.id,
        productId: getCurrentProductId,
        quantity: 1,
      })
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchCartItems(user?.id));
        toast({
          title: "Product is added to cart",
        });
      }
    });
  }

  const handleSearch = (searchTerm, priceRange, category) => {
    let filtered = [...productList];

    // Check if any filters are applied
    const filtersApplied =
      searchTerm !== "" ||
      priceRange[0] !== 0 ||
      priceRange[1] !== 1000000 ||
      category !== "all";

    setHasActiveFilters(filtersApplied);

    // Search by term
    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.productName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          product.productDescription
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    // Filter by price range
    filtered = filtered.filter(
      (product) =>
        product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    // Filter by jewelry type (FIXED)
    if (category !== "all") {
      filtered = filtered.filter(
        (product) =>
          product.jewellery &&
          product.jewellery.toLowerCase() === category.toLowerCase()
      );
    }

    setFilteredProducts(filtered);
  };

  // Add this function to handle clearing filters
  const handleClearFilters = () => {
    setFilteredProducts([]);
    setHasActiveFilters(false);
  };

  useEffect(() => {
    if (productDetails !== null) setOpenDetailsDialog(true);
  }, [productDetails]);

  useEffect(() => {
    dispatch(
      fetchAllFilteredProducts({
        filterParams: {},
        sortParams: "price-lowtohigh",
      })
    );
  }, [dispatch]);

  return (
    <div className="flex flex-col min-h-screen">
      <section className="w-full">
        <BannerSlider />
      </section>

      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">
            Shop by Recipient
          </h2>
          <div className="flex flex-col md:flex-row gap-6 justify-center">
            {recipients.map((recipient) => (
              <Card
                key={recipient.id}
                onClick={() =>
                  handleNavigateToListingPage(recipient, "recipient")
                }
                className="relative group w-full md:w-[45%] lg:w-[30%] overflow-hidden rounded-lg cursor-pointer shadow-md hover:shadow-xl transition-shadow"
              >
                <img
                  src={recipient.image}
                  alt={recipient.label}
                  className="w-full h-[300px] object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-30 group-hover:bg-opacity-50 transition-all"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-2xl font-bold group-hover:text-3xl transition-all">
                    {recipient.label}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">
            Shop by Category
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((category, idx) => (
              <Card
                key={idx}
                onClick={() =>
                  handleNavigateToListingPage(category, "category")
                }
                className="cursor-pointer hover:shadow-lg transition-shadow overflow-hidden"
              >
                <div className="relative w-full h-[200px]">
                  <img
                    src={category.image}
                    alt={category.label}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <span className="text-white text-lg font-bold">
                      {category.label}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 bg-gray-100">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">
            Shop by Jewelry
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {jewelleries.map((jewelry, idx) => (
              <Card
                key={idx}
                onClick={() =>
                  handleNavigateToListingPage(jewelry, "jewellery")
                }
                className="cursor-pointer hover:shadow-lg transition-shadow overflow-hidden"
              >
                <div className="relative w-full h-[200px]">
                  <img
                    src={jewelry.image}
                    alt={jewelry.label}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <span className="text-white text-lg font-bold">
                      {jewelry.label}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">
            Feature Products
          </h2>
          <div className="mb-8">
            <SearchAndFilter
              onFilter={handleSearch}
              onClearFilters={handleClearFilters}
            />
          </div>

          {/* Updated logic for showing products/no results */}
          {(() => {
            const productsToShow = hasActiveFilters
              ? filteredProducts
              : productList;

            // If filters are applied but no results found
            if (hasActiveFilters && filteredProducts.length === 0) {
              return (
                <div className="text-center py-16">
                  <div className="max-w-md mx-auto">
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="text-2xl font-semibold text-gray-600 mb-4">
                      No Products Found
                    </h3>
                    <p className="text-gray-500 mb-6">
                      No products match your current search criteria. Try
                      adjusting your filters or search terms.
                    </p>
                    <Button onClick={handleClearFilters} className="px-6 py-2">
                      Clear All Filters
                    </Button>
                  </div>
                </div>
              );
            }

            // If no products at all in the system
            if (productList.length === 0) {
              return (
                <div className="text-center py-16">
                  <div className="max-w-md mx-auto">
                    <div className="text-6xl mb-4">📦</div>
                    <h3 className="text-2xl font-semibold text-gray-600 mb-4">
                      No Products Available
                    </h3>
                    <p className="text-gray-500">
                      Products are currently being updated. Please check back
                      later.
                    </p>
                  </div>
                </div>
              );
            }

            // Show products
            return (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {productsToShow.map((productItem) => (
                  <ShoppingProductTile
                    key={productItem._id}
                    handleGetProductDetails={handleGetProductDetails}
                    product={productItem}
                    handleAddtoCart={handleAddtoCart}
                    cartItems={cartItems}
                  />
                ))}
              </div>
            );
          })()}
        </div>
      </section>

      <ProductDetailsDialog
        open={openDetailsDialog}
        setOpen={setOpenDetailsDialog}
        productDetails={productDetails}
      />
    </div>
  );
};

export default Home;
// client/src/pages/shopping-view/Home.jsx
