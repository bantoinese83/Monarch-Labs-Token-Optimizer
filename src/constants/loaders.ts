// Loader types
export const LOADER_TYPES = {
  SPHERE_SCAN: 'sphere-scan',
  CRYSTALLINE_REFRACTION: 'crystalline-refraction',
  SONAR_SWEEP: 'sonar-sweep',
  HELIX_SCANNER: 'helix-scanner',
  INTERCONNECTING_WAVES: 'interconnecting-waves',
  CYLINDRICAL_ANALYSIS: 'cylindrical-analysis',
  VOXEL_MATRIX_MORPH: 'voxel-matrix-morph',
  PHASED_ARRAY_EMITTER: 'phased-array-emitter',
  CRYSTALLINE_CUBE_REFRACTION: 'crystalline-cube-refraction',
} as const;

export type LoaderType = (typeof LOADER_TYPES)[keyof typeof LOADER_TYPES];

// Default loader type
export const DEFAULT_LOADER_TYPE: LoaderType = LOADER_TYPES.HELIX_SCANNER;

// Loader options for UI
export const LOADER_OPTIONS: Array<{ value: LoaderType; label: string }> = [
  { value: LOADER_TYPES.HELIX_SCANNER, label: 'Helix Scanner' },
  { value: LOADER_TYPES.SPHERE_SCAN, label: '3D Sphere Scan' },
  { value: LOADER_TYPES.SONAR_SWEEP, label: 'Sonar Sweep' },
  { value: LOADER_TYPES.CRYSTALLINE_REFRACTION, label: 'Crystalline Refraction' },
  { value: LOADER_TYPES.INTERCONNECTING_WAVES, label: 'Interconnecting Waves' },
  { value: LOADER_TYPES.CYLINDRICAL_ANALYSIS, label: 'Cylindrical Analysis' },
  { value: LOADER_TYPES.VOXEL_MATRIX_MORPH, label: 'Voxel Matrix Morph' },
  { value: LOADER_TYPES.PHASED_ARRAY_EMITTER, label: 'Phased Array Emitter' },
  { value: LOADER_TYPES.CRYSTALLINE_CUBE_REFRACTION, label: 'Crystalline Cube Refraction' },
];
