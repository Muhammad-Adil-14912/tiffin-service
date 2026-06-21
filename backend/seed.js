const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');
const Tiffin = require('./models/Tiffin');
const Order = require('./models/Order');

dotenv.config();

const seedData = async () => {
  try {
    // Connect to DB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/tiffin_service');
    console.log('Connected to DB for seeding...');

    // Clear existing data
    await User.deleteMany();
    await Tiffin.deleteMany();
    await Order.deleteMany();
    console.log('Cleared existing data.');

    // Hash passwords
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    // Create Vendor
    const vendor = await User.create({
      name: "Granny's Gourmet Kitchen",
      email: "vendor@tiffin.com",
      password: hashedPassword,
      role: 'vendor',
      phone: '+1 (555) 456-7890',
      address: '42 Spice Garden Way, Foodie Town, CA 90210'
    });

    // Create Customer
    const customer = await User.create({
      name: 'John Customer',
      email: 'customer@tiffin.com',
      password: hashedPassword,
      role: 'customer',
      phone: '+1 (555) 123-4567',
      address: '102 Apartment 4B, Serene Meadows, CA 90210'
    });

    console.log('Created Mock Users:');
    console.log(`- Vendor: ${vendor.email} (Password: password123)`);
    console.log(`- Customer: ${customer.email} (Password: password123)`);

    // Create Tiffin plans
    const tiffins = [
      {
        title: 'Veg Maharaja Thali',
        description: 'Experience the royal flavors of India with our premium multi-course vegetarian feast. Prepared fresh daily with locally sourced organic vegetables and traditional clarified butter.',
        price: {
          daily: 12,
          weekly: 75,
          monthly: 280
        },
        category: 'Veg',
        menu: {
          monday: 'Paneer Butter Masala, Dal Makhani, 3 Butter Rotis, Jeera Rice, Gulab Jamun',
          tuesday: 'Aloo Gobi Matar, Yellow Dal Tadka, 3 Phulkas, Steamed Basmati Rice, Kheer',
          wednesday: 'Malai Kofta, Mix Veg Curry, 3 Butter Rotis, Veg Pulao, Rasgulla',
          thursday: 'Chana Masala, Kadhi Pakora, 2 Bhaturas, Jeera Rice, Suji Halwa',
          friday: 'Palak Paneer, Rajma Masala, 3 Butter Rotis, Steamed Rice, Moong Dal Halwa',
          saturday: 'Baingan Bharta, Gujarati Kadhi, 3 Phulkas, Khichdi, Shrikhand',
          sunday: 'Chef Special Paneer Lababdar, Dal Fry, 1 Butter Naan, Veg Biryani, Rasmalai'
        },
        vendor: vendor._id
      },
      {
        title: 'Keto Power Diet Plan',
        description: 'A scientifically balanced low-carb, high-protein meal plan tailored for fitness enthusiasts and weight management. Macros: 70% Fat, 25% Protein, 5% Net Carbs.',
        price: {
          daily: 15,
          weekly: 95,
          monthly: 360
        },
        category: 'Diet',
        menu: {
          monday: 'Grilled Herb Chicken Breast, Buttered Broccoli, Avocado Salad',
          tuesday: 'Pan-seared Salmon Fillet, Asparagus Spears, Cauliflower Mash',
          wednesday: 'Tandoori Paneer Tikka, Stir-fried Spinach, Cucumber Raita',
          thursday: 'Lemon Garlic Shrimp Skewers, Zucchini Noodles (Zoodles) in Pesto',
          friday: 'Baked Eggplant Lasagna (Low Carb), Mixed Green Salad with Olive Oil',
          saturday: 'Mushroom & Goat Cheese Stuffed Chicken Breast, Buttered Green Beans',
          sunday: 'Grilled Tofu Steaks, Roasted Brussels Sprouts, Sesame Avocado Bowl'
        },
        vendor: vendor._id
      },
      {
        title: 'Spicy Chettinad Non-Veg Club',
        description: 'Indulge in authentic, fiery meat delicacies cooked with freshly ground Chettinad spices. Includes a rotation of premium chicken, mutton, and fresh catch of the day.',
        price: {
          daily: 14,
          weekly: 88,
          monthly: 340
        },
        category: 'Non-Veg',
        menu: {
          monday: 'Fiery Chettinad Chicken Curry, Malabar Parotta (2), Ghee Rice, Payasam',
          tuesday: 'Traditional Mutton Rogan Josh, Butter Roti (3), Basmati Rice, Salad',
          wednesday: 'Butter Chicken Masala, 1 Garlic Naan, Jeera Rice, Gulab Jamun',
          thursday: 'Coastal Fish Curry in Coconut Gravy, Steamed Rice, Cabbage Thoran',
          friday: 'Andhra Spicy Chicken Fry, Tomato Pappu Dal, 3 Rotis, Steamed Rice',
          saturday: 'Mutton Keema Matar Masala, 3 Phulkas, Veg Pulao, Raita',
          sunday: 'Royal Chicken Dum Biryani, Mirchi Ka Salan, Onion Raitha, double ka meetha'
        },
        vendor: vendor._id
      }
    ];

    await Tiffin.create(tiffins);
    console.log('Seeded 3 gorgeous Tiffin meal plans!');

    // Close connection
    mongoose.connection.close();
    console.log('Database seeding process completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
