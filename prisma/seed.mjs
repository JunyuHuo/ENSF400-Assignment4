import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const contentSeed = [
  {
    slug: "arrival",
    title: "Arrival",
    type: "Movie",
    year: 2016,
    maturityRating: "PG-13",
    genres: ["Sci-Fi", "Drama"],
    moods: ["Thoughtful", "Emotional"],
    pacing: "Moderate",
    runtime: "116 min",
    summary:
      "A linguist works with the military to communicate with mysterious visitors and discovers that language can reshape how people experience time.",
    explanationHint:
      "Balances big ideas with strong emotional payoff and rewards viewers who like reflective science fiction.",
  },
  {
    slug: "knives-out",
    title: "Knives Out",
    type: "Movie",
    year: 2019,
    maturityRating: "PG-13",
    genres: ["Mystery", "Comedy", "Drama"],
    moods: ["Witty", "Playful"],
    pacing: "Fast",
    runtime: "130 min",
    summary:
      "A detective investigates the death of a crime novelist in a family full of motives, secrets, and excellent sweaters.",
    explanationHint:
      "Great for viewers who want a fast, character-driven mystery with humor and twists.",
  },
  {
    slug: "spider-verse",
    title: "Spider-Man: Into the Spider-Verse",
    type: "Movie",
    year: 2018,
    maturityRating: "PG",
    genres: ["Animation", "Action", "Adventure"],
    moods: ["Energetic", "Hopeful"],
    pacing: "Fast",
    runtime: "117 min",
    summary:
      "Brooklyn teen Miles Morales becomes Spider-Man and joins heroes from across dimensions to stop a collapsing multiverse.",
    explanationHint:
      "A vibrant choice for users who enjoy heart, style, and high-energy storytelling.",
  },
  {
    slug: "the-bear",
    title: "The Bear",
    type: "TV Show",
    year: 2022,
    maturityRating: "TV-MA",
    genres: ["Drama", "Comedy"],
    moods: ["Intense", "Emotional"],
    pacing: "Fast",
    runtime: "30 min episodes",
    summary:
      "A fine-dining chef returns home to run his family sandwich shop while trying to heal grief and build a new kitchen culture.",
    explanationHint:
      "Ideal when someone wants pressure-cooker drama with sharp humor and a human center.",
  },
  {
    slug: "dune-part-two",
    title: "Dune: Part Two",
    type: "Movie",
    year: 2024,
    maturityRating: "PG-13",
    genres: ["Sci-Fi", "Adventure"],
    moods: ["Epic", "Serious"],
    pacing: "Moderate",
    runtime: "166 min",
    summary:
      "Paul Atreides joins the Fremen and faces a war for Arrakis while wrestling with destiny, power, and prophecy.",
    explanationHint:
      "Works well for users who like immersive worlds, spectacle, and mythic scale.",
  },
  {
    slug: "abbott-elementary",
    title: "Abbott Elementary",
    type: "TV Show",
    year: 2021,
    maturityRating: "TV-PG",
    genres: ["Comedy"],
    moods: ["Light", "Warm"],
    pacing: "Moderate",
    runtime: "22 min episodes",
    summary:
      "A mockumentary-style comedy following dedicated teachers doing their best in an underfunded Philadelphia public school.",
    explanationHint:
      "A strong fit for viewers who want comfort, humor, and a generous ensemble.",
  },
  {
    slug: "the-last-of-us",
    title: "The Last of Us",
    type: "TV Show",
    year: 2023,
    maturityRating: "TV-MA",
    genres: ["Drama", "Action", "Sci-Fi"],
    moods: ["Dark", "Emotional"],
    pacing: "Moderate",
    runtime: "55 min episodes",
    summary:
      "A hardened smuggler escorts a teenage girl across a ruined America, finding fragile hope in a brutal world.",
    explanationHint:
      "Suitable for people who like character-first survival stories with emotional weight.",
  },
  {
    slug: "paddington-2",
    title: "Paddington 2",
    type: "Movie",
    year: 2017,
    maturityRating: "PG",
    genres: ["Family", "Comedy", "Adventure"],
    moods: ["Warm", "Hopeful"],
    pacing: "Moderate",
    runtime: "104 min",
    summary:
      "Paddington searches for the perfect gift for his aunt but winds up entangled in a delightful London caper.",
    explanationHint:
      "Perfect for users seeking kindness, charm, and feel-good storytelling.",
  },
  {
    slug: "severance",
    title: "Severance",
    type: "TV Show",
    year: 2022,
    maturityRating: "TV-MA",
    genres: ["Sci-Fi", "Thriller", "Mystery"],
    moods: ["Creepy", "Thoughtful"],
    pacing: "Slow",
    runtime: "50 min episodes",
    summary:
      "Office workers undergo a procedure separating their work memories from their personal lives, exposing a chilling corporate mystery.",
    explanationHint:
      "A match for viewers who enjoy slow-burn mysteries and unsettling high-concept worlds.",
  },
  {
    slug: "past-lives",
    title: "Past Lives",
    type: "Movie",
    year: 2023,
    maturityRating: "PG-13",
    genres: ["Drama", "Romance"],
    moods: ["Tender", "Reflective"],
    pacing: "Slow",
    runtime: "106 min",
    summary:
      "Two childhood friends reconnect decades later and confront the quiet gravity of the lives they might have shared.",
    explanationHint:
      "Strong for users drawn to intimate, reflective stories about connection and identity.",
  },
  {
    slug: "arcane",
    title: "Arcane",
    type: "TV Show",
    year: 2021,
    maturityRating: "TV-14",
    genres: ["Animation", "Action", "Drama"],
    moods: ["Stylish", "Intense"],
    pacing: "Fast",
    runtime: "40 min episodes",
    summary:
      "Two sisters are pushed to opposite sides of a city divided by class, technology, and political upheaval.",
    explanationHint:
      "A strong fit for viewers who want visual flair, character drama, and kinetic storytelling.",
  },
  {
    slug: "only-murders-in-the-building",
    title: "Only Murders in the Building",
    type: "TV Show",
    year: 2021,
    maturityRating: "TV-MA",
    genres: ["Mystery", "Comedy"],
    moods: ["Witty", "Light"],
    pacing: "Moderate",
    runtime: "35 min episodes",
    summary:
      "Three true-crime fans in the same apartment building start a podcast while investigating a suspicious death.",
    explanationHint:
      "Great for viewers who want cozy mystery energy, humor, and charming leads.",
  },
];

async function main() {
  await prisma.content.createMany({
    data: contentSeed,
    skipDuplicates: true,
  });

  const adminPasswordHash = await bcrypt.hash("Admin1234", 10);

  await prisma.user.upsert({
    where: { email: "admin@cinematch.local" },
    update: {
      role: Role.ADMIN,
      passwordHash: adminPasswordHash,
      name: "CineMatch Admin",
    },
    create: {
      email: "admin@cinematch.local",
      name: "CineMatch Admin",
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
      profile: {
        create: {
          favoriteGenres: ["Drama", "Sci-Fi"],
          favoriteMoods: ["Thoughtful"],
          viewingHabits: ["Weekend binges"],
          pacingPreference: "Moderate",
          favoriteEras: ["2010s", "2020s"],
          includeGenres: [],
          excludeGenres: [],
          includeTitles: [],
          excludeTitles: [],
          onboardingCompleted: true,
          recommendationSummary:
            "Admin seed profile used for moderation demos and smoke testing.",
        },
      },
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
