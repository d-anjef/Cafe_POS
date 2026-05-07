const mongoose = require('mongoose');
const Menu = require('./src/models/Menu'); // Ensure this matches your menu model path

const seedData = async () => {
  await mongoose.connect('your_mongodb_uri');
  
  const branchId = "697269bdf275ad2583b24e28"; // Your verified ID
  const brandId = "697245a12d604f6f3ccb77c0";  // Your verified ID

  const items = [
    {
      name: "Gold Leaf Espresso",
      price: 850,
      description: "Premium dark roast topped with edible 24K gold flakes.",
      category: "Coffee",
      branchId, brandId, isAvailable: true
    },
    {
      name: "Truffle Infused Omelette",
      price: 1200,
      description: "Farm-fresh eggs with black truffle shavings and aged parmesan.",
      category: "Breakfast",
      branchId, brandId, isAvailable: true
    }
  ];

  await Menu.insertMany(items);
  console.log("Luxury Menu Seeded! 🌿");
  process.exit();
};
seedData();