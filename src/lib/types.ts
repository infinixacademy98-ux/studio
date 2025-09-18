
export interface Review {
  id: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Link {
  type: 'facebook' | 'whatsapp' | 'instagram' | 'youtube' | 'website' | 'googleMaps' | 'other';
  url: string;
}

export interface Contact {
  phone: string;
  email: string;
  links?: Link[];
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
  searchCategories?: string[];
  description: string;
  contact: Contact;
  address: Address;
  images: string[];
  reviews: Review[];
  status: 'pending' | 'approved' | 'rejected';
  ownerId: string;
  createdAt: any;
  timing?: string;
  referenceBy: string;
  casteAndCategory: string;
}

export interface UserDoc {
    id: string;
    name: string;
    email: string;
    phone?: string;
    role: 'user' | 'admin';
    createdAt: any;
}
