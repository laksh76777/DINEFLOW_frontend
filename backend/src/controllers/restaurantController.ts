import { Request, Response, NextFunction } from 'express';
import { Restaurant } from '../models/Restaurant.js';
import { AppError } from '../middleware/errorHandler.js';
import { AuthRequest } from '../middleware/auth.js';

export const restaurantController = {
  // Get restaurant profile (single restaurant system)
  async getProfile(_req: Request, res: Response, next: NextFunction) {
    try {
      let restaurant = await Restaurant.findOne();
      if (!restaurant) {
        restaurant = await Restaurant.create({
          name: 'Saffron & Sage',
          description:
            'Contemporary artisanal dining celebrating regional heritage flavors, crafted spices, and modern culinary flair.',
        });
      }

      res.json({ success: true, data: restaurant });
    } catch (err) {
      next(err);
    }
  },

  // Update restaurant profile (Owner only)
  async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      let restaurant = await Restaurant.findOne();
      if (!restaurant) {
        restaurant = new Restaurant(req.body);
      } else {
        Object.assign(restaurant, req.body);
      }

      await restaurant.save();

      res.json({
        success: true,
        message: 'Restaurant profile and branding updated successfully',
        data: restaurant,
      });
    } catch (err) {
      next(err);
    }
  },
};
