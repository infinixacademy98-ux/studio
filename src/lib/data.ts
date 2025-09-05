import type { Business } from "./types";

export const categories: string[] = [
  "Restaurant",
  "Cafe",
  "Electronics",
  "Book Store",
  "Clothing",
  "Hotel",
  "General Store",
];

export const cities: string[] = ["Bengaluru", "Mysuru", "Mangaluru", "Hubballi"];

export const businessListings: Business[] = [
  {
    id: "1",
    name: "Vidyarthi Bhavan",
    category: "Restaurant",
    description:
      "A legendary establishment in Bengaluru, serving authentic South Indian breakfast since 1943. Famous for its crispy Masala Dosa and filter coffee.",
    contact: {
      phone: "+91 80 2667 7588",
      email: "contact@vidyarthibhavan.in",
      website: "https://vidyarthibhavan.in",
    },
    address: {
      street: "32, Gandhi Bazaar Main Rd, Gandhi Bazaar, Basavanagudi",
      city: "Bengaluru",
      state: "Karnataka",
      zip: "560004",
      lat: 12.9439,
      lng: 77.5714,
    },
    images: [
      "https://picsum.photos/600/400",
      "https://picsum.photos/600/401",
      "https://picsum.photos/600/402",
    ],
    reviews: [
      {
        id: "r1",
        author: "Ananya Rao",
        rating: 5,
        comment: "Best dosa in town! The crispiness is unmatched.",
        date: "2024-07-15",
      },
      {
        id: "r2",
        author: "Rohan Kumar",
        rating: 4,
        comment: "Classic old-world charm. Can be crowded but worth the wait.",
        date: "2024-07-10",
      },
    ],
  },
  {
    id: "2",
    name: "Blossom Book House",
    category: "Book Store",
    description:
      "One of the largest second-hand bookstores in India, located in the heart of Bengaluru. A paradise for book lovers with a massive collection across genres.",
    contact: {
      phone: "+91 80 2558 7333",
      email: "info@blossombookhouse.com",
      website: "https://blossombookhouse.com",
    },
    address: {
      street: "84, 6, Church St, Haridevpur, Shanthala Nagar, Ashok Nagar",
      city: "Bengaluru",
      state: "Karnataka",
      zip: "560001",
      lat: 12.9734,
      lng: 77.6074,
    },
    images: [
      "https://picsum.photos/601/400",
      "https://picsum.photos/601/401",
    ],
    reviews: [
      {
        id: "r3",
        author: "Priya Singh",
        rating: 5,
        comment:
          "I could spend a whole day here. The collection is incredible!",
        date: "2024-06-20",
      },
    ],
  },
  {
    id: "3",
    name: "The Royal Mysore Hotel",
    category: "Hotel",
    description:
      "Experience the heritage of Mysuru with a stay at our luxurious hotel. Combining modern amenities with traditional Mysuru architecture and hospitality.",
    contact: {
      phone: "+91 821 242 4242",
      email: "reservations@royalmysore.com",
      website: "https://royalmysore.com",
    },
    address: {
      street: "123 Palace Road, Nazarbad",
      city: "Mysuru",
      state: "Karnataka",
      zip: "570010",
      lat: 12.3051,
      lng: 76.6552,
    },
    images: [
      "https://picsum.photos/602/400",
      "https://picsum.photos/602/401",
    ],
    reviews: [
      {
        id: "r4",
        author: "Vikram Reddy",
        rating: 5,
        comment: "Exceptional service and beautiful rooms. Felt like royalty!",
        date: "2024-07-01",
      },
      {
        id: "r5",
        author: "Sunita Patel",
        rating: 4,
        comment:
          "Great location, very close to the Mysore Palace. The food was also excellent.",
        date: "2024-06-25",
      },
    ],
  },
  {
    id: "4",
    name: "Pabba's Ice Cream Parlor",
    category: "Cafe",
    description:
      "A must-visit destination in Mangaluru for ice cream lovers. Famous for its unique creations like 'Gadbad' and 'Tiramisu'.",
    contact: {
      phone: "+91 824 244 5588",
      email: "hello@pabbas.com",
      website: "https://pabbas.com",
    },
    address: {
      street: "Lalbagh, MG Road",
      city: "Mangaluru",
      state: "Karnataka",
      zip: "575003",
      lat: 12.8865,
      lng: 74.8427,
    },
    images: [
      "https://picsum.photos/603/400",
    ],
    reviews: [
      {
        id: "r6",
        author: "Deepa Shenoy",
        rating: 5,
        comment: "Gadbad ice cream is legendary for a reason. Absolutely delicious!",
        date: "2024-07-18",
      },
    ],
  },
  {
    id: "5",
    name: "Karnataka Electronics",
    category: "Electronics",
    description:
      "Your one-stop shop for all electronic needs in Hubballi. We offer a wide range of products from leading brands with excellent customer service.",
    contact: {
      phone: "+91 836 225 5555",
      email: "sales@karnatakaelectronics.com",
      website: "https://karnatakaelectronics.com",
    },
    address: {
      street: "Coen Road",
      city: "Hubballi",
      state: "Karnataka",
      zip: "580020",
    },
    images: [
      "https://picsum.photos/604/400",
      "https://picsum.photos/604/401",
    ],
    reviews: [
      {
        id: "r7",
        author: "Arjun Desai",
        rating: 4,
        comment: "Good collection of products and helpful staff.",
        date: "2024-05-30",
      },
    ],
  },
];
