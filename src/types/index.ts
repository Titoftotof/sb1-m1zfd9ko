export type Child = {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  gender: 'male' | 'female';
  photo?: string;
  parentInfo: {
    parent1: {
      firstName: string;
      lastName: string;
      phone: string;
      email: string;
      address: string;
    };
    parent2?: {
      firstName: string;
      lastName: string;
      phone: string;
      email: string;
      address: string;
    };
  };
  medicalInfo: {
    allergies: string[];
    medications: string[];
    emergencyContacts: {
      name: string;
      relationship: string;
      phone: string;
    }[];
    doctorName: string;
    doctorPhone: string;
    notes: string;
  };
  authorizedPickups: {
    name: string;
    relationship: string;
    phone: string;
  }[];
};

export type Contract = {
  id: string;
  childId: string;
  startDate: string;
  endDate?: string;
  type: 'CDI' | 'CDD';
  hoursPerWeek: number;
  // daysPerWeek: number[]; // Peut être dérivé de regularSchedule
  hourlyRate: number;
  maintenanceAllowance: number;
  mealsProvided: boolean;
  mealAllowance?: number;
  documentsUrl: string[];
  status: 'active' | 'inactive' | 'pending';
  notes?: string;
  regularSchedule?: RegularScheduleEntry[]; // Horaires habituels
  monthlySchedule?: PlannedDay[]; // NOUVELLE PROPRIÉTÉ pour le planning mensuel détaillé
};

export type PlannedDay = {
  date: string; // Format YYYY-MM-DD
  startTime?: string; // Format HH:MM, optionnel si c'est un jour d'absence prévue
  endTime?: string;   // Format HH:MM, optionnel
  status: 'planned' | 'absent_planned' | 'holiday_planned'; // Pour distinguer une présence planifiée d'une absence ou d'un congé
  notes?: string;
};

export type RegularScheduleEntry = {
  dayOfWeek: number; // 0 pour Dimanche, 1 pour Lundi, ..., 6 pour Samedi
  startTime: string; // Format HH:MM
  endTime: string;   // Format HH:MM
};

export type DailyRecord = {
  id: string;
  childId: string;
  date: string;
  meals: {
    breakfast?: {
      time: string;
      description: string;
      eaten: 'well' | 'average' | 'poorly';
    };
    lunch?: {
      time: string;
      description: string;
      eaten: 'well' | 'average' | 'poorly';
    };
    snack?: {
      time: string;
      description: string;
      eaten: 'well' | 'average' | 'poorly';
    };
  };
  naps: {
    startTime: string;
    endTime: string;
    quality: 'good' | 'average' | 'poor';
  }[];
  activities: string[];
  mood: 'happy' | 'calm' | 'sad' | 'upset' | 'tired';
  notes: string;
  photos?: string[];
};

export type Attendance = {
  id: string;
  childId: string;
  date: string;
  arrivalTime: string | null; // Doit pouvoir être null pour une absence
  departureTime?: string | null; // Doit pouvoir être null ou undefined
  status: 'présent' | 'absent' | 'malade' | 'vacances' | 'férié' | 'parti'; // Statuts en français
  notes?: string;
};

export type Invoice = {
  id: string;
  childId: string;
  contractId: string;
  month: number;
  year: number;
  baseAmount: number;
  overtimeHours: number;
  overtimeAmount: number;
  maintenanceAllowance: number;
  mealsAllowance: number;
  totalAmount: number;
  status: 'draft' | 'sent' | 'paid';
  paidDate?: string;
  paidAmount?: number;
  notes?: string;
};
