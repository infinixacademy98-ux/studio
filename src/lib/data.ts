
import type { Business } from "./types";

export const categories: string[] = [
  "Restaurant",
  "Cafe",
  "Electronics",
  "Book Store",
  "Clothing",
  "Hotel",
  "General Store",
  "Education",
  "Travel & Tourism",
  "Food & Beverages",
  "Arts & Crafts",
  "Digital Marketing",
  "Water Supply",
  "Food Distribution",
  "Catering Services",
  "Other",
];

export const cities: string[] = ["Belgaum", "Gokak", "Athani", "Sankeshwar", "Bailhongal", "Shinoli (BK)", "Vadgaon"];

export const businessListings: Business[] = [
  {
    "id": "1",
    "name": "Shri Datta Digambar Yatra",
    "category": "Travel & Tourism",
    "description": "Agra, Mathura Yatra Agra Red Fort, Taj Mahal Mathura - Krishna Janmabhoomi, Bake Bihari Temple, Prem Temple, Vrindavan, Govardhan Parvat Parikrama, Barsana Radha Mahal and other places of interest Delhi - Akshardham, India Gate, Qutub Minar, Lotus Temple. Services: Religious tours, Temple visits, Pilgrimage packages",
    "ownerId": "mock-owner",
    "status": "approved",
    "createdAt": new Date("2023-10-27T10:00:00Z"),
    "contact": {
      "phone": "9591180103",
      "email": "",
      "website": ""
    },
    "address": {
      "street": "Pangul Galli",
      "city": "Belgaum",
      "state": "Karnataka",
      "zip": "590001",
    },
    "images": ["https://picsum.photos/seed/1/600/400"],
    "reviews": []
  },
  {
    "id": "2",
    "name": "AROH FOODS",
    "category": "Food & Beverages",
    "description": "Specializing in Ukadi Modaks available 365 days a year! Price 30/- per piece. Pre-booking required. Special occasion orders available. Minimum quantity 6 pieces. Services: Traditional sweets, Ukadi Modaks, Festival specials",
    "ownerId": "mock-owner",
    "status": "approved",
    "createdAt": new Date("2023-10-27T10:00:00Z"),
    "contact": {
      "phone": "9677865151",
      "email": "",
      "website": ""
    },
    "address": {
      "street": "6th Cross Road, Gokul Nagar, Near Deccan Hospital, Over Railway Bridge",
      "city": "Belgaum",
      "state": "Karnataka",
      "zip": "590001",
    },
    "images": ["https://picsum.photos/seed/2/600/400"],
    "reviews": []
  },
  {
    "id": "3",
    "name": "D.K. Arts & Enterprise",
    "category": "Arts & Crafts",
    "description": "All Types Of Thermocol Items, Diwali Kandils, Rangoli, Holi Colors, Christmas Stars & Trees, Marriage Decorations & Seasonal Items. Services: Festival decorations, Thermocol items, Party supplies",
    "ownerId": "mock-owner",
    "status": "approved",
    "createdAt": new Date("2023-10-27T10:00:00Z"),
    "contact": {
      "phone": "9945897773",
      "email": "",
      "website": ""
    },
    "address": {
      "street": "H. No. 2176, Kawale Complex, Pangul Galli",
      "city": "Belgaum",
      "state": "Karnataka",
      "zip": "590001",
    },
    "images": ["https://picsum.photos/seed/3/600/400"],
    "reviews": []
  },
  {
    "id": "4",
    "name": "NOBEL Digital English Medium School",
    "category": "Education",
    "description": "Digital English Medium School offering Play Group, Nursery, LKG, UKG with modern facilities, qualified staff, affordable fees, safe environment. Services: Pre-primary education, Digital learning, Dance & Yoga",
    "ownerId": "mock-owner",
    "status": "approved",
    "createdAt": new Date("2023-10-27T10:00:00Z"),
    "contact": {
      "phone": "8050347452",
      "email": "",
      "website": ""
    },
    "address": {
      "street": "Belgaum Vengurla Road, Opp. Aqua Alloys Foundry",
      "city": "Shinoli (BK)",
      "state": "Karnataka",
      "zip": "416507",
    },
    "images": ["https://picsum.photos/seed/4/600/400"],
    "reviews": []
  },
  {
    "id": "5",
    "name": "GRACEFUL PRE PRIMARY ENGLISH MEDIUM SCHOOL",
    "category": "Education",
    "description": "Pre-primary English Medium School with safe environment, qualified staff, learning activities, affordable fees. Services: Play Group, Nursery, LKG, UKG, Dance & Yoga",
    "ownerId": "mock-owner",
    "status": "approved",
    "createdAt": new Date("2023-10-27T10:00:00Z"),
    "contact": {
      "phone": "7019630422",
      "email": "",
      "website": ""
    },
    "address": {
      "street": "Karbar Galli, Yellur Road",
      "city": "Vadgaon",
      "state": "Karnataka",
      "zip": "590005",
    },
    "images": ["https://picsum.photos/seed/5/600/400"],
    "reviews": []
  },
  {
    "id": "6",
    "name": "INNOVATIVE BUSINESS SOLUTIONS",
    "category": "Digital Marketing",
    "description": "Digital Marketing Agency providing innovative strategies for business success and competitive edge. Services: Digital marketing, Business consulting, Sales strategies",
    "ownerId": "mock-owner",
    "status": "approved",
    "createdAt": new Date("2023-10-27T10:00:00Z"),
    "contact": {
      "phone": "8792714671",
      "email": "innovative@gmail.com",
      "website": "http://www.innovative.com"
    },
    "address": {
      "street": "Sadashiv Nagar, Uras Colony",
      "city": "Belgaum",
      "state": "Karnataka",
      "zip": "590010",
    },
    "images": ["https://picsum.photos/seed/6/600/400"],
    "reviews": []
  },
  {
    "id": "7",
    "name": "SHRI BALAJI DISTRIBUTOR",
    "category": "Water Supply",
    "description": "Packaged Drinking Water supplier - 20 Liter bottles, both cold and normal water available. Services: Packaged drinking water, Water delivery, Bulk supply",
    "ownerId": "mock-owner",
    "status": "approved",
    "createdAt": new Date("2023-10-27T10:00:00Z"),
    "contact": {
      "phone": "7892989336",
      "email": "",
      "website": ""
    },
    "address": {
      "street": "Jyoti Nagar, APMC Road",
      "city": "Belgaum",
      "state": "Karnataka",
      "zip": "590001",
    },
    "images": ["https://picsum.photos/seed/7/600/400"],
    "reviews": []
  },
  {
    "id": "8",
    "name": "INDIA TREAT NOURISHING EXCELLENCE",
    "category": "Food Distribution",
    "description": "Rice distributor and exporter supplying high-quality rice varieties including Delhi Basmati, Belgaum Basmati, Sona Masuri, Kolam, Indrayani. Services: Rice supply, Rice export, Wholesale rice distribution",
    "ownerId": "mock-owner",
    "status": "approved",
    "createdAt": new Date("2023-10-27T10:00:00Z"),
    "contact": {
      "phone": "7795240752",
      "email": "info.ybfortune@gmail.com",
      "website": ""
    },
    "address": {
      "street": "CCB 292, Bhatkhande Building, Hindunagar, Tilakwadi",
      "city": "Belgaum",
      "state": "Karnataka",
      "zip": "590006",
    },
    "images": ["https://picsum.photos/seed/8/600/400"],
    "reviews": []
  },
  {
    "id": "9",
    "name": "VAISHNAV CATERERS",
    "category": "Catering Services",
    "description": "Pure Vegetarian catering services for all occasions - Indoor, Outdoor, Marriages, Birthday parties, Corporate events. Timing: 10:00 AM to 9:30 PM. Services: Wedding catering, Event catering, Corporate catering",
    "ownerId": "mock-owner",
    "status": "approved",
    "createdAt": new Date("2023-10-27T10:00:00Z"),
    "contact": {
      "phone": "9945835537",
      "email": "",
      "website": ""
    },
    "address": {
      "street": "R.P.D. Road, Gomtesh Circle, Near Vijay Bakery, Hindwadi",
      "city": "Belgaum",
      "state": "Karnataka",
      "zip": "590001",
    },
    "images": ["https://picsum.photos/seed/9/600/400"],
    "reviews": []
  }
];
