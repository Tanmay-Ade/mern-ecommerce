import { StarIcon } from "lucide-react";

const ReviewList = ({ reviews }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Customer Reviews</h3>
      {reviews.map((review) => (
        <div key={review._id} className="border-b pb-4">
          <div className="flex items-center space-x-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <StarIcon
                  key={star}
                  className={`w-5 h-5 ${
                    star <= review.rating 
                      ? 'text-yellow-400 fill-yellow-400' 
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-500">
              by {review.userId.userName || review.userId.email}
            </span>
          </div>
          <p className="mt-2">{review.comment}</p>
          <span className="text-sm text-gray-500">
            {formatDate(review.createdAt)}
          </span>
        </div>
      ))}
    </div>
  );
};

export default ReviewList;
// This is client/src/components/shopping-view/ReviewList.jsx