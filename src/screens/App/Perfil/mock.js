export const userProfile = {
  name: "Ana Clara Silva",
  email: "ana.clara@email.com",
  phone: "(11) 98765-4321",
  apartment: "Apto 72",
  block: "Bloco B",
  condominium: "Residencial Jardins",
  avatarUrl: require("../../../../assets/condoway-logo.png"),
  initials: "AC",
  memberSince: "Janeiro 2023",
  userType: "morador", // morador, proprietario, sindico, porteiro
  notificationsCount: 12,
  condominiumTime: "2 anos",
  documents: [
    { id: 1, name: "Regimento Interno.pdf", category: "Regras do Condomínio" },
    { id: 2, name: "Ata da Última Assembleia.pdf", category: "Assembleias" },
    { id: 3, name: "Manual do Morador.pdf", category: "Orientações" },
    { id: 4, name: "Normas de Segurança.pdf", category: "Segurança" },
  ]
};
