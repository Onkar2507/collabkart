export function getScoredInfluencers(brandData, influencers) {
  const scoredInfluencers = influencers.map((influencer) => {
    const nicheScore = influencer.niche === brandData.niche ? 35 : 0;
    const rate = Number(influencer.rate);
    const budget = Number(brandData.budget);
    let budgetScore = 0;

    if (rate <= budget * 0.5) {
      budgetScore = 25;
    } else if (rate <= budget * 0.75) {
      budgetScore = 22;
    } else if (rate <= budget) {
      budgetScore = 18;
    } else if (rate <= budget * 1.25) {
      budgetScore = 8;
    }

    const brandLocation = (brandData.location || "")
      .toLowerCase()
      .split(",")
      .map((part) => part.trim());
    const influencerLocation = (influencer.location || "")
      .toLowerCase()
      .split(",")
      .map((part) => part.trim());
    const brandCity = brandLocation[0] || "";
    const brandState = brandLocation[1] || "";
    const influencerCity = influencerLocation[0] || "";
    const influencerState = influencerLocation[1] || "";
    const locationScore =
      brandCity && influencerCity && brandCity === influencerCity
        ? 25
        : brandState && influencerState && brandState === influencerState
          ? 18
          : 5;
    const followerScores = {
      "500k+": 15,
      "100k-500k": 12,
      "50k-100k": 9,
      "10k-50k": 6,
      "1k-10k": 3,
    };
    const followerScore = followerScores[influencer.followerRange] || 0;
    const matchScore =
      nicheScore + budgetScore + locationScore + followerScore;

    return {
      ...influencer,
      matchScore,
      scoreBreakdown: {
        niche: nicheScore,
        budget: budgetScore,
        location: locationScore,
        followers: followerScore,
      },
    };
  });

  return scoredInfluencers.sort((a, b) => b.matchScore - a.matchScore);
}

export function getMatchLabel(score) {
  if (score >= 85) return "Excellent Match";
  if (score >= 70) return "Good Match";
  if (score >= 50) return "Fair Match";

  return "Low Match";
}
