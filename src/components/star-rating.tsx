import { Star, StarHalf, StarOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  totalStars?: number;
  className?: string;
}

export default function StarRating({ rating, totalStars = 5, className }: StarRatingProps) {
  const stars = [];
  for (let i = 1; i <= totalStars; i++) {
    if (i <= rating) {
      stars.push(<Star key={i} className="text-primary fill-primary" />);
    } else if (i === Math.ceil(rating) && !Number.isInteger(rating)) {
      stars.push(<StarHalf key={i} className="text-primary fill-primary" />);
    } else {
      stars.push(<Star key={i} className="text-muted-foreground/50" />);
    }
  }

  return <div className={cn("flex items-center gap-0.5", className)}>{stars}</div>;
}
