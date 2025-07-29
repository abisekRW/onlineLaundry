import { Service } from '../types';

export const defaultServices: Omit<Service, 'id'>[] = [
  {
    name: 'Normal Wash',
    description: 'Regular washing and drying service for everyday clothes',
    pricePerCloth: {
      shirt: 20,
      pant: 25,
      dress: 30,
      jacket: 50
    }
  },
  {
    name: 'Wash & Iron',
    description: 'Complete washing, drying, and ironing service',
    pricePerCloth: {
      shirt: 35,
      pant: 40,
      dress: 45,
      jacket: 70
    }
  },
  {
    name: 'Dry Clean',
    description: 'Professional dry cleaning for delicate fabrics',
    pricePerCloth: {
      shirt: 60,
      pant: 70,
      dress: 80,
      jacket: 120
    }
  },
  {
    name: 'Express Service',
    description: 'Quick 24-hour turnaround service',
    pricePerCloth: {
      shirt: 40,
      pant: 50,
      dress: 55,
      jacket: 90
    }
  }
];