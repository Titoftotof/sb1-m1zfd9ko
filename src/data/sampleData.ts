import { Child, Contract, DailyRecord } from '../types';

export const sampleChildren: Child[] = [
  {
    id: '1',
    firstName: 'Emma',
    lastName: 'Martin',
    birthDate: '2021-05-12',
    gender: 'female',
    photo: 'https://images.pexels.com/photos/35537/child-children-girl-happy.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    parentInfo: {
      parent1: {
        firstName: 'Sophie',
        lastName: 'Martin',
        phone: '06 12 34 56 78',
        email: 'sophie.martin@example.com',
        address: '24 rue des Fleurs, 75001 Paris',
      },
      parent2: {
        firstName: 'Thomas',
        lastName: 'Martin',
        phone: '06 23 45 67 89',
        email: 'thomas.martin@example.com',
        address: '24 rue des Fleurs, 75001 Paris',
      },
    },
    medicalInfo: {
      allergies: ['Arachides'],
      medications: [],
      emergencyContacts: [
        {
          name: 'Marie Dupont',
          relationship: 'Grand-mère',
          phone: '06 34 56 78 90',
        },
      ],
      doctorName: 'Dr. Bernard',
      doctorPhone: '01 23 45 67 89',
      notes: 'Légère tendance aux otites',
    },
    authorizedPickups: [
      {
        name: 'Marie Dupont',
        relationship: 'Grand-mère',
        phone: '06 34 56 78 90',
      },
    ],
  },
  {
    id: '2',
    firstName: 'Lucas',
    lastName: 'Petit',
    birthDate: '2022-01-18',
    gender: 'male',
    photo: 'https://images.pexels.com/photos/1648377/pexels-photo-1648377.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    parentInfo: {
      parent1: {
        firstName: 'Julie',
        lastName: 'Petit',
        phone: '06 45 67 89 01',
        email: 'julie.petit@example.com',
        address: '8 avenue des Lilas, 75007 Paris',
      },
      parent2: {
        firstName: 'Marc',
        lastName: 'Petit',
        phone: '06 56 78 90 12',
        email: 'marc.petit@example.com',
        address: '8 avenue des Lilas, 75007 Paris',
      },
    },
    medicalInfo: {
      allergies: [],
      medications: [],
      emergencyContacts: [
        {
          name: 'Paul Petit',
          relationship: 'Grand-père',
          phone: '06 67 89 01 23',
        },
      ],
      doctorName: 'Dr. Lambert',
      doctorPhone: '01 34 56 78 90',
      notes: '',
    },
    authorizedPickups: [
      {
        name: 'Paul Petit',
        relationship: 'Grand-père',
        phone: '06 67 89 01 23',
      },
    ],
  },
];

export const sampleContracts: Contract[] = [
  {
    id: '1',
    childId: '1',
    startDate: '2022-01-10',
    type: 'CDI',
    hoursPerWeek: 40,
    // daysPerWeek: [1, 2, 3, 4, 5],
    regularSchedule: [
      { dayOfWeek: 1, startTime: '08:30', endTime: '16:30' },
      { dayOfWeek: 2, startTime: '08:30', endTime: '16:30' },
      { dayOfWeek: 3, startTime: '08:30', endTime: '16:30' },
      { dayOfWeek: 4, startTime: '08:30', endTime: '16:30' },
      { dayOfWeek: 5, startTime: '08:30', endTime: '16:30' },
    ],
    hourlyRate: 5.5,
    maintenanceAllowance: 4.0,
    mealsProvided: true,
    mealAllowance: 5.0,
    documentsUrl: ['contract_emma_1.pdf'],
    status: 'active',
    notes: 'Accueil du lundi au vendredi de 8h30 à 16h30',
  },
  {
    id: '2',
    childId: '2',
    startDate: '2022-09-01',
    type: 'CDI',
    hoursPerWeek: 30,
    // daysPerWeek: [1, 2, 3],
    regularSchedule: [
      { dayOfWeek: 1, startTime: '09:00', endTime: '19:00' },
      { dayOfWeek: 2, startTime: '09:00', endTime: '19:00' },
      { dayOfWeek: 3, startTime: '09:00', endTime: '19:00' },
    ],
    hourlyRate: 5.0,
    maintenanceAllowance: 3.5,
    mealsProvided: true,
    mealAllowance: 4.5,
    documentsUrl: ['contract_lucas_1.pdf'],
    status: 'active',
    notes: 'Accueil lundi, mardi, mercredi de 9h à 19h',
  },
];

export const sampleDailyRecords: DailyRecord[] = [
  {
    id: '1',
    childId: '1',
    date: '2023-05-15',
    meals: {
      breakfast: {
        time: '09:00',
        description: 'Céréales et lait',
        eaten: 'well',
      },
      lunch: {
        time: '12:30',
        description: 'Purée de carottes, poulet, compote de pommes',
        eaten: 'average',
      },
      snack: {
        time: '16:00',
        description: 'Yaourt et biscuit',
        eaten: 'well',
      },
    },
    naps: [
      {
        startTime: '13:00',
        endTime: '15:00',
        quality: 'good',
      },
    ],
    activities: ['Jeux d\'éveil', 'Lecture', 'Jeux extérieurs'],
    mood: 'happy',
    notes: 'Excellente journée, Emma a beaucoup joué dehors',
    photos: ['emma_playing.jpg'],
  },
  {
    id: '2',
    childId: '2',
    date: '2023-05-15',
    meals: {
      breakfast: {
        time: '09:30',
        description: 'Biberon 240ml',
        eaten: 'well',
      },
      lunch: {
        time: '12:00',
        description: 'Purée de légumes, compote',
        eaten: 'average',
      },
      snack: {
        time: '15:30',
        description: 'Yaourt et compote',
        eaten: 'well',
      },
    },
    naps: [
      {
        startTime: '10:30',
        endTime: '11:30',
        quality: 'average',
      },
      {
        startTime: '13:00',
        endTime: '15:00',
        quality: 'good',
      },
    ],
    activities: ['Jeux sensoriels', 'Musique', 'Jouets d\'éveil'],
    mood: 'calm',
    notes: 'Journée calme, Lucas a apprécié les activités musicales',
    photos: ['lucas_music.jpg'],
  },
];
