import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const SHOP = "demo-shop.myshopify.com";

const categories = [
  { name: "Shipping", position: 1 },
  { name: "Returns & Exchanges", position: 2 },
  { name: "Payments & Billing", position: 3 },
  { name: "Orders", position: 4 },
  { name: "Account Management", position: 5 },
  { name: "Product Information", position: 6 },
];

const faqs: { category: string; question: string; answer: string; position: number }[] = [
  {
    category: "Shipping", position: 1,
    question: "What are your shipping options?",
    answer: "We offer Standard (5-7 business days), Expedited (2-3 business days), and Overnight (next business day) shipping. Most orders placed before 2 PM local time ship the same day.",
  },
  {
    category: "Shipping", position: 2,
    question: "How much does shipping cost?",
    answer: "Standard shipping is free on all orders over $50. Orders under $50 ship for a flat rate of $4.99. Expedited shipping starts at $12.99 and Overnight starts at $24.99.",
  },
  {
    category: "Shipping", position: 3,
    question: "Do you ship internationally?",
    answer: "Yes! We ship to over 40 countries worldwide. International shipping rates start at $14.99 and are calculated at checkout based on destination and package weight. Customs fees and import duties may apply.",
  },
  {
    category: "Shipping", position: 4,
    question: "How can I track my order?",
    answer: "Once your order ships, you'll receive a confirmation email with a tracking number. You can also track your order anytime from your account dashboard under 'Order History'.",
  },
  {
    category: "Returns & Exchanges", position: 1,
    question: "What is your return policy?",
    answer: "We accept returns within 30 days of purchase. Items must be unworn, unwashed, and in their original packaging with all tags attached. Final sale items are not eligible for return.",
  },
  {
    category: "Returns & Exchanges", position: 2,
    question: "How do I start a return?",
    answer: "Log into your account, navigate to 'Order History', find the order you want to return, and click 'Return Items'. Follow the prompts to print your prepaid return label.",
  },
  {
    category: "Returns & Exchanges", position: 3,
    question: "How long do refunds take?",
    answer: "Once we receive your return, refunds are processed within 5-7 business days. The funds will appear in your original payment method within 3-5 additional business days depending on your bank.",
  },
  {
    category: "Returns & Exchanges", position: 4,
    question: "Can I exchange an item instead of returning it?",
    answer: "Yes! Exchanges are free and faster than a return. Use our online exchange portal in your account dashboard to request a size or color exchange.",
  },
  {
    category: "Payments & Billing", position: 1,
    question: "What payment methods do you accept?",
    answer: "We accept Visa, Mastercard, American Express, Discover, PayPal, Apple Pay, Google Pay, and Shop Pay. We also offer buy now, pay later options through Affirm and Klarna on orders over $50.",
  },
  {
    category: "Payments & Billing", position: 2,
    question: "Is my payment information secure?",
    answer: "Absolutely. We use industry-standard SSL encryption (256-bit) to protect your payment information. We are PCI DSS compliant and never store full credit card numbers on our servers.",
  },
  {
    category: "Payments & Billing", position: 3,
    question: "When will my card be charged?",
    answer: "Your payment method is authorized at checkout and charged once your order is confirmed. You'll see a pending authorization on your account immediately.",
  },
  {
    category: "Payments & Billing", position: 4,
    question: "Do you offer discounts for bulk orders?",
    answer: "Yes, we offer tiered pricing for bulk orders. Contact our wholesale team at wholesale@example.com with the items and quantities you're interested in.",
  },
  {
    category: "Orders", position: 1,
    question: "How do I cancel my order?",
    answer: "You can cancel your order within 1 hour of placing it directly from your account dashboard. After that, your order has entered fulfillment and we cannot guarantee cancellation.",
  },
  {
    category: "Orders", position: 2,
    question: "Can I change my shipping address after placing an order?",
    answer: "You can update your shipping address within 1 hour of placing the order via your account dashboard. After that window, please contact customer support immediately.",
  },
  {
    category: "Orders", position: 3,
    question: "Why was my order cancelled?",
    answer: "Orders may be cancelled due to payment authorization failures, items being out of stock, or inability to verify your shipping address. You will receive a notification email explaining the reason.",
  },
  {
    category: "Orders", position: 4,
    question: "How do I check my order status?",
    answer: "Log into your account and visit 'Order History' to see real-time status of all your orders. You'll also receive email updates at each stage of fulfillment.",
  },
  {
    category: "Account Management", position: 1,
    question: "How do I create an account?",
    answer: "Click 'Sign Up' in the top navigation bar and enter your email address and a secure password. You can also sign up using Google, Apple, or Facebook for a faster experience.",
  },
  {
    category: "Account Management", position: 2,
    question: "I forgot my password — what should I do?",
    answer: "Click 'Forgot Password' on the login page. Enter the email address associated with your account, and we'll send you a password reset link that expires after 1 hour.",
  },
  {
    category: "Account Management", position: 3,
    question: "How do I update my profile information?",
    answer: "Go to 'Account Settings' from your account dashboard. From there you can update your name, email address, phone number, and default shipping addresses.",
  },
  {
    category: "Account Management", position: 4,
    question: "Can I delete my account permanently?",
    answer: "Yes. Contact our customer support team with your account email and request deletion. We will process the request within 48 hours. This action is irreversible.",
  },
  {
    category: "Product Information", position: 1,
    question: "Are your products cruelty-free?",
    answer: "Yes! All our products are 100% cruelty-free and never tested on animals. We are certified by Leaping Bunny and PETA's Beauty Without Bunnies program.",
  },
  {
    category: "Product Information", position: 2,
    question: "Do you have a size guide?",
    answer: "Yes, every product page includes a detailed size guide with measurements in both inches and centimeters. Our universal sizing chart is also linked in the footer.",
  },
  {
    category: "Product Information", position: 3,
    question: "What materials do you use?",
    answer: "We are committed to sustainability. Our products use organic cotton, recycled polyester, TENCEL lyocell, and eco-friendly packaging. Each product page lists exact materials.",
  },
  {
    category: "Product Information", position: 4,
    question: "How should I care for my products to make them last?",
    answer: "Machine wash cold with similar colors, tumble dry low, and avoid bleach. Specific care instructions are printed on the inner label of every garment and listed on the product page.",
  },
];

async function seed() {
  console.log(`Seeding data for shop: ${SHOP}`);

  const existing = await db.setting.findUnique({ where: { shop: SHOP } });
  if (existing) {
    console.log("Shop already seeded. Skipping.");
    return;
  }

  await db.setting.create({
    data: {
      shop: SHOP,
      searchEnabled: true,
      widgetPosition: "bottom-right",
      widgetTheme: "light",
      displayCategories: true,
      faqOrder: "position",
    },
  });

  for (const cat of categories) {
    const category = await db.category.create({
      data: { name: cat.name, position: cat.position, shop: SHOP },
    });

    const categoryFaqs = faqs.filter((f) => f.category === cat.name);

    for (const faq of categoryFaqs) {
      await db.faq.create({
        data: {
          question: faq.question,
          answer: faq.answer,
          position: faq.position,
          status: true,
          shop: SHOP,
          categoryId: category.id,
        },
      });
    }

    console.log(`  Created category "${cat.name}" with ${categoryFaqs.length} FAQs`);
  }

  console.log("Seed complete.");
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
