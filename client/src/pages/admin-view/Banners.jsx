import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import ImageUpload from "@/components/admin-view/ImageUpload";
import { addNewBanner, fetchAllBanners, deleteBanner } from "@/store/admin/banner-slice";
import { useToast } from "@/hooks/use-toast";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const initialFormData = {
  image: "",
  title: "",
  description: "",
};

const Banners = () => {
  const [openCreateBannerDialog, setOpenCreateBannerDialog] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [imageFile, setImageFile] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [imageLoadingState, setImageLoadingState] = useState(false);

  const { bannerList = [] } = useSelector((state) => state.adminBanners);
  const dispatch = useDispatch();
  const { toast } = useToast();

  const handleSubmit = (event) => {
    event.preventDefault();
    const bannerData = {
      ...formData,
      image: uploadedImageUrl,
    };

    dispatch(addNewBanner(bannerData)).then((data) => {
      if (data?.payload.success) {
        dispatch(fetchAllBanners());
        setFormData(initialFormData);
        setOpenCreateBannerDialog(false);
        setImageFile(null);
        setUploadedImageUrl("");
        toast({
          title: "Banner added successfully",
        });
      }
    });
  };

  const handleDelete = (id) => {
    dispatch(deleteBanner(id)).then((data) => {
      if (data?.payload.success) {
        dispatch(fetchAllBanners());
        toast({
          title: "Banner deleted successfully",
        });
      }
    });
  };

  useEffect(() => {
    dispatch(fetchAllBanners());
  }, [dispatch]);

  return (
    <div>
      <div className="mb-5 w-full flex justify-end">
        <Button onClick={() => setOpenCreateBannerDialog(true)}>
          Add New Banner
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {bannerList.map((banner) => (
          <div key={banner._id} className="relative group">
            <img
              src={banner.image}
              alt={banner.title}
              className="w-full h-48 object-cover rounded-lg"
            />
            <div className="absolute top-2 right-2">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(banner._id)}
              >
                Delete
              </Button>
            </div>
            <div className="p-2">
              <h3 className="font-semibold">{banner.title}</h3>
              <p className="text-sm text-gray-600">{banner.description}</p>
            </div>
          </div>
        ))}
      </div>

      <Sheet
        open={openCreateBannerDialog}
        onOpenChange={() => {
          setOpenCreateBannerDialog(false);
          setFormData(initialFormData);
          setImageFile(null);
          setUploadedImageUrl("");
        }}
      >
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>Add New Banner</SheetTitle>
          </SheetHeader>
          <ImageUpload
            imageFile={imageFile}
            setImageFile={setImageFile}
            uploadedImageUrl={uploadedImageUrl}
            setUploadedImageUrl={setUploadedImageUrl}
            setImageLoadingState={setImageLoadingState}
            imageLoadingState={imageLoadingState}
          />
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <Button type="submit" disabled={imageLoadingState}>
              Add Banner
            </Button>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Banners;

// client/src/pages/admin-view/Banners.jsx