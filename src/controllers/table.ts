// import express from "express";
// import prisma from "prisma/prismaClient";
// import { Request,response } from "express";
// // Initialize tables for a restaurant
// export const initializeRestaurantTables = async (req, res) => {
//     const { restaurantId } = req.body;
  
//     try {
//       const restaurant = await prisma.restaurant.findUnique({
//         where: { id: restaurantId },
//       });
  
//       if (!restaurant) {
//          res.status(404).json({ error: "Restaurant not found" });
//          return;
//       }
  
//       const tableCreationData = Array.from(
//         { length: restaurant.maxTables },
//         (_, index) => ({
//           restaurantId,
//           tableNumber: index + 1, // Sequential table numbers
//         })
//       );
  
//       const createdTables = await prisma.table.createMany({
//         data: tableCreationData,
//         skipDuplicates: true, // Avoid duplicates if already initialized
//       });
  
//       res.status(201).json({
//         message: `${createdTables.count} tables initialized for the restaurant.`,
//       });
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   };
  