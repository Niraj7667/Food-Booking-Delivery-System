// services/orderService.ts
import { PrismaClient } from '@prisma/client'
import { 
  CreateOrderRequestDTO, 
  MenuItemSelectionDTO, 
  OrderType, 
  OrderStatus,
  PaymentMethod 
} from '../types/order'

export class OrderService {
  private prisma: PrismaClient

  constructor() {
    this.prisma = new PrismaClient()
  }

    // Method to check if an order already exists
  async findExistingOrder(criteria: { userId: string, restaurantId: string, menuItems: any[], orderType: string }) {
    return await this.prisma.order.findFirst({
      where: {
        userId: criteria.userId,
        restaurantId: criteria.restaurantId,
        orderType: criteria.orderType,
        status: { in: [OrderStatus.PENDING, OrderStatus.PREPARING] }, // Only consider active orders
        menuItems: {
          some: {
            // Assuming menuItems is an array of objects with menuItemId and quantity
            menuItemId: { in: criteria.menuItems.map(item => item.menuItemId) },
            quantity: { in: criteria.menuItems.map(item => item.quantity) },
          },
        },
      },
    });
  }

  async createOrder(orderData: CreateOrderRequestDTO): Promise<any> {
    // Validate menu items exist and belong to the restaurant
    const menuItems = await this.validateMenuItems(
      orderData.restaurantId, 
      orderData.menuItems
    )

    // Calculate total amount
    const totalAmount = menuItems.reduce((total, item, index) => {
      const selectedItem = orderData.menuItems[index]
      return total + (item.price * selectedItem.quantity)
    }, 0)

    // Validate order type specific requirements
    this.validateOrderTypeRequirements(orderData)

    // Create order
    const order = await this.prisma.order.create({
      data: {
        userId: orderData.userId,
        restaurantId: orderData.restaurantId,
        orderType: orderData.orderType,
        status: OrderStatus.PENDING,
        totalAmount: totalAmount,
        deliveryAddress: orderData.deliveryAddress,
        mealTime: orderData.mealTime,
        paymentMethod: orderData.paymentMethod || PaymentMethod.ONLINE_PAYMENT,
        items: JSON.stringify(orderData.menuItems),
        menuItems: {
          create: orderData.menuItems.map(item => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity
          }))
        }
      }
    })

    return {
      id: order.id,
      totalAmount: order.totalAmount,
      status: order.status,
      orderType: order.orderType as OrderType
    }
  }

  private async validateMenuItems(restaurantId: string, menuItems: MenuItemSelectionDTO[]) {
    const validatedItems = await Promise.all(
      menuItems.map(async (item) => {
        const menuItem = await this.prisma.menuItem.findUnique({
          where: { 
            id: item.menuItemId, 
            restaurantId: restaurantId 
          }
        })

        if (!menuItem) {
          throw new Error(`Menu item ${item.menuItemId} not found or does not belong to this restaurant`)
        }

        return menuItem
      })
    )

    return validatedItems
  }

  private validateOrderTypeRequirements(orderData: CreateOrderRequestDTO) {
    switch(orderData.orderType) {
      case OrderType.HOME_DELIVERY:
        if (!orderData.deliveryAddress) {
          throw new Error('Delivery address is required for home delivery')
        }
        break
      case OrderType.DINE_IN_ADVANCE:
        if (!orderData.mealTime) {
          throw new Error('Meal time is required for dine-in advance orders')
        }
        break
      default:
        throw new Error('Invalid order type')
    }
  }

  
}

