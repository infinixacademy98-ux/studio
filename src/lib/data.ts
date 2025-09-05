
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
    "description": "Agra, Mathura Yatra Agra Red Fort, Taj Mahal Mathura - Krishna Janmabhoomi, Bake Bihari Temple, Prem Temple, Vrindavan, Govardhan Parvat Parikrama, Barsana Radha Mahal and other places of interest Delhi - Akshardham, India Gate, Qutub Minar, Lotus Temple",
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
      "zip": "590001"
    },
    "images": [],
    "reviews": []
  },
  {
    "id": "2",
    "name": "AROH FOODS",
    "category": "Food & Beverages",
    "description": "Bookings for Ukadi Modaks are open for Ganeshotsav, hurry up. Modak of Ukdi We have Ukadi Modak available 365 days a year! Price 30/-per piece only Pre-booking required! Moreover, for special occasions, Ukadi Modaks can be made to order. Minimum quantity 6 pcs.",
    "ownerId": "mock-owner",
    "status": "approved",
    "createdAt": new Date("2023-10-27T10:00:00Z"),
    "contact": {
      "phone": "9677865151",
      "email": "",
      "website": ""
    },
    "address": {
      "street": "6th x Road, Gokul Nagar Near: Deccan hospital, Over Railway bridge",
      "city": "Belgaum",
      "state": "Karnataka",
      "zip": "590001"
    },
    "images": [],
    "reviews": []
  },
  {
    "id": "3",
    "name": "D.K. Arts & Enterprise",
    "category": "Arts & Crafts",
    "description": "All Types Of Thermocol Items, Diwali Kandil, Rangoli, Holi Colors, Christmas Stars & Trees, Marriage Feta & Seasonable Items Available",
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
      "zip": "590001"
    },
    "images": [],
    "reviews": []
  },
  {
    "id": "4",
    "name": "NOBEL Digital English Medium School",
    "category": "Education",
    "description": "ADMISSION OPEN #PLAY GROUP #NURSERY #LKG #UKG #FACILITIES #Learning Activities / Projector #Learning with Caring Atmosphere #Highly Qualified Trained Staff #Dance & Yoga #Affordable Fee Structure. #Safe and Hygienic Environment. #Joyfully Classroom #Playing Garden #No Donation #ACA #Highly Qualified",
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
      "zip": "416507"
    },
    "images": [],
    "reviews": []
  },
  {
    "id": "5",
    "name": "GRACEFUL PRE PRIMARY ENGLISH MEDIUM SCHOOL",
    "category": "Education",
    "description": "Admissions ...OPEN #OUR SCHOOL FEATURES #Safe & Hygienic Environment #Joyful Classroom #PLAY GROUP #Highly Qualified Management & Staff #High Rated & Recommended Parents. #NURSERY #Learning Activities #LKG #Learning & Caring Atmosphere #UKG #Highly Qualified Trained Staff #Dance & Yoga #Affordable",
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
      "zip": "590005"
    },
    "images": [],
    "reviews": []
  },
  {
    "id": "6",
    "name": "INNOVATIVE BUSINESS SOLUTIONS",
    "category": "Digital Marketing",
    "description": "DIGITAL MARKETING AGENCY SALES OFFICER,Discover innovative strategies to overcome challenges and gain a competitive edge for business success. Meta f G",
    "ownerId": "mock-owner",
    "status": "approved",
    "createdAt": new Date("2023-10-27T10:00:00Z"),
    "contact": {
      "phone": "8792714671",
      "email": "innovative@gmail.com",
      "website": "http://www.innovative.com"
    },
    "address": {
      "street": "Sadashiv Nagar Uras colony",
      "city": "Belgaum",
      "state": "Karnataka",
      "zip": "590010"
    },
    "images": [],
    "reviews": []
  },
  {
    "id": "7",
    "name": "SHRI BALAJI DISTRIBUTOR",
    "category": "Water Supply",
    "description": "AVAILABLE IN PACKAGED DRINKING WATER 20 Liter Cold & Normal Water are Available Here FA50000, SERVICE CMOTORS",
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
      "zip": "590001"
    },
    "images": [],
    "reviews": []
  },
  {
    "id": "8",
    "name": "INDIA TREAT nourishing excellence",
    "category": "Food Distribution",
    "description": "Distributor of Rice Supply & Export, We source, pack and supply high-quality rice to retail, wholesale and institutional 1) Delhi Basmati 2)Belgaum Basmati 3)Sona Masuri 4)Kolam 5)• Indrayani Packaging options: bulk (26kg sacks), poly-woven retail packs (5 kg,1 kg)",
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
      "zip": "590006"
    },
    "images": [],
    "reviews": []
  },
  {
    "id": "9",
    "name": "VAISHNAV CATERERS",
    "category": "Catering Services",
    "description": "We Accept all types of Indoor, Out door, Catering Graha Pravesh, Marriage, Upanayan, Birthday Parties, Reception, Kitty Parties & Corporate Events Services Pure Vegetarian. Timing: 10:00 am to 9:30 pm",
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
      "zip": "590001"
    },
    "images": [],
    "reviews": []
  },
  {
    "id": "10",
    "name": "Infinix Academy",
    "category": "Education",
    "description": "Infinix Academy is a premier institution offering a wide range of courses in software development, digital marketing, and other in-demand tech skills. We empower students to build successful careers in the tech industry.",
    "ownerId": "mock-owner",
    "status": "approved",
    "createdAt": new Date(),
    "contact": {
      "phone": "123-456-7890",
      "email": "contact@infinixacademy.in",
      "website": "https://www.infinixacademy.in/"
    },
    "address": {
      "street": "Kulkarni Galli",
      "city": "Belgaum",
      "state": "Karnataka",
      "zip": "590001"
    },
    "images": [],
    "reviews": [
        {
            "id": "rev1",
            "author": "Priya S.",
            "rating": 5,
            "comment": "Excellent courses and great instructors. Highly recommended!",
            "date": "2024-07-20T10:00:00Z"
        }
    ]
  }
];
