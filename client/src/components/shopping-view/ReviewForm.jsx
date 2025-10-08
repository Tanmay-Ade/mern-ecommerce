import { useState } from 'react';
import { Button } from "../ui/button";
import { StarIcon } from "lucide-react";

const ReviewForm = ({ productId, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ rating, comment, productId });
    setRating(0);
    setComment('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon
            key={star}
            className={`w-6 h-6 cursor-pointer ${
              star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
            }`}
            onClick={() => setRating(star)}
          />
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Share your experience..."
        className="w-full p-2 border rounded-md"
        required
      />
      <Button type="submit">Submit Review</Button>
    </form>
  );
};

export default ReviewForm;
// This is client/src/components/shopping-view/ReviewForm.jsx