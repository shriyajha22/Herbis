import { Product, Category, Blog, Review, Coupon } from "./types";

export const initialCategories: Category[] = [
  {
    _id: "cat-1",
    name: "Blue Tea",
    slug: "blue-tea",
    description: "Mesmerising sapphire herbal infusions crafted from organic Butterfly Pea flowers.",
    iconName: "Sparkles",
    image: "/images/blue-tea.jpg",
    itemCount: 3,
    featured: true,
  },
  {
    _id: "cat-2",
    name: "Wellness Tea",
    slug: "wellness-tea",
    description: "Targeted Ayurvedic formulas for blood sugar balance and holistic bodily health.",
    iconName: "HeartPulse",
    image: "/images/guava-jamun-neem.jpg",
    itemCount: 1,
    featured: true,
  },
  {
    _id: "cat-3",
    name: "Ayurvedic Tea",
    slug: "ayurvedic-tea",
    description: "Tridosha balancing infusions infused with traditional herbs & spices.",
    iconName: "ShieldCheck",
    image: "/images/ayurvedic-kashayam.jpg",
    itemCount: 1,
    featured: true,
  },
];

export const initialProducts: Product[] = [
  {
    _id: "prod-1",
    name: "Blue Tea (Butterfly Pea Flower Tea)",
    slug: "blue-tea",
    subtitle: "Discover the natural wellness of PrimeBrew Herbis Blue Tea, made from carefully selected Butterfly Pea Flowers. This vibrant, caffeine-free herbal infusion is packed with natural antioxidants that support your overall well-being. Enjoy a soothing cup any time of the day as part of a healthy lifestyle.",
    description: "Discover the natural wellness of PrimeBrew Herbis Blue Tea, made from carefully selected Butterfly Pea Flowers. This vibrant, caffeine-free herbal infusion is packed with natural antioxidants that support your overall well-being. Enjoy a soothing cup any time of the day as part of a healthy lifestyle.",
    category: "blue-tea",
    categoryName: "Blue Tea",
    price: 249,
    mrp: 349,
    discountPercentage: 29,
    rating: 4.9,
    reviewCount: 148,
    stock: 85,
    inStock: true,
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    images: [
      "/images/blue-tea.jpg"
    ],
    weightVariants: [
      { weight: "30 Tea Bags", price: 249, mrp: 349 },
      { weight: "50g Loose Tea", price: 349, mrp: 449 },
      { weight: "100g Value Pack", price: 599, mrp: 799 }
    ],
    keyHerbs: [
      "100% Premium Butterfly Pea Flower (Clitoria Ternatea)"
    ],
    benefits: [
      "Supports metabolism & healthy weight management",
      "Calms the nervous system, reduces stress & promotes restful sleep",
      "Helps stabilize blood sugar after meals",
      "Rich in antioxidants that help fight free radicals and inflammation",
      "Naturally caffeine-free"
    ],
    flavorProfile: "Mild • Earthy • Floral",
    caffeineLevel: "Naturally Caffeine-Free",
    brewingGuide: {
      temp: "85°C / 185°F",
      steepTime: "3 to 5 minutes",
      waterAmount: "200 ml",
      servingSuggestion: "Add a squeeze of fresh lemon juice to watch the tea turn royal purple!"
    },
    storageInstructions: "Store in a cool, dry place away from direct sunlight in an airtight container.",
    ingredients: [
      { name: "100% Premium Butterfly Pea Flowers", percentage: "100%", description: "Pure hand-picked Clitoria Ternatea whole blossoms" }
    ],
    nutritionInfo: {
      calories: "2 kcal per cup",
      carbs: "0.4 g",
      protein: "0.1 g",
      fat: "0 g",
      antioxidants: "380 mg Anthocyanins"
    },
    netQuantity: "30 Tea Bags / 50g",
    certifications: ["100% Organic", "Direct Farm Sourced", "Pesticide-Free", "Vegan & Gluten-Free"],
    sku: "PBH-BLU-001",
    origin: "PrimeBrew Herbis Own Farms, Karnataka"
  },
  {
    _id: "prod-2",
    name: "Blue Tea + Elaichi",
    slug: "blue-tea-with-elaichi",
    subtitle: "Caffeine-Free | Digestive & Calming | Antioxidant Rich | Supports Metabolism",
    description: "Experience the perfect fusion of vibrant Butterfly Pea Flowers and aromatic Green Cardamom (Elaichi). This naturally caffeine-free herbal infusion combines the antioxidant benefits of Blue Tea with the digestive and soothing properties of Elaichi, creating a refreshing and calming wellness drink for any time of the day.",
    category: "blue-tea",
    categoryName: "Blue Tea",
    price: 299,
    mrp: 399,
    discountPercentage: 25,
    rating: 4.95,
    reviewCount: 192,
    stock: 120,
    inStock: true,
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    images: [
      "/images/blue-tea-elaichi.jpg"
    ],
    weightVariants: [
      { weight: "30 Tea Bags", price: 299, mrp: 399 },
      { weight: "50g Loose Tea", price: 399, mrp: 499 },
      { weight: "100g Value Pack", price: 699, mrp: 899 }
    ],
    keyHerbs: [
      "Premium Butterfly Pea Flowers",
      "Premium Green Cardamom (Elaichi)"
    ],
    benefits: [
      "Supports Healthy Metabolism",
      "Rich in Natural Antioxidants",
      "Supports Healthy Digestion",
      "Calming & Refreshing",
      "100% Naturally Caffeine-Free"
    ],
    flavorProfile: "Floral • Mild • Refreshingly Aromatic • Smooth Finish",
    caffeineLevel: "Naturally Caffeine-Free",
    brewingGuide: {
      temp: "90°C / 194°F",
      steepTime: "4 to 5 minutes",
      waterAmount: "220 ml",
      servingSuggestion: "Add a drop of honey or squeeze of lemon for a refreshing twist!"
    },
    storageInstructions: "Store in a cool, dry place away from direct sunlight in an airtight container.",
    ingredients: [
      { name: "Premium Butterfly Pea Flowers", percentage: "70%", description: "Organic Clitoria Ternatea whole blossoms" },
      { name: "Premium Green Cardamom (Elaichi)", percentage: "30%", description: "Crushed Tellicherry aromatic cardamom pods" }
    ],
    nutritionInfo: {
      calories: "3 kcal",
      carbs: "0.5 g",
      protein: "0.1 g",
      fat: "0 g",
      antioxidants: "340 mg Polyphenols"
    },
    netQuantity: "30 Tea Bags / 50g",
    certifications: ["Farm-to-Cup Quality", "Premium Natural Ingredients", "No Artificial Colours", "No Artificial Flavours", "No Preservatives", "Vegan", "Gluten-Free"],
    sku: "PBH-BLU-002",
    origin: "PrimeBrew Herbis Own Farms, Karnataka"
  },
  {
    _id: "prod-3",
    name: "Blue Tea + Ginger Cinnamon (Butterfly Pea Flower, Ginger & Cinnamon Herbal Tea)",
    slug: "blue-tea-with-ginger-cinnamon",
    subtitle: "Warming • Caffeine-Free • Supports Digestion, Metabolism & Blood Sugar Balance",
    description: "Enjoy the perfect fusion of Butterfly Pea Flowers, Ginger, and Cinnamon in a comforting herbal infusion. This naturally caffeine-free blend combines antioxidant-rich Blue Tea with the warming goodness of ginger and cinnamon, making it an ideal wellness beverage to support digestion, metabolism, and overall health.",
    category: "blue-tea",
    categoryName: "Blue Tea",
    price: 349,
    mrp: 449,
    discountPercentage: 22,
    rating: 4.88,
    reviewCount: 115,
    stock: 65,
    inStock: true,
    isFeatured: true,
    isBestSeller: false,
    isNewArrival: true,
    images: [
      "/images/blue-tea-ginger-cinnamon.jpg"
    ],
    weightVariants: [
      { weight: "30 Tea Bags", price: 349, mrp: 449 },
      { weight: "50g Loose Tea", price: 449, mrp: 549 },
      { weight: "100g Value Pack", price: 749, mrp: 949 }
    ],
    keyHerbs: [
      "Premium Butterfly Pea Flowers",
      "Natural Ginger",
      "Premium Cinnamon"
    ],
    benefits: [
      "Supports Healthy Digestion",
      "Supports Metabolism",
      "Supports Healthy Blood Sugar Balance",
      "Rich in Natural Antioxidants",
      "Naturally Caffeine-Free",
      "Warming & Comforting Blend"
    ],
    flavorProfile: "Floral • Warm & Spicy • Mildly Sweet • Smooth Finish",
    caffeineLevel: "Naturally Caffeine-Free",
    brewingGuide: {
      temp: "95°C / 203°F",
      steepTime: "4 to 6 minutes",
      waterAmount: "200 ml",
      servingSuggestion: "Sip warm on chilly mornings or during afternoon slumps."
    },
    storageInstructions: "Store in an airtight container away from heat and moisture.",
    ingredients: [
      { name: "Premium Butterfly Pea Flowers", percentage: "55%", description: "Organic Clitoria Ternatea whole blossoms" },
      { name: "Natural Ginger", percentage: "25%", description: "Sun-dried Zingiber ginger root" },
      { name: "Premium Cinnamon", percentage: "20%", description: "True fragrant Ceylon cinnamon bark" }
    ],
    nutritionInfo: {
      calories: "4 kcal",
      carbs: "0.8 g",
      protein: "0.1 g",
      fat: "0 g",
      antioxidants: "420 mg Active Polyphenols"
    },
    netQuantity: "30 Tea Bags / 50g",
    certifications: ["Farm-to-Cup Quality", "Premium Natural Ingredients", "Antioxidant Rich", "No Artificial Colours", "No Artificial Flavours", "No Preservatives", "Vegan", "Gluten-Free"],
    sku: "PBH-BLU-003",
    origin: "PrimeBrew Herbis Own Farms, Karnataka"
  },
  {
    _id: "prod-4",
    name: "Guava + Jamun + Neem Herbal Blend",
    slug: "guava-jamun-neem-herbal-blend",
    subtitle: "Supports Digestion & Traditional Wellness | Part of a Balanced Healthy Lifestyle",
    description: "Discover the goodness of three time-honored herbs in one refreshing cup. Our Guava + Jamun + Neem Herbal Blend is thoughtfully crafted using premium natural ingredients to support digestive wellness and promote overall well-being. This caffeine-free herbal infusion is a perfect addition to a balanced, healthy lifestyle and can be enjoyed any time of the day.",
    category: "wellness-tea",
    categoryName: "Wellness Tea",
    price: 425,
    mrp: 549,
    discountPercentage: 23,
    rating: 4.93,
    reviewCount: 176,
    stock: 90,
    inStock: true,
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    images: [
      "/images/guava-jamun-neem.jpg"
    ],
    weightVariants: [
      { weight: "30 Tea Bags", price: 425, mrp: 549 },
      { weight: "50g Loose Tea", price: 525, mrp: 649 },
      { weight: "100g Value Pack", price: 899, mrp: 1099 }
    ],
    keyHerbs: [
      "Premium Guava Leaves",
      "Natural Jamun",
      "Premium Neem Leaves"
    ],
    benefits: [
      "Supports Healthy Digestion",
      "Supports Traditional Wellness",
      "Rich in Natural Plant Compounds",
      "Daily Wellness Support",
      "Naturally Caffeine-Free"
    ],
    flavorProfile: "Mild Herbal • Earthy • Smooth • Refreshing",
    caffeineLevel: "Naturally Caffeine-Free",
    brewingGuide: {
      temp: "90°C / 194°F",
      steepTime: "5 minutes",
      waterAmount: "200 ml",
      servingSuggestion: "Drink warm after main meals or any time of the day as part of your daily wellness ritual."
    },
    storageInstructions: "Store in a dry, cool environment in an airtight container.",
    ingredients: [
      { name: "Premium Guava Leaves", percentage: "40%", description: "Rich in polyphenols & flavonoid antioxidants for digestive comfort" },
      { name: "Natural Jamun", percentage: "35%", description: "Time-honored botanical for traditional wellness & vitality" },
      { name: "Premium Neem Leaves", percentage: "25%", description: "Cleansing plant compounds to support daily body harmony" }
    ],
    nutritionInfo: {
      calories: "2 kcal",
      carbs: "0.3 g",
      protein: "0.1 g",
      fat: "0 g",
      antioxidants: "390 mg Active Plant Compounds"
    },
    netQuantity: "30 Tea Bags / 50g",
    certifications: ["Farm-to-Cup Quality", "Premium Natural Ingredients", "100% Herbal Blend", "Rich in Natural Antioxidants", "No Artificial Colours", "No Artificial Flavours", "No Preservatives", "Vegan", "Gluten-Free"],
    sku: "PBH-WEL-004",
    origin: "PrimeBrew Herbis Own Farms, Karnataka"
  },
  {
    _id: "prod-5",
    name: "Authentic Ayurvedic Kashayam",
    slug: "authentic-ayurvedic-kashayam",
    subtitle: "Supports Digestion, Immunity & Metabolism",
    description: "Experience the wisdom of Ayurveda with PrimeBrew Herbis Authentic Ayurvedic Kashayam. Crafted from a carefully selected blend of traditional herbs and spices, this caffeine-free herbal drink is designed to support digestion, strengthen immunity, and promote healthy metabolism. Enjoy this comforting wellness beverage as part of your daily healthy lifestyle.",
    category: "ayurvedic-tea",
    categoryName: "Ayurvedic Tea",
    price: 380,
    mrp: 499,
    discountPercentage: 24,
    rating: 4.96,
    reviewCount: 210,
    stock: 105,
    inStock: true,
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    images: [
      "/images/ayurvedic-kashayam.jpg"
    ],
    weightVariants: [
      { weight: "30 Tea Bags", price: 380, mrp: 499 },
      { weight: "50g Loose Tea", price: 480, mrp: 599 },
      { weight: "100g Value Pack", price: 799, mrp: 999 }
    ],
    keyHerbs: [
      "Ginger",
      "Cinnamon",
      "Black Pepper",
      "Cardamom",
      "Coriander",
      "Traditional Ayurvedic Herbs & Spices"
    ],
    benefits: [
      "Supports Healthy Digestion",
      "Supports Natural Immunity",
      "Supports Healthy Metabolism",
      "Traditional Ayurvedic Wellness",
      "Naturally Caffeine-Free"
    ],
    flavorProfile: "Warm • Spicy • Herbal • Comforting",
    caffeineLevel: "Naturally Caffeine-Free",
    brewingGuide: {
      temp: "90°C / 194°F",
      steepTime: "5 to 7 minutes",
      waterAmount: "220 ml",
      servingSuggestion: "Sip warm morning or evening for holistic digestion and immunity."
    },
    storageInstructions: "Store sealed in a cool, dry place away from moisture.",
    ingredients: [
      { name: "Zingiber Officinale (Ginger)", percentage: "25%", description: "Ignites digestive fire & eases throat" },
      { name: "Ceylon Cinnamon", percentage: "20%", description: "Warming spice for metabolism & balance" },
      { name: "Black Pepper & Cardamom", percentage: "25%", description: "Aromatic bio-enhancers for bioavailability" },
      { name: "Coriander & Ayurvedic Spices", percentage: "30%", description: "Cooling & soothing digestive harmony" }
    ],
    nutritionInfo: {
      calories: "2 kcal",
      carbs: "0.4 g",
      protein: "0.1 g",
      fat: "0 g",
      antioxidants: "460 mg Active Botanicals"
    },
    netQuantity: "30 Tea Bags / 50g",
    certifications: ["Farm-to-Cup Quality", "Premium Natural Ingredients", "Traditional Ayurvedic Blend", "Rich in Natural Plant Compounds", "No Artificial Colours", "No Artificial Flavours", "No Preservatives", "Vegan", "Gluten-Free"],
    sku: "PBH-AYU-005",
    origin: "PrimeBrew Herbis Own Farms, Karnataka"
  }
];

export const initialBlogs: Blog[] = [
  {
    _id: "blog-1",
    title: "The Magic of Blue Tea: Antioxidants, Color Transformations & Calm",
    slug: "magic-of-blue-tea-antioxidants-calm",
    excerpt: "Discover why Butterfly Pea Blue Tea is captivating wellness lovers. From anthocyanin antioxidants to its magical purple citrus transformation.",
    content: `
# The Magic of Blue Tea

In the world of fine herbal infusions, few botanicals entrance the senses like Butterfly Pea (Clitoria Ternatea).

## Why Anthocyanin Antioxidants Matter

Blue Tea derives its rich indigo pigment from potent anthocyanins—the same antioxidants found in wild blueberries and acai berries.

- **Skin Glow**: Fights oxidative stress and preserves natural skin elasticity.
- **Mental Clarity**: Calms nervous tension without causing drowsiness.
- **Natural Color Shifting**: PH-sensitive polyphenols turn royal purple when infused with fresh lemon juice!

## How to Brew the Perfect Sapphire Cup

1. Steep 1 Blue Tea bag in 200ml of hot water (85°C) for 4 minutes.
2. Inhale the soothing botanical aroma.
3. Squeeze fresh lemon juice for a magical color transformation and citrus kick!
    `,
    category: "Tea Knowledge",
    author: "",
    authorRole: "",
    authorImage: "",
    readTime: "4 min read",
    publishDate: "",
    coverImage: "/images/blue-tea.jpg",
    tags: ["Blue Tea", "Mindfulness", "Wellness", "Antioxidants"],
    featured: true
  },
  {
    _id: "blog-2",
    title: "Guava, Jamun & Neem: Traditional Herbs for Digestive Comfort",
    slug: "guava-jamun-neem-traditional-herbs-digestive-comfort",
    excerpt: "Explore time-honored herbs like Guava leaves, Jamun, and Neem crafted to support digestive wellness and balanced daily living.",
    content: `
# Guava, Jamun & Neem for Digestive Comfort

Traditional botanical wisdom has long valued native leaves and seeds for daily stomach comfort and digestive balance.

## The Goodness of 3 Time-Honored Botanicals

Our Guava + Jamun + Neem Herbal Blend combines three pure farm-sourced herbs:

- **Guava Leaves**: Rich in polyphenols and flavonoid antioxidants that soothe the stomach and support smooth digestion.
- **Jamun Seed**: Packed with natural plant compounds to promote gut harmony and overall well-being.
- **Neem Leaves**: Gentle cleansing botanical compounds that support daily body balance.

## How to Integrate into Your Routine

1. Steep 1 Tea Bag in 200ml of hot water (90°C) for 5 minutes.
2. Sip warm after main meals as part of your daily wellness ritual.
    `,
    category: "Health Tips",
    author: "",
    authorRole: "",
    authorImage: "",
    readTime: "5 min read",
    publishDate: "",
    coverImage: "/images/guava-jamun-neem.jpg",
    tags: ["Guava Jamun Neem", "Digestive Wellness", "Daily Care"],
    featured: true
  },
  {
    _id: "blog-3",
    title: "Warming Spices: How Ginger & Cinnamon Support Digestion & Metabolism",
    slug: "warming-spices-ginger-cinnamon-digestion-metabolism",
    excerpt: "Learn how natural sun-dried ginger root and aromatic Ceylon cinnamon bark create a comforting caffeine-free infusion to support daily digestion and metabolism.",
    content: `
# Warming Spices for Daily Wellness

Spices have been used for centuries to warm the body, assist digestion, and bring soothing aroma to daily tea rituals.

## The Goodness of Ginger & Cinnamon

In PrimeBrew Herbis Blue Tea with Ginger & Cinnamon, two powerful botanicals come together:

- **Sun-Dried Ginger Root**: Known for warming the stomach, easing abdominal discomfort after meals, and supporting natural metabolic rhythm.
- **Ceylon Cinnamon Bark**: A fragrant bark rich in natural polyphenols that helps maintain balanced energy levels throughout the day without caffeine jitters.
- **Butterfly Pea Flowers**: Rich in anthocyanin antioxidants that complement the warming spices with gentle cellular support.

## How to Enjoy Your Warming Infusion

1. Steep 1 Tea Bag in 200ml of hot water (95°C / 203°F) for 4 to 6 minutes.
2. Inhale the warm, spicy aroma of ginger and true Ceylon cinnamon.
3. Sip warm on chilly mornings or after main meals for comforting digestive support.
    `,
    category: "Health Tips",
    author: "",
    authorRole: "",
    authorImage: "",
    readTime: "5 min read",
    publishDate: "",
    coverImage: "/images/blue-tea-ginger-cinnamon.jpg",
    tags: ["Blue Tea", "Ginger Cinnamon", "Digestion", "Metabolism"],
    featured: false
  },
  {
    _id: "blog-4",
    title: "How to Choose Quality Butterfly Pea Flower Tea Online",
    slug: "how-to-choose-quality-butterfly-pea-flower-tea-online",
    excerpt: "Buy Butterfly Pea Flower Tea Online from Bracha by Prime Brew Herbis. Explore blue tea with elaichi, brewing tips, flavour details and easy ordering.",
    content: `<p>Butterfly pea flower tea has become a popular choice for people who enjoy colourful herbal beverages and distinctive botanical flavours. Known for its naturally blue appearance, this infusion is made from the flowers of <em>Clitoria ternatea</em>. Its mild, earthy taste makes it suitable for enjoying warm or chilled, while a squeeze of lemon can transform its blue colour into a shade of purple.</p>

<p>If you want to <a href="https://www.primebrewherbis.com/product/blue-tea-with-elaichi" target="_blank" rel="noopener noreferrer">Bracha Blue Tea with Elaichi</a>, it is worth looking beyond attractive packaging and promotional claims. Ingredients, freshness, flavour, product information, and convenient preparation all contribute to a satisfying tea experience.</p>

<p>Bracha Blue Tea with Elaichi Tea, offered by Prime Brew Herbis, is an option to explore if you enjoy blue tea and want to try a variation featuring elaichi. Understanding what makes a quality herbal infusion can help you choose a product that suits your preferences.</p>

<h2>What Makes Quality Butterfly Pea Flower Tea?</h2>

<p>Choosing quality butterfly pea flower tea starts with understanding the ingredients and how the product is presented. A reliable product page should provide clear details that help you decide whether the tea meets your expectations.</p>

<h3>1. Check the Ingredients Carefully</h3>

<p>Before you Buy Butterfly Pea Flower Tea Online, read the ingredient list and product description. Pure butterfly pea flower tea has a mild, earthy flavour, while blends containing other botanicals offer a different taste.</p>

<p>Here are a few details worth checking:</p>

<ul>
<li><strong>Ingredient transparency:</strong> Look for a clear list of flowers, spices, and other ingredients.</li>
<li><strong>Freshness information:</strong> Check the best-before date and recommended storage conditions.</li>
<li><strong>Packaging quality:</strong> Choose packaging designed to protect the tea from moisture and external odours.</li>
<li><strong>Preparation guidance:</strong> Make sure the product explains how to brew the tea.</li>
<li><strong>Certifications:</strong> Review any organic or quality certifications and confirm that the claims are supported by appropriate information.</li>
</ul>

<p>These checks are useful when comparing Bracha Blue Tea with Elaichi Tea with other products available online.</p>

<h3>2. Understand the Colour and Flavour</h3>

<p>One of the most distinctive features of butterfly pea flower tea is its natural blue colour. The colour comes from plant pigments called anthocyanins, which can respond to changes in acidity.</p>

<p>Adding lemon juice may shift the infusion towards purple. This makes blue tea an interesting choice for creative drinks, refreshing iced tea, and serving guests.</p>

<p>The flavour is generally mild and earthy, so you can enjoy it plain or experiment with additions such as lemon or a little honey. If you prefer aromatic Indian flavours, an elaichi-infused variation may be worth trying.</p>

<h3>3. Compare Tea Bags, Quantity, and Value</h3>

<p>When you Buy Butterfly Pea Flower Tea Online, compare the package size and price rather than choosing a product based on discounts alone. Check how many servings the package contains and whether the preparation method suits your routine.</p>

<p>Bracha Blue Tea with Elaichi Tea with elaichi is listed by Prime Brew Herbis in a convenient box of 30 tea bags. Tea bags can simplify preparation at home or at work because they do not require a separate strainer.</p>

<p>Comparing these details makes it easier to select a product that offers suitable convenience and value.</p>

<h2>Why Explore Bracha Blue Tea with Elaichi Tea?</h2>

<p>Bracha Blue Tea with Elaichi Tea is associated with Prime Brew Herbis, a brand offering herbal tea varieties for people interested in exploring botanical infusions. Its Blue Tea + Elaichi option combines the distinctive appearance of butterfly pea flower tea with the familiar aroma of elaichi.</p>

<h3>Enjoy the Aroma of Elaichi</h3>

<p>Elaichi, commonly known as cardamom, is widely used in Indian beverages because of its warm, aromatic character. When paired with butterfly pea flower tea, it offers a flavour variation for people who enjoy traditional spices in a different format.</p>

<p>If you are planning to Buy Butterfly Pea Flower Tea Online, consider whether you prefer a plain floral infusion or a spiced blend. Checking the product's ingredient list will help you understand the specific combination before purchasing.</p>

<h3>Convenient for Everyday Tea Moments</h3>

<p>Tea bags offer a straightforward way to prepare a cup without measuring loose flowers. You can enjoy your infusion during a break, serve it to guests, or prepare a chilled version for warmer days.</p>

<p>Pure butterfly pea flower infusions are naturally caffeine-free. However, check the full ingredients of a blended product to confirm its caffeine content.</p>

<p>Although butterfly pea flowers contain naturally occurring plant compounds, blue tea should not be treated as a guaranteed remedy for medical conditions or as a substitute for professional healthcare advice.</p>

<h2>How to Prepare Butterfly Pea Flower Tea</h2>

<p>For a pleasant cup, follow the brewing instructions printed on the product packaging.</p>

<ol>
<li>Place one tea bag in a clean cup.</li>
<li>Add hot water according to the recommended instructions.</li>
<li>Allow the tea to steep for the suggested time.</li>
<li>Remove the tea bag and adjust the strength to your preference.</li>
<li>Add lemon if you would like to experiment with its colour-changing effect.</li>
</ol>

<p>You can also allow the brewed tea to cool and serve it over ice. Store the remaining tea bags in a cool, dry place and follow the package's storage guidance.</p>

<h2>Where to Buy Bracha Blue Tea with Elaichi in India</h2>

<p>If you are ready to Buy Butterfly Pea Flower Tea Online, visit the official Prime Brew Herbis product page to explore the Blue Tea + Elaichi option.</p>

<p>Product page: <a href="https://www.primebrewherbis.com/product/blue-tea" target="_blank" rel="noopener noreferrer">https://www.primebrewherbis.com/product/blue-tea</a></p>

<p>Review the current price, ingredients, package quantity, availability, and delivery information before placing your order. Product details and shipping conditions may change, so the live page is the best place to confirm the latest information.</p>

<p>Bracha Blue Tea with Elaichi Tea may suit people who enjoy colourful herbal beverages and the aroma of elaichi. Whether you are buying it for yourself or considering it as a gift, choose according to your taste preferences and the product information provided.</p>

<h2>Conclusion</h2>

<p>Choosing quality butterfly pea flower tea online becomes easier when you compare ingredients, freshness, packaging, flavour, and value. These details help you make a more informed decision than relying on promotional claims alone.</p>

<p>Bracha Blue Tea with Elaichi Tea with elaichi from Prime Brew Herbis offers a convenient way to explore a blue tea variation with a familiar Indian spice. If you want to Buy Butterfly Pea Flower Tea Online, review the product details and select a blend that fits your daily routine.</p>

<h2>Frequently Asked Questions</h2>

<h3>Q1. Where can I buy butterfly pea flower tea online?</h3>
<p>You can explore Bracha Blue Tea + Elaichi through the Prime Brew Herbis website. Check the product description, current pricing, availability, and delivery information before ordering.</p>

<h3>Q2. What is Bracha Blue Tea with Elaichi Tea?</h3>
<p>It is a blue tea option associated with Prime Brew Herbis. The Blue Tea + Elaichi variation combines butterfly pea flower tea with the aromatic character of elaichi. Review the product ingredients for the exact composition.</p>

<h3>Q3. Is butterfly pea flower tea naturally caffeine-free?</h3>
<p>A pure butterfly pea flower infusion is naturally caffeine-free. If you choose a blended tea, check its complete ingredient list to confirm whether any caffeine-containing ingredients are included.</p>

<h3>Q4. How do I choose quality butterfly pea flower tea online?</h3>
<p>Look for transparent ingredient information, suitable packaging, freshness details, clear brewing instructions, and fair pricing. Compare these factors before deciding which product best matches your needs.</p>`,
    category: "Tea Knowledge",
    author: "",
    authorRole: "",
    authorImage: "",
    readTime: "7 min read",
    publishDate: "November 6, 2026",
    coverImage: "/images/how-to-choose-quality-butterfly-pea-flower-tea-online.jpg",
    coverImageAlt: "How to Choose Quality Butterfly Pea Flower Tea Online – Bracha Blue Tea with Elaichi by Prime Brew Herbis",
    tags: ["Blue Tea", "Elaichi", "Butterfly Pea Flower Tea", "Buy Online"],
    featured: false,
    url: "/blog/how-to-choose-quality-butterfly-pea-flower-tea-online",
    canonicalUrl: "/blog/how-to-choose-quality-butterfly-pea-flower-tea-online",
    seoTitle: "Buy Butterfly Pea Flower Tea Online | Bracha Blue Tea",
    seoDescription: "Buy Butterfly Pea Flower Tea Online from Bracha by Prime Brew Herbis. Explore blue tea with elaichi, brewing tips, flavour details and easy ordering."
  }
];

export const initialReviews: Review[] = [
  {
    _id: "rev-1",
    productId: "prod-1",
    userName: "Vikram Malhotra",
    userAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    rating: 5,
    title: "Mesmerising color & calm energy!",
    comment: "I've been drinking the Blue Tea every evening for 3 weeks. Watching it turn purple with lemon is magical, and it completely eases my workday stress.",
    date: "August 1, 2026",
    verifiedBuyer: true,
    helpfulCount: 24
  },
  {
    _id: "rev-2",
    productId: "prod-2",
    userName: "Priya Sunder",
    userAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
    rating: 5,
    title: "Aromatic cardamom bliss!",
    comment: "The Elaichi aroma in this Blue Tea blend is exquisite. It helps my digestion after heavy dinners and leaves a soothing floral warmth.",
    date: "July 29, 2026",
    verifiedBuyer: true,
    helpfulCount: 42
  },
  {
    _id: "rev-3",
    productId: "prod-4",
    userName: "Rajesh Kulkarni",
    userAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
    rating: 5,
    title: "Excellent sugar management support",
    comment: "My doctor recommended adding Ayurvedic herbs to my daily routine. The Pre-Diabetic Tea with Gurmar and Jamun has helped stabilize my post-meal sugar readings naturally.",
    date: "July 24, 2026",
    verifiedBuyer: true,
    helpfulCount: 31
  },
  {
    _id: "rev-4",
    productId: "prod-5",
    userName: "Meera Nair",
    userAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    rating: 5,
    title: "True Ayurvedic vitality!",
    comment: "Ayurvedic Kashayam has become my daily morning ritual. The spice combination gives me sustained energy without any caffeine crash.",
    date: "July 20, 2026",
    verifiedBuyer: true,
    helpfulCount: 19
  }
];

export const initialCoupons: Coupon[] = [
  {
    code: "HERBAL15",
    discountType: "percentage",
    discountValue: 15,
    minOrderAmount: 299,
    maxDiscount: 200,
    expiryDate: "2026-12-31"
  },
  {
    code: "FARM2CUP",
    discountType: "fixed",
    discountValue: 50,
    minOrderAmount: 399,
    expiryDate: "2026-12-31"
  },
  {
    code: "WELCOME10",
    discountType: "percentage",
    discountValue: 10,
    minOrderAmount: 199,
    maxDiscount: 150,
    expiryDate: "2026-12-31"
  }
];

export const getOrderItemImage = (item: any): string => {
  if (!item) return '/images/logo.png';

  const cleanId = String(item.productId || item._id || '').trim();
  const cleanName = String(item.productName || item.name || '').trim().toLowerCase();

  // 1. Prioritize catalog lookup by productId or productName to resolve assigned image
  if (cleanId || cleanName) {
    const found = initialProducts.find((p) => {
      if (cleanId && p._id === cleanId) return true;
      if (!cleanName) return false;
      const pName = p.name.trim().toLowerCase();
      return pName === cleanName || pName.includes(cleanName) || cleanName.includes(pName);
    });

    if (found && found.images && found.images[0]) {
      return found.images[0];
    }
  }

  // 2. Fallback to item stored fields if not found in catalog
  if (item.productImage && typeof item.productImage === 'string' && item.productImage.trim() !== '' && !item.productImage.includes('logo.png')) {
    return item.productImage.trim();
  }

  if (item.image && typeof item.image === 'string' && item.image.trim() !== '' && !item.image.includes('logo.png')) {
    return item.image.trim();
  }

  if (item.images && Array.isArray(item.images) && item.images[0]) {
    return item.images[0];
  }

  return '/images/logo.png';
};
