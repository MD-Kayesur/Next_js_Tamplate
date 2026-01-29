// redux/types/contact.type.ts

export interface WhatsAppContact {
  id: string;
  whatsappNumber: string;
  createdAt: string;
  updatedAt: string;
}

export interface PhoneContact {
  id: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmailContact {
  id: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWhatsAppRequest {
  whatsappNumber: string;
}

export interface CreatePhoneRequest {
  phone: string;
}

export interface CreateEmailRequest {
  email: string;
}