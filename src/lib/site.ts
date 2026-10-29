export const SITE = {
  name: "Phatcharadanai Kanyapan",
  short: "P. Kanyapan",
  role: "Programmer & Developer",
  title: "Phatcharadanai Kanyapan, programmer and developer",
  description:
    "An exhibition of working software by Phatcharadanai Kanyapan, a Bangkok developer: systems, games and tools, each with the evidence to check it.",
  email: "phcaradanai@gmail.com",
  github: "https://github.com/phcaradanai",
  city: "Bangkok, Thailand",
} as const;

export const ROOMS = [
  { id: "studio", href: "/studio/", name: "Studio", full: "The Studio" },
  { id: "works", href: "/works/", name: "Works", full: "Project worlds" },
  { id: "agents", href: "/agents/", name: "Agents", full: "Agent command" },
  { id: "lab", href: "/lab/", name: "Lab", full: "Engineering lab" },
  { id: "gallery", href: "/gallery/", name: "Gallery", full: "Art gallery" },
  { id: "journey", href: "/journey/", name: "Journey", full: "The journey" },
] as const;
