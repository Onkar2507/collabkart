import admin from "firebase-admin";
import { readFileSync } from "fs";

const serviceAccount = JSON.parse(
  readFileSync("./serviceAccountKey.json", "utf8")
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// 20 first names
const firstNames = [
  "Aarav", "Aditi", "Arjun", "Ananya", "Rohan",
  "Riya", "Kabir", "Isha", "Rahul", "Sneha",
  "Aditya", "Priya", "Karan", "Neha", "Varun",
  "Pooja", "Siddharth", "Meera", "Dev", "Kavya",
];

// 5 last names
// 20 × 5 = 100 unique full names
const lastNames = [
  "Sharma",
  "Patil",
  "Mehta",
  "Kulkarni",
  "Verma",
];

const niches = [
  "Food",
  "Fashion",
  "Tech",
  "Fitness",
  "Travel",
  "Beauty",
  "Gaming",
  "Education",
  "Lifestyle",
  "Other",
];

const locations = [
  "Pune, Maharashtra",
  "Mumbai, Maharashtra",
  "Bengaluru, Karnataka",
  "Delhi",
  "Hyderabad, Telangana",
  "Chennai, Tamil Nadu",
  "Kolkata, West Bengal",
  "Jaipur, Rajasthan",
  "Ahmedabad, Gujarat",
  "Nagpur, Maharashtra",
];

const followerRanges = [
  "1k-10k",
  "10k-50k",
  "50k-100k",
  "100k-500k",
  "500k+",
];

const randomItem = (array) => {
  return array[Math.floor(Math.random() * array.length)];
};

const randomRate = () => {
  return Math.floor(Math.random() * 50 + 1) * 1000;
};

async function seedInfluencers() {
  const batch = db.batch();

  let count = 1;

  for (const firstName of firstNames) {
    for (const lastName of lastNames) {

      const id = `test_inf_${String(count).padStart(3, "0")}`;

      const niche = randomItem(niches);

      const ref = db
        .collection("influencerProfiles")
        .doc(id);

      batch.set(ref, {
        uid: id,

        name: `${firstName} ${lastName}`,

        niche,

        location: randomItem(locations),

        followerRange: randomItem(followerRanges),

        bio: `I create engaging ${niche.toLowerCase()} content and collaborate with brands to reach my audience.`,

        rate: randomRate(),

        isTestData: true,

        updatedAt:
          admin.firestore.FieldValue.serverTimestamp(),
      });

      count++;
    }
  }

  await batch.commit();

  console.log("Successfully added 100 unique test influencers!");
}

seedInfluencers()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  });