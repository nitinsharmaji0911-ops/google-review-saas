export interface CategoryConfig {
  id: string;
  name: string;
  emoji: string;
  description: string;
  defaultServices: string[];
  positiveTopics: string[];
  issueTopics: string[];
  sampleBusinessName: string;
}

export const CATEGORIES: CategoryConfig[] = [
  {
    id: "cafe",
    name: "Café & Bakery",
    emoji: "☕",
    description: "Cafes, coffee roasters, bakeries, tearooms",
    defaultServices: ["Specialty Coffee", "Artisan Bakery", "All-Day Breakfast", "Desserts", "Cold Brews", "Sandwiches"],
    positiveTopics: ["Coffee Quality", "Fresh Bakery Items", "Friendly Baristas", "Cozy Ambience", "Fast Wi-Fi & Work Friendly", "Cleanliness", "Quick Service", "Value for Money"],
    issueTopics: ["Waiting Time", "Food Temperature", "Coffee Taste", "Seating Availability", "Noise Level", "Pricing"],
    sampleBusinessName: "The Roast & Bean Co."
  },
  {
    id: "restaurant",
    name: "Restaurant & Diner",
    emoji: "🍽️",
    description: "Fine dining, casual dining, family restaurants, bistros",
    defaultServices: ["Dine-In", "Signature Dishes", "Cocktails & Drinks", "Weekend Brunch", "Chef's Specials", "Desserts"],
    positiveTopics: ["Delicious Food", "Great Flavors", "Attentive Staff", "Warm Hospitality", "Vibrant Atmosphere", "Hygiene & Cleanliness", "Generous Portions", "Great Presentation"],
    issueTopics: ["Order Delay", "Food Quality", "Service Inattention", "Table Cleanliness", "Billing Discrepancy", "Noise"],
    sampleBusinessName: "Urban Spice Bistro"
  },
  {
    id: "snacks",
    name: "Indian Snacks, Chaat & Fast Food",
    emoji: "🥟",
    description: "Indian snacks, samosas, dosas, chole bhature, pav bhaji, chaat & sweets",
    defaultServices: [
      "Crispy Samosa & Kachori",
      "Special Chole Bhature",
      "Masala Dosa & South Indian",
      "Pav Bhaji & Vada Pav",
      "Pani Puri & Dahi Chaat",
      "Fresh Jalebi & Gulab Jamun",
      "Traditional Mithai & Sweets",
      "Kulhad Chai & Lassi"
    ],
    positiveTopics: [
      "Crispy & Piping Hot",
      "Authentic Desi Flavors",
      "Fresh Chutneys & Sambhar",
      "Spotless Hygiene & Cleanliness",
      "Fast Counter Service",
      "Generous Portion & Fillings",
      "Pure Ghee / Quality Oil",
      "Pocket-Friendly & Great Value"
    ],
    issueTopics: [
      "Food Served Cold / Soggy",
      "Too Oily / Greasy",
      "Chutney / Sambhar Quality",
      "Long Waiting Time in Rush Hours",
      "Table / Counter Cleanliness",
      "Spice Level Too High"
    ],
    sampleBusinessName: "Shree Krishna Sweets & Snacks"
  },
  {
    id: "salon",
    name: "Salon & Spa",
    emoji: "💇‍♀️",
    description: "Hair salons, beauty parlours, nail studios, spas",
    defaultServices: ["Hair Styling & Cut", "Hair Spa & Treatment", "Hair Coloring", "Facial & Skincare", "Manicure / Pedicure", "Beard Grooming"],
    positiveTopics: ["Expert Stylist", "Attention to Detail", "Relaxing Experience", "Spotless Hygiene", "Polite & Gentle Staff", "Premium Products", "Great Transformation", "Punctual Appointment"],
    issueTopics: ["Long Wait Despite Appointment", "Service Outcome", "Pricing Clarity", "Staff Attitude", "Hygiene"],
    sampleBusinessName: "Luxe & Glow Salon"
  },
  {
    id: "gym",
    name: "Gym & Fitness Club",
    emoji: "🏋️",
    description: "Fitness centers, crossfit boxes, yoga studios, personal training",
    defaultServices: ["Personal Training", "Strength Equipment", "Cardio Zone", "Group Fitness Classes", "Yoga & Pilates", "Nutrition Guidance"],
    positiveTopics: ["Modern Equipment", "Motivating Trainers", "Clean & Hygienic", "Positive Energy", "Spacious Floor", "Helpful Staff", "Great Workout Vibe", "Well Maintained"],
    issueTopics: ["Crowded Peak Hours", "Equipment Maintenance", "Locker Room Cleanliness", "Trainer Availability", "Air Conditioning"],
    sampleBusinessName: "IronPeak Fitness"
  },
  {
    id: "hotel",
    name: "Hotel & Resort",
    emoji: "🏨",
    description: "Boutique hotels, luxury resorts, homestays, bed & breakfast",
    defaultServices: ["Room Stay", "Complimentary Breakfast", "Room Service", "Swimming Pool", "Spa & Wellness", "Concierge"],
    positiveTopics: ["Spotless & Comfortable Room", "Courteous Front Desk", "Delicious Breakfast", "Scenic View", "Fast Check-in / Check-out", "Quiet & Peaceful", "Prime Location", "Top Hospitality"],
    issueTopics: ["Check-in Delay", "Room Cleanliness", "AC/Hot Water Issue", "Breakfast Variety", "Staff Response"],
    sampleBusinessName: "Serene Palms Boutique Resort"
  },
  {
    id: "dental",
    name: "Dental Clinic",
    emoji: "🦷",
    description: "Dentists, orthodontic clinics, smile care centers",
    defaultServices: ["Dental Checkup & Cleaning", "Root Canal Treatment", "Teeth Whitening", "Invisalign / Braces", "Dental Implants", "Painless Extraction"],
    positiveTopics: ["Painless Treatment", "Gentle & Caring Doctor", "Sterilized & Clean Clinic", "Clear Explanation", "Short Waiting Time", "Friendly Reception", "High-Tech Equipment", "Great Outcome"],
    issueTopics: ["Long Waiting Time", "Post-treatment Discomfort", "Pricing Transparency", "Follow-up Delay"],
    sampleBusinessName: "Apex Smile Dental Care"
  },
  {
    id: "healthcare",
    name: "Medical Clinic / Hospital",
    emoji: "🩺",
    description: "Doctors, specialized clinics, diagnostic centers, pediatricians",
    defaultServices: ["General Consultation", "Specialist Diagnosis", "Health Checkup Packages", "Diagnostic Tests", "Vaccination", "Emergency Care"],
    positiveTopics: ["Knowledgeable Doctor", "Patient & Compassionate Care", "Accurate Diagnosis", "Organized Staff", "Clean & Sanitized Clinic", "Prompt Attention", "Smooth Process"],
    issueTopics: ["Appointment Delay", "Staff Behavior", "Crowded Waiting Area", "Communication Gap"],
    sampleBusinessName: "CareFirst Health Clinic"
  },
  {
    id: "auto",
    name: "Automobile Service & Detailing",
    emoji: "🚗",
    description: "Car service centers, bike mechanics, auto detailing, tire shops",
    defaultServices: ["Periodic Maintenance", "Deep Interior Cleaning", "Ceramic Coating / PPF", "Brake & Suspension", "Wheel Alignment", "AC Service"],
    positiveTopics: ["Transparent Pricing", "Timely Delivery", "Skilled Mechanics", "Thorough Inspection", "Smooth Car Drive", "Clear Explanation of Work", "Honest Advice", "Quality Parts"],
    issueTopics: ["Delivery Delay", "Cost Higher than Estimate", "Unresolved Issue", "Cleanliness after Service"],
    sampleBusinessName: "Precision Auto Care"
  },
  {
    id: "retail",
    name: "Retail Store & Boutique",
    emoji: "🛍️",
    description: "Clothing stores, footwear, electronics, gift shops, organic markets",
    defaultServices: ["Curated Collection", "Personal Shopping Assistance", "Easy Exchange / Returns", "Custom Fitting", "Gift Wrapping"],
    positiveTopics: ["Great Variety & Collection", "Helpful & Non-Pushy Staff", "Quality Products", "Fair Prices", "Aesthetic Store Ambiance", "Smooth Billing", "Fresh Stock"],
    issueTopics: ["Limited Sizes/Stock", "Billing Queue", "Return Policy", "Staff Inattentiveness"],
    sampleBusinessName: "Velvet Bloom Boutique"
  },
  {
    id: "services",
    name: "Local Service Business",
    emoji: "🔧",
    description: "Plumbing, electricians, AC repair, home cleaning, pest control",
    defaultServices: ["On-Site Repair", "Emergency Service", "Installation", "Deep Cleaning", "Preventive Maintenance"],
    positiveTopics: ["Punctual Arrival", "Fast & Effective Fix", "Polite & Professional Technician", "Fair & Upfront Pricing", "Left Area Clean", "Reliable Workmanship"],
    issueTopics: ["Late Arrival", "Unresolved Problem", "Pricing Disagreement", "Communication"],
    sampleBusinessName: "SwiftPro Home Services"
  }
];

export function getCategoryById(id: string): CategoryConfig {
  return CATEGORIES.find(c => c.id === id) || CATEGORIES[0];
}
