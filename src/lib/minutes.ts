import founder from "@/assets/founder.jpg";
import creator from "@/assets/creator.jpg";
import business from "@/assets/business.jpg";
import personal from "@/assets/personal.jpg";

export const minutes = [
  { category: "Founder Minutes", label: "THE IDEA THAT STARTED IT", name: "Alex", role: "Founder, Studio North", image: founder, description: "The why behind what you build.", captions: ["It started with a question.", "What if work felt a little more human?", "So we built something different.", "A small idea. A bigger possibility."] },
  { category: "Creator Minutes", label: "MADE TO MAKE SOMETHING", name: "Jamie", role: "Photographer & creator", image: creator, description: "Your process. Your perspective.", captions: ["I see stories everywhere.", "In the light. In the little details.", "My camera is how I share them.", "This is what creating means to me."] },
  { category: "Business Minutes", label: "MORE THAN A FLOWER SHOP", name: "Sofia", role: "Owner, Bloom House", image: business, description: "A little closer to your business.", captions: ["Flowers say what words can't.", "We make room for small, beautiful moments.", "Grown with care. Given with love.", "Welcome to our little corner."] },
  { category: "Personal Minutes", label: "A MOMENT WORTH KEEPING", name: "Emma", role: "A story of starting again", image: personal, description: "The moments that make you, you.", captions: ["I took the long way home.", "And found a little more of myself.", "Some moments change everything.", "This is one I want to remember."] },
];
export const SEGMENT_DURATION = 12000;
export const CAPTION_DURATION = 3000;
export type Minute = (typeof minutes)[number];