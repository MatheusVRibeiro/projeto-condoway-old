export const environments = [
    { 
        id: 1, 
        name: "Salão de Festas", 
        capacity: 50, 
        description: "Espaço amplo para eventos e confraternizações.", 
        available: true, 
        rules: ["Limpeza obrigatória após o uso.", "Som permitido em volume ambiente até às 22h.", "Proibido uso de confetes ou serpentinas."], 
        items: ["Mesas e Cadeiras", "Freezer", "Microondas"], 
    },
    { 
        id: 2, 
        name: "Churrasqueira", 
        capacity: 20, 
        description: "Área gourmet com churrasqueira e forno de pizza.", 
        available: true, 
        rules: ["Morador deve levar próprio carvão e utensílios.", "Não deixar restos de comida na grelha."], 
        items: ["Grelha", "Forno de Pizza", "Bancada com Pia"],
    },
    { 
        id: 3, 
        name: "Quadra de Tênis", 
        capacity: 4, 
        description: "Quadra oficial para a prática de tênis.", 
        available: false, 
        rules: ["Uso de calçado apropriado é obrigatório.", "Máximo de 1h por reserva em dias de alta demanda."], 
        items: ["Rede Oficial"],
    },
];

// Simula todas as reservas no sistema para verificar disponibilidade
export const allExistingReservations = [
    { id: 101, environmentName: "Salão de Festas", date: "2025-08-15", time: "19:00", status: 'confirmada' },
    { id: 102, environmentName: "Churrasqueira", date: "2025-08-22", time: "12:00", status: 'pendente' },
    { id: 103, environmentName: "Churrasqueira", date: new Date().toISOString().split('T')[0], time: "14:00", status: 'confirmada' },
    { id: 104, environmentName: "Churrasqueira", date: new Date().toISOString().split('T')[0], time: "16:00", status: 'confirmada' },
    { id: 105, environmentName: "Salão de Festas", date: "2025-07-20", time: "18:00", status: 'confirmada' },
];

// Apenas as reservas do morador logado
export const myInitialReservations = allExistingReservations.filter(r => [101, 102, 105].includes(r.id));
