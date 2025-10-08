import { Button } from "@/components/ui/button";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchBanners } from "@/store/shop/banner-slice";

const BannerSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { banners } = useSelector((state) => state.shopBanners);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchBanners());
  }, [dispatch]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % banners.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [banners.length]);

  const handleDotClick = (index) => {
    setCurrentSlide(index);
  };

  if (!banners || banners.length === 0) {
    return null;
  }

  return (
    <div className="relative w-full h-[600px] overflow-hidden">
      {banners.map((banner, idx) => (
        <div
          key={banner._id}
          className={`absolute top-0 left-0 w-full h-full ${
            idx === currentSlide ? "opacity-100" : "opacity-0"
          } transition-opacity duration-1000`}
        >
          <img
            src={banner.image}  // Changed from imageUrl to image
            alt={banner.title || `Banner ${idx + 1}`}
            className="w-full h-full object-cover"
          />
          {banner.title && (
            <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-4">
              <h2 className="text-2xl font-bold">{banner.title}</h2>
              {banner.description && <p className="mt-2">{banner.description}</p>}
            </div>
          )}
        </div>
      ))}

      <Button
        variant="outline"
        size="icon"
        onClick={() =>
          setCurrentSlide(
            (prevSlide) => (prevSlide - 1 + banners.length) % banners.length
          )
        }
        className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-white/80 hover:bg-white"
      >
        <ChevronLeftIcon className="w-4 h-4" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        onClick={() =>
          setCurrentSlide((prevSlide) => (prevSlide + 1) % banners.length)
        }
        className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-white/80 hover:bg-white"
      >
        <ChevronRightIcon className="w-4 h-4" />
      </Button>

      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {banners.map((_, idx) => (
          <button
            key={idx}
            onClick={() => handleDotClick(idx)}
            className={`w-2 h-2 rounded-full transition-all ${
              idx === currentSlide ? "bg-white w-4" : "bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default BannerSlider;
// This is client/src/components/shopping-view/BannerSlider.jsx