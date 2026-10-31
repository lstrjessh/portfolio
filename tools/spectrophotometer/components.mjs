// Source OBJ group indices. External laptop, PSU, and their cables are excluded.
export const components = [
  { name: 'Sample cuvette', ids: [0], offset: [0, 0, 45] },
  { name: 'Optical assembly', ids: [...Array.from({ length: 16 }, (_, i) => i + 1), 19], offset: [-40, 0, 18] },
  { name: 'Enclosure base', ids: [17], offset: [0, 0, -25] },
  { name: 'Electronics cover', ids: [18], offset: [0, 0, 60] },
  { name: 'Cuvette holder', ids: [20], offset: [35, 0, 5] },
  { name: 'Spare cuvettes', ids: [21, 22, 23, 160], offset: [35, 0, 35] },
  { name: 'Vented cover', ids: [57], offset: [0, 0, 60] },
  { name: 'Sample cap', ids: [147], offset: [0, 0, 80] },
  { name: 'Electronics assembly', ids: [...Array.from({ length: 12 }, (_, i) => i + 148), 161], offset: [0, 0, 25] },
];
export const instrumentIds = components.flatMap(component => component.ids);
