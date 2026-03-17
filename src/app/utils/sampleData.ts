import { TreeData } from './storage';

// Sample tree data for demonstration
export const sampleTrees: TreeData[] = [
  {
    id: 'tree_sample_001',
    name: 'Heritage Narra Tree',
    species: 'Narra',
    healthStatus: 'Excellent',
    age: 50,
    latitude: 14.5995,
    longitude: 120.9842,
    dateAdded: '2026-03-01T08:30:00.000Z',
    addedBy: 'field_user',
  },
  {
    id: 'tree_sample_002',
    name: 'Central Park Mahogany',
    species: 'Mahogany',
    healthStatus: 'Good',
    age: 25,
    latitude: 14.6010,
    longitude: 120.9850,
    dateAdded: '2026-03-02T09:15:00.000Z',
    addedBy: 'field_user',
  },
  {
    id: 'tree_sample_003',
    name: 'Acacia Boulevard North',
    species: 'Acacia',
    healthStatus: 'Fair',
    age: 15,
    latitude: 14.6025,
    longitude: 120.9865,
    dateAdded: '2026-03-03T10:00:00.000Z',
    addedBy: 'field_user',
  },
  {
    id: 'tree_sample_004',
    name: 'Riverside Mango',
    species: 'Mango',
    healthStatus: 'Good',
    age: 30,
    latitude: 14.5980,
    longitude: 120.9830,
    dateAdded: '2026-03-05T07:45:00.000Z',
    addedBy: 'admin_user',
  },
  {
    id: 'tree_sample_005',
    name: 'School Ground Pine',
    species: 'Pine',
    healthStatus: 'Excellent',
    age: 20,
    latitude: 14.6040,
    longitude: 120.9880,
    dateAdded: '2026-03-07T11:30:00.000Z',
    addedBy: 'field_user',
  },
  {
    id: 'tree_sample_006',
    name: 'Market Square Ipil-ipil',
    species: 'Ipil-ipil',
    healthStatus: 'Poor',
    age: 8,
    latitude: 14.5970,
    longitude: 120.9820,
    dateAdded: '2026-03-10T14:20:00.000Z',
    addedBy: 'field_user',
  },
  {
    id: 'tree_sample_007',
    name: 'Plaza Molave',
    species: 'Molave',
    healthStatus: 'Excellent',
    age: 45,
    latitude: 14.6055,
    longitude: 120.9895,
    dateAdded: '2026-03-12T08:00:00.000Z',
    addedBy: 'admin_user',
  },
  {
    id: 'tree_sample_008',
    name: 'Hillside Dao',
    species: 'Dao',
    healthStatus: 'Good',
    age: 35,
    latitude: 14.5965,
    longitude: 120.9810,
    dateAdded: '2026-03-14T09:45:00.000Z',
    addedBy: 'field_user',
  },
];

// Function to initialize sample data if storage is empty
export function initializeSampleData(): void {
  const existingTrees = localStorage.getItem('menro_trees');
  if (!existingTrees || JSON.parse(existingTrees).length === 0) {
    localStorage.setItem('menro_trees', JSON.stringify(sampleTrees));
  }
}
