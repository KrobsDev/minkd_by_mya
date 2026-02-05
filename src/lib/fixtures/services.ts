import { Service } from "@/lib/models/service";
import { ServiceCategory } from "@/lib/models/service-category";

export const serviceCategories: ServiceCategory[] = [
  { id: "lashes", title: "Lash Extensions" },
  { id: "lashRefills", title: "Lash Refills" },
  { id: "brows", title: "Brows" },
  { id: "lips", title: "Lips" },
  { id: "touchUps", title: "Touch-Ups" },
  { id: "extras", title: "Additional Services" },
];

export const services: Service[] = [
  // Lash Extensions
  {
    id: "classic-full-set",
    name: "Classic Full Set",
    description: "One extension per natural lash for a natural, elegant look.",
    features: [
      "Perfect for everyday wear",
      "Natural enhancement",
      "Customized curl and length",
      "Long-lasting results",
    ],
    paystackLink: "https://paystack.shop/pay/fbomou2wcd",
    categoryId: "lashes",
  },
  {
    id: "hybrid-full-set",
    name: "Hybrid Full Set",
    description:
      "A beautiful blend of classic and volume techniques for added dimension.",
    features: [
      "Natural with added volume",
      "Textured, wispy appearance",
      "Best of both worlds",
      "Versatile styling",
    ],
    popular: true,
    paystackLink: "https://paystack.shop/pay/fvanue9sgi",
    categoryId: "lashes",
  },
  {
    id: "volume-full-set",
    name: "Volume Full Set",
    description:
      "Multiple lightweight extensions per lash for dramatic, fluffy volume.",
    features: [
      "Fuller, dramatic look",
      "Lightweight & comfortable",
      "Perfect for special occasions",
      "Maximum impact",
    ],
    paystackLink: "https://paystack.shop/pay/k6sx7yh3hk",
    categoryId: "lashes",
  },
  {
    id: "wet-set",
    name: "Wet Set",
    description: "Wet-look lashes for a bold, statement appearance.",
    features: [
      "Bold, wet look effect",
      "Extra glossy finish",
      "Perfect for events",
      "Dramatic impact",
    ],
    paystackLink: "https://paystack.shop/pay/vyo-230nbe",
    categoryId: "lashes",
  },
  {
    id: "wispy",
    name: "Wispy",
    description: "Delicate wispy lashes for a soft, feathered appearance.",
    features: [
      "Soft feathered look",
      "Lightweight application",
      "Everyday versatile",
      "Natural depth",
    ],
    paystackLink: "https://paystack.shop/pay/r87hno4hwl",
    categoryId: "lashes",
  },
  {
    id: "bottom-lashes",
    name: "Bottom Lashes",
    description:
      "Enhance your lower lash line for a complete eye transformation.",
    features: [
      "Lower lash enhancement",
      "Completes the look",
      "Subtle elegance",
      "Added definition",
    ],
    paystackLink: "https://paystack.shop/pay/dm1zidm01j",
    categoryId: "lashes",
  },
  // Lash Refills
  {
    id: "classic-refill",
    name: "Classic Refill",
    description: "Maintain your classic lash set with a refreshing infill.",
    features: [
      "Replaces shed lashes",
      "Maintains fullness",
      "Quick appointment",
      "Cost-effective",
    ],
    paystackLink: "https://paystack.shop/pay/e4qlzmjfag",
    categoryId: "lashRefills",
  },
  {
    id: "hybrid-refill",
    name: "Hybrid Refill",
    description: "Keep your hybrid lashes looking fresh and full.",
    features: [
      "Restores volume mix",
      "Maintains blend",
      "Professional touch-up",
      "Ongoing maintenance",
    ],
    paystackLink: "https://paystack.shop/pay/hvy4liku30",
    categoryId: "lashRefills",
  },
  {
    id: "volume-refill",
    name: "Volume Refill",
    description: "Refresh your volume lashes to maintain dramatic fullness.",
    features: [
      "Restores fullness",
      "Maintains drama",
      "Quick refresh",
      "Like-new appearance",
    ],
    paystackLink: "https://paystack.shop/pay/ih2qm1msxg",
    categoryId: "lashRefills",
  },
  {
    id: "wet-set-refill",
    name: "Wet Set Refill",
    description: "Keep your wet-look lashes glossy and bold.",
    features: [
      "Maintains wet look",
      "Restores shine",
      "Bold refresh",
      "Statement maintained",
    ],
    paystackLink: "https://paystack.shop/pay/9k-ib98z5t",
    categoryId: "lashRefills",
  },
  // Brows
  {
    id: "microblading",
    name: "Microblading",
    description: "Semi-permanent eyebrows with precise hair-like strokes.",
    features: [
      "Hair-like precision",
      "Natural appearance",
      "Long-lasting (18-24 months)",
      "No daily makeup needed",
    ],
    popular: true,
    paystackLink: "https://paystack.shop/pay/ss91h3lywl",
    categoryId: "brows",
  },
  {
    id: "ombre-brows",
    name: "Ombré Brows",
    description: "Shaded brows for a fuller, more defined look.",
    features: [
      "Gradient shading effect",
      "Fuller appearance",
      "Highly pigmented",
      "Bold definition",
    ],
    paystackLink: "https://paystack.shop/pay/ikvt-3q2t3",
    categoryId: "brows",
  },
  {
    id: "combination-brows",
    name: "Combination Brows",
    description: "Microblading strokes with ombré shading for ultimate brows.",
    features: [
      "Hybrid technique",
      "Best of both styles",
      "Ultra-realistic",
      "Maximum definition",
    ],
    paystackLink: "https://paystack.shop/pay/00fgen601n",
    categoryId: "brows",
  },
  // Lips
  {
    id: "lip-blush-bottom",
    name: "Lip Blush (Bottom)",
    description: "Semi-permanent color for the lower lip only.",
    features: [
      "Soft color deposit",
      "Natural flush effect",
      "Long-lasting",
      "Lower lip only",
    ],
    paystackLink: "https://paystack.shop/pay/iths3g7eaq",
    categoryId: "lips",
  },
  {
    id: "lip-blush-both",
    name: "Lip Blush (Both)",
    description: "Semi-permanent color for both upper and lower lips.",
    features: [
      "Full lip coverage",
      "Natural flushed look",
      "Long-lasting color",
      "Complete enhancement",
    ],
    paystackLink: "https://paystack.shop/pay/p8qjh91br2",
    categoryId: "lips",
  },
  {
    id: "lip-blush-ombre",
    name: "Lip Blush (Ombré Lips)",
    description: "Gradient lip color for a modern, trendy look.",
    features: [
      "Ombré gradient effect",
      "Trendy appearance",
      "Dimensional color",
      "Premium technique",
    ],
    paystackLink: "https://paystack.shop/pay/p8qjh91br2",
    categoryId: "lips",
  },
  // Touch-Ups
  {
    id: "microblading-touchup",
    name: "Microblading Touch Up",
    description: "Refresh your microblading for continued perfection.",
    features: [
      "Restores definition",
      "Refreshes color",
      "Maintains shape",
      "Extended longevity",
    ],
    paystackLink: "https://paystack.shop/pay/wf01s6yd29",
    categoryId: "touchUps",
  },
  {
    id: "ombre-brows-touchup",
    name: "Ombré Brows Touch Up",
    description: "Revitalize your ombré brows with a professional touch-up.",
    features: [
      "Restores pigment",
      "Refreshes shading",
      "Maintains boldness",
      "Perfect definition",
    ],
    paystackLink: "https://paystack.shop/pay/687oend31d",
    categoryId: "touchUps",
  },
  {
    id: "combination-brows-touchup",
    name: "Combination Brows Touch Up",
    description: "Refresh both microblading and shading for ultimate brows.",
    features: [
      "Full brow refresh",
      "Restores all elements",
      "Maintains perfection",
      "Complete renewal",
    ],
    paystackLink: "https://paystack.shop/pay/j76wdfs3wt",
    categoryId: "touchUps",
  },
  {
    id: "lip-blush-touchup-bottom",
    name: "Lip Blush Touch Up (Bottom)",
    description: "Refresh color for the lower lip.",
    features: [
      "Restores color",
      "Maintains effect",
      "Quick appointment",
      "Like-new appearance",
    ],
    paystackLink: "https://paystack.shop/pay/3jbvv-o-xq",
    categoryId: "touchUps",
  },
  {
    id: "lip-blush-touchup-both",
    name: "Lip Blush Touch Up (Both)",
    description: "Refresh color for both upper and lower lips.",
    features: [
      "Full lip refresh",
      "Restores vibrancy",
      "Complete color restoration",
      "Perfect finish",
    ],
    paystackLink: "https://paystack.shop/pay/h5lowcyagy",
    categoryId: "touchUps",
  },
  {
    id: "lip-blush-touchup-ombre",
    name: "Lip Blush Touch Up (Ombré)",
    description: "Refresh the ombré gradient effect on lips.",
    features: [
      "Restores gradient",
      "Refreshes dimension",
      "Maintains trend",
      "Perfect ombré effect",
    ],
    paystackLink: "https://paystack.shop/pay/ip08oz59q9",
    categoryId: "touchUps",
  },
  // Extras
  {
    id: "brow-lamination",
    name: "Brow Lamination",
    description:
      "Set and shape your natural brows with semi-permanent lamination.",
    features: [
      "Shapes natural brows",
      "Long-lasting hold",
      "Fuller appearance",
      "Low maintenance",
    ],
    paystackLink: "https://paystack.shop/pay/n09kvq8l17",
    categoryId: "extras",
  },
  {
    id: "brow-tint",
    name: "Brow Tint",
    description: "Add color to your natural eyebrows.",
    features: [
      "Darkens brows",
      "Long-lasting color",
      "Natural enhancement",
      "Quick application",
    ],
    paystackLink: "https://paystack.shop/pay/566yqgsrbb",
    categoryId: "extras",
  },
  {
    id: "brow-lamination-tint",
    name: "Brow Lamination & Tint",
    description: "Combine lamination and tinting for ultimate brow perfection.",
    features: [
      "Shape and color",
      "Combined benefits",
      "Professional results",
      "Complete brow transformation",
    ],
    paystackLink: "https://paystack.shop/pay/zw03vius71",
    categoryId: "extras",
  },
  {
    id: "lash-removal",
    name: "Lash Removal",
    description: "Professional removal of your lash extensions.",
    features: [
      "Gentle removal",
      "Protects natural lashes",
      "Quick process",
      "Safe extraction",
    ],
    paystackLink: "https://paystack.shop/pay/w6ik5e3rje",
    categoryId: "extras",
  },
];

// Helper function to get services by category
export const getServicesByCategory = (categoryId: string): Service[] => {
  return services.filter((service) => service.categoryId === categoryId);
};

// Helper function to get a service by ID
export const getServiceById = (id: string): Service | undefined => {
  return services.find((service) => service.id === id);
};
