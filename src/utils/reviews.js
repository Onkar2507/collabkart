import { collection, getDocs } from "firebase/firestore";

import { db } from "../firebase";

export async function getRatingsByInfluencer() {
  const reviewSnapshot = await getDocs(collection(db, "reviews"));
  const ratingTotals = new Map();

  reviewSnapshot.forEach((reviewDoc) => {
    const review = reviewDoc.data();
    const current = ratingTotals.get(review.influencerId) || {
      total: 0,
      count: 0,
    };

    ratingTotals.set(review.influencerId, {
      total: current.total + review.rating,
      count: current.count + 1,
    });
  });

  return Object.fromEntries(
    [...ratingTotals.entries()].map(([influencerId, rating]) => [
      influencerId,
      {
        average: rating.total / rating.count,
        count: rating.count,
      },
    ])
  );
}
