// src/types/order.ts or src/dtos/order.dto.ts

// Enum for Order Types
export enum OrderType {
    HOME_DELIVERY = 'HOME_DELIVERY',
    DINE_IN_ADVANCE = 'DINE_IN_ADVANCE'
  }
  
  // Enum for Order Status
  export enum OrderStatus {
    PENDING = 'PENDING',
    PREPARING = 'PREPARING',
    READY = 'READY',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED'
  }
  
  // Enum for Payment Methods
  export enum PaymentMethod {
    ONLINE_PAYMENT = 'ONLINE_PAYMENT',
    CASH_ON_DELIVERY = 'CASH_ON_DELIVERY',
    PAY_AT_RESTAURANT = 'PAY_AT_RESTAURANT'
  }
  
  // DTO for Menu Item Selection
  export interface MenuItemSelectionDTO {
    menuItemId: string;  // Unique identifier of the menu item
    quantity: number;    // Number of this item being ordered
  }
  
  // DTO for Order Creation Request
  export interface CreateOrderRequestDTO {
    userId: string;              // ID of the user placing the order
    restaurantId: string;        // ID of the restaurant
    menuItems: MenuItemSelectionDTO[];  // List of menu items with quantities
    orderType: OrderType;        // Type of order (delivery or dine-in)
    
    // Conditional fields based on order type
    deliveryAddress?: string;    // Required for HOME_DELIVERY
    mealTime?: Date;             // Required for DINE_IN_ADVANCE
    
    // Optional additional details
    specialInstructions?: string;
    paymentMethod?: PaymentMethod;
  }
  
  // DTO for Order Response
  export interface OrderResponseDTO {
    id: string;                  // Unique order identifier
    userId: string;              // User who placed the order
    restaurantId: string;        // Restaurant where order is placed
    orderType: OrderType;        // Type of order
    status: OrderStatus;         // Current status of the order
    totalAmount: number;         // Total cost of the order
    
    // Conditional fields based on order type
    deliveryAddress?: string;
    mealTime?: Date;
    
    // Order items details
    items: {
      menuItemId: string;
      name: string;
      quantity: number;
      price: number;
    }[];
    
    createdAt: Date;
    updatedAt: Date;
  }