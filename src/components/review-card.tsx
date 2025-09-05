import type { Review } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import StarRating from "./star-rating";

interface ReviewCardProps {
  review: Review;
}

function getInitials(name: string) {
    const names = name.split(' ');
    if (names.length > 1) {
        return `${names[0][0]}${names[names.length - 1][0]}`;
    }
    return name.substring(0, 2);
}

export default function ReviewCard({ review }: ReviewCardProps) {
  const formattedDate = new Date(review.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex items-start space-x-4">
      <Avatar>
        <AvatarImage src={`https://api.dicebear.com/8.x/initials/svg?seed=${review.author}`} alt={review.author} />
        <AvatarFallback>{getInitials(review.author)}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-center justify-between">
            <div>
                 <p className="font-semibold">{review.author}</p>
                 <p className="text-xs text-muted-foreground">{formattedDate}</p>
            </div>
            <StarRating rating={review.rating} />
        </div>
        <p className="mt-2 text-muted-foreground">{review.comment}</p>
      </div>
    </div>
  );
}
