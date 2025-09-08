

export interface Review {
  id: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Socials {
  facebook?: string;
  whatsapp?: string;
  instagram?: string;
  youtube?: string;
}

export interface Contact {
  phone: string;
  email: string;
  website: string;
  googleMapsUrl?: string;
  otherLink?: string;
  socials?: Socials;
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
  status: 'pending' | 'approved' | 'rejected';
  ownerId: string;
  createdAt: any;
  timing?: string;
}

export interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: any;
}

export interface UserDoc {
    id: string;
    email: string;
    role: 'user' | 'admin';
    createdAt: any;
}
