export const allPackages = [
  { 
    id: 1, 
    store: "Amazon", 
    trackingCode: "AMZ987654321BR", 
    status: "awaiting_pickup", 
    arrivalDate: new Date(), // Hoje
  },
  { 
    id: 2, 
    store: "Mercado Livre", 
    trackingCode: "ML555444333BR", 
    status: "awaiting_pickup", 
    arrivalDate: new Date(Date.now() - 86400000 * 1), // Ontem
  },
  { 
    id: 3, 
    store: "Shopee", 
    trackingCode: "SHP123456789BR", 
    status: "delivered", 
    arrivalDate: new Date(Date.now() - 86400000 * 2), // 2 dias atrás
  },
  { 
    id: 4, 
    store: "AliExpress", 
    trackingCode: "ALI998877665BR", 
    status: "delivered", 
    arrivalDate: new Date(Date.now() - 86400000 * 5), // 5 dias atrás
  },
  { 
    id: 5, 
    store: "Amazon", 
    trackingCode: "AMZ112233445BR", 
    status: "delivered", 
    arrivalDate: new Date("2025-07-25T10:00:00"), // Mês passado
  },
];
