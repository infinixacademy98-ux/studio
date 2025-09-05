export interface Review {
  id: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Contact {
  phone: string;
  email: string;
  website: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
  lat?: number;
  lng?: number;
}

export interface Business {
  id: string;
  name: string;
  category: string;
  description: string;
  contact: Contact;
  address: Address;
  images: string[];
  reviews: Review[];
}
