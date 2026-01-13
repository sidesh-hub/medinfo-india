import { Medicine } from '@/types/medicine';

export const sampleMedicines: Record<string, Medicine> = {
  'dolo 650': {
    id: '1',
    name: 'Dolo 650',
    manufacturer: 'Micro Labs Ltd.',
    composition: 'Paracetamol 650mg',
    uses: [
      'Relief from mild to moderate pain',
      'Reduction of fever',
      'Headache relief',
      'Body aches and pain',
      'Toothache',
      'Cold and flu symptoms'
    ],
    mechanismOfAction: 'Paracetamol works by inhibiting the synthesis of prostaglandins in the central nervous system (CNS). It blocks the cyclooxygenase (COX) enzyme, reducing fever by acting on the hypothalamic heat-regulating center.',
    schedule: 'OTC',
    sideEffects: [
      'Nausea',
      'Allergic reactions (rare)',
      'Skin rash (rare)',
      'Liver damage (with overdose)',
      'Blood disorders (rare)'
    ],
    precautions: [
      'Do not exceed recommended dose',
      'Avoid alcohol consumption',
      'Use with caution in liver disease',
      'Check for paracetamol in other medications to avoid overdose',
      'Consult doctor if symptoms persist beyond 3 days'
    ],
    contraindications: [
      'Known hypersensitivity to paracetamol',
      'Severe liver impairment',
      'Acute hepatitis'
    ],
    alternatives: [
      { name: 'Crocin 650', manufacturer: 'GSK', priceRange: '₹25-30' },
      { name: 'Calpol 650', manufacturer: 'GSK', priceRange: '₹28-35' },
      { name: 'Pacimol 650', manufacturer: 'Ipca', priceRange: '₹20-25' },
      { name: 'Febrinil Plus', manufacturer: 'Zydus', priceRange: '₹22-28' }
    ],
    priceRange: {
      min: 25,
      max: 35,
      unit: 'strip of 15 tablets'
    },
    availability: 'Widely Available',
    dosageForms: ['Tablet', 'Suspension'],
    imageUrl: 'https://images.apollo247.in/pub/media/catalog/product/d/o/dol0007_1.jpg'
  },
  'azithromycin': {
    id: '2',
    name: 'Azithromycin 500',
    manufacturer: 'Various (Cipla, Sun Pharma, Zydus)',
    composition: 'Azithromycin 500mg',
    uses: [
      'Bacterial infections of respiratory tract',
      'Skin and soft tissue infections',
      'Ear infections',
      'Sexually transmitted infections',
      'Typhoid fever'
    ],
    mechanismOfAction: 'Azithromycin is a macrolide antibiotic that works by binding to the 50S ribosomal subunit of bacteria, inhibiting protein synthesis and thereby stopping bacterial growth.',
    schedule: 'Schedule H',
    sideEffects: [
      'Diarrhea',
      'Nausea and vomiting',
      'Abdominal pain',
      'Headache',
      'Dizziness',
      'QT prolongation (rare)'
    ],
    precautions: [
      'Complete the full course of antibiotics',
      'Take on empty stomach or 2 hours after meal',
      'Inform doctor about heart conditions',
      'Monitor for allergic reactions',
      'Avoid antacids within 2 hours'
    ],
    contraindications: [
      'Known allergy to azithromycin or macrolides',
      'History of cholestatic jaundice with azithromycin',
      'Severe liver disease'
    ],
    alternatives: [
      { name: 'Azee 500', manufacturer: 'Cipla', priceRange: '₹80-100' },
      { name: 'Azithral 500', manufacturer: 'Alembic', priceRange: '₹75-95' },
      { name: 'Zithromax', manufacturer: 'Pfizer', priceRange: '₹150-180' }
    ],
    priceRange: {
      min: 70,
      max: 120,
      unit: 'strip of 3 tablets'
    },
    availability: 'Prescription Only',
    dosageForms: ['Tablet', 'Suspension', 'Injection'],
    imageUrl: 'https://images.apollo247.in/pub/media/catalog/product/a/z/azi0027.jpg'
  },
  'pan d': {
    id: '3',
    name: 'Pan D',
    manufacturer: 'Alkem Laboratories',
    composition: 'Pantoprazole 40mg + Domperidone 30mg',
    uses: [
      'Gastroesophageal reflux disease (GERD)',
      'Peptic ulcer disease',
      'Acid-related indigestion',
      'Nausea and vomiting',
      'Bloating and fullness'
    ],
    mechanismOfAction: 'Pantoprazole is a proton pump inhibitor (PPI) that reduces stomach acid production by blocking the H+/K+-ATPase enzyme. Domperidone is a prokinetic that enhances gut motility by blocking dopamine receptors.',
    schedule: 'Prescription',
    sideEffects: [
      'Headache',
      'Diarrhea',
      'Nausea',
      'Flatulence',
      'Dizziness',
      'Vitamin B12 deficiency (long-term use)'
    ],
    precautions: [
      'Take 30-60 minutes before meals',
      'Not recommended for long-term use without medical supervision',
      'May mask symptoms of gastric cancer',
      'Use with caution in liver/kidney disease',
      'Avoid in patients with cardiac arrhythmias'
    ],
    contraindications: [
      'Known hypersensitivity to PPIs or domperidone',
      'Prolactin-releasing pituitary tumor',
      'GI hemorrhage, obstruction, or perforation'
    ],
    alternatives: [
      { name: 'Pantocid D', manufacturer: 'Sun Pharma', priceRange: '₹140-160' },
      { name: 'Nexpro RD', manufacturer: 'Torrent', priceRange: '₹150-180' },
      { name: 'Aciloc D', manufacturer: 'Cadila', priceRange: '₹80-100' }
    ],
    priceRange: {
      min: 120,
      max: 150,
      unit: 'strip of 15 capsules'
    },
    availability: 'Available',
    dosageForms: ['Capsule'],
    imageUrl: 'https://images.apollo247.in/pub/media/catalog/product/p/a/pan0154.jpg'
  }
};

export const findMedicine = (query: string): Medicine | null => {
  const normalizedQuery = query.toLowerCase().trim();
  
  // Direct match
  if (sampleMedicines[normalizedQuery]) {
    return sampleMedicines[normalizedQuery];
  }
  
  // Partial match
  for (const [key, medicine] of Object.entries(sampleMedicines)) {
    if (key.includes(normalizedQuery) || normalizedQuery.includes(key) ||
        medicine.name.toLowerCase().includes(normalizedQuery) ||
        medicine.composition.toLowerCase().includes(normalizedQuery)) {
      return medicine;
    }
  }
  
  return null;
};
