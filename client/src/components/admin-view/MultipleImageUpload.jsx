import { useState, useRef, useEffect } from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { FileIcon, UploadCloudIcon, XIcon } from "lucide-react";
import { Button } from "../ui/button";
import axios from "axios";
import { Skeleton } from "../ui/skeleton";
import API_BASE_URL from '@/config/api';

const MultipleImageUpload = ({
  imageFiles,
  setImageFiles,
  uploadedImageUrls,
  setUploadedImageUrls,
  isEditMode,
}) => {
  const [imageLoadingStates, setImageLoadingStates] = useState([]);
  const inputRef = useRef(null);

  function handleImageFilesChange(event) {
    const selectedFiles = Array.from(event.target.files);
    setImageFiles(prevFiles => [...prevFiles, ...selectedFiles]);
    setImageLoadingStates(prevStates => [...prevStates, ...selectedFiles.map(() => true)]);
  }

  function handleDragOver(event) {
    event.preventDefault();
  }

  function handleDrop(event) {
    event.preventDefault();
    const droppedFiles = Array.from(event.dataTransfer.files);
    setImageFiles(prevFiles => [...prevFiles, ...droppedFiles]);
    setImageLoadingStates(prevStates => [...prevStates, ...droppedFiles.map(() => true)]);
  }

  function handleRemoveImage(index) {
    setImageFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
    setUploadedImageUrls(prevUrls => prevUrls.filter((_, i) => i !== index));
    setImageLoadingStates(prevStates => prevStates.filter((_, i) => i !== index));
  }

  async function uploadImageToCloudinary(file, index) {
    const data = new FormData();
    data.append("my_files", file);  // Change "my_file" to "my_files"
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/admin/products/upload-multipleimages`,
        data
      );
      if (response?.data?.success) {
        setUploadedImageUrls(prevUrls => {
          const newUrls = [...prevUrls];
          newUrls[index] = response.data.results[0].secure_url;  // Access the first result
          return newUrls;
        });
      }
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setImageLoadingStates(prevStates => {
        const newStates = [...prevStates];
        newStates[index] = false;
        return newStates;
      });
    }
  }
  
  useEffect(() => {
    imageFiles.forEach((file, index) => {
      if (!uploadedImageUrls[index]) {
        uploadImageToCloudinary(file, index);
      }
    });
  }, [imageFiles]);

  return (
    <div className="w-full max-w-md mx-auto mt-4">
      <Label className="text-lg font-semibold mb-2 block">Upload Multiple Images</Label>
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`${isEditMode ? "opacity-60" : ""} border-2 border-dashed rounded-lg p-4`}
      >
        <Input
          id="multiple-image-upload"
          type="file"
          multiple
          className="hidden"
          ref={inputRef}
          onChange={handleImageFilesChange}
          disabled={isEditMode}
        />
        <Label
          htmlFor="multiple-image-upload"
          className={`${isEditMode ? "cursor-not-allowed" : ""} flex flex-col items-center justify-center h-32 cursor-pointer`}
        >
          <UploadCloudIcon className="w-10 h-10 text-muted-foreground mb-2" />
          <span>Drag & drop OR click to upload multiple images</span>
        </Label>
      </div>
      <div className="mt-4">
        {imageFiles.map((file, index) => (
          <div key={index} className="flex items-center justify-between mt-2">
            <div className="flex items-center">
              <FileIcon className="w-8 text-primary mr-2 h-8" />
              <p className="text-sm font-medium">{file.name}</p>
            </div>
            {imageLoadingStates[index] ? (
              <Skeleton className="h-8 w-8" />
            ) : (
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground"
                onClick={() => handleRemoveImage(index)}
              >
                <XIcon className="w-4 h-4" />
                <span className="sr-only">Remove File</span>
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MultipleImageUpload;

// This is client/src/components/admin-view/MultipleImageUpload.jsx