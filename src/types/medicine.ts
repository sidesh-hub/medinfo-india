export interface Medicine {
  id: string;
  name: string;
  manufacturer: string;
  composition: string;
  uses: string[];
  mechanismOfAction?: string;
  schedule: 'OTC' | 'Prescription' | 'Schedule H' | 'Schedule H1' | 'Schedule X';
  sideEffects: string[];
  precautions: string[];
  contraindications: string[];
  alternatives: Alternative[];
  priceRange: {
    min: number;
    max: number;
    unit: string;
  };
  availability: 'Widely Available' | 'Available' | 'Limited' | 'Prescription Only';
  imageUrl?: string;
  dosageForms: string[];
}

export interface Alternative {
  name: string;
  manufacturer: string;
  priceRange?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  medicineData?: Medicine;
  isTyping?: boolean;
}
