// Usuarios del sistema
const USUARIOS = [
  { id: 1, usuario: 'admin',    password: '1234', nombre: 'Ana Admin',      rol: 'administrador' },
  { id: 2, usuario: 'gerente',  password: '1234', nombre: 'Luis Gerente',   rol: 'gerente' },
  { id: 3, usuario: 'tecnico1', password: '1234', nombre: 'Pedro Técnico',  rol: 'tecnico' },
  { id: 4, usuario: 'tecnico2', password: '1234', nombre: 'María Técnica',  rol: 'tecnico' }
];

// 20 piezas industriales iniciales
const PIEZAS_SEED = [
  { codigo: 'PZ-001', nombre: 'Rodamiento SKF 6205',       categoria: 'Rodamientos',  cantidad: 25, stockMin: 10, ubicacion: 'A1-E1' },
  { codigo: 'PZ-002', nombre: 'Banda industrial B-52',      categoria: 'Transmisión',  cantidad: 8,  stockMin: 10, ubicacion: 'A1-E2' },
  { codigo: 'PZ-003', nombre: 'Filtro de aceite HF-6510',   categoria: 'Filtros',      cantidad: 30, stockMin: 15, ubicacion: 'A2-E1' },
  { codigo: 'PZ-004', nombre: 'Filtro de aire AF-2501',     categoria: 'Filtros',      cantidad: 5,  stockMin: 10, ubicacion: 'A2-E2' },
  { codigo: 'PZ-005', nombre: 'Aceite hidráulico ISO 68',   categoria: 'Lubricantes',  cantidad: 40, stockMin: 20, ubicacion: 'B1-E1' },
  { codigo: 'PZ-006', nombre: 'Grasa industrial EP2',       categoria: 'Lubricantes',  cantidad: 18, stockMin: 10, ubicacion: 'B1-E2' },
  { codigo: 'PZ-007', nombre: 'Sello mecánico 25mm',        categoria: 'Sellos',       cantidad: 12, stockMin: 8,  ubicacion: 'B2-E1' },
  { codigo: 'PZ-008', nombre: 'O-ring nitrilo 50mm',        categoria: 'Sellos',       cantidad: 0,  stockMin: 15, ubicacion: 'B2-E2' },
  { codigo: 'PZ-009', nombre: 'Motor eléctrico 2HP',        categoria: 'Eléctrico',    cantidad: 4,  stockMin: 2,  ubicacion: 'C1-E1' },
  { codigo: 'PZ-010', nombre: 'Contactor 220V 25A',         categoria: 'Eléctrico',    cantidad: 10, stockMin: 5,  ubicacion: 'C1-E2' },
  { codigo: 'PZ-011', nombre: 'Sensor de proximidad M18',   categoria: 'Sensores',     cantidad: 6,  stockMin: 4,  ubicacion: 'C2-E1' },
  { codigo: 'PZ-012', nombre: 'Sensor de temperatura PT100',categoria: 'Sensores',     cantidad: 3,  stockMin: 5,  ubicacion: 'C2-E2' },
  { codigo: 'PZ-013', nombre: 'Cadena ANSI 40',             categoria: 'Transmisión',  cantidad: 15, stockMin: 8,  ubicacion: 'A3-E1' },
  { codigo: 'PZ-014', nombre: 'Polea 3 ranuras tipo A',     categoria: 'Transmisión',  cantidad: 7,  stockMin: 4,  ubicacion: 'A3-E2' },
  { codigo: 'PZ-015', nombre: 'Válvula neumática 1/2"',     categoria: 'Neumática',    cantidad: 9,  stockMin: 6,  ubicacion: 'D1-E1' },
  { codigo: 'PZ-016', nombre: 'Cilindro neumático 32x100',  categoria: 'Neumática',    cantidad: 5,  stockMin: 3,  ubicacion: 'D1-E2' },
  { codigo: 'PZ-017', nombre: 'Manguera hidráulica R2 1/2"',categoria: 'Hidráulica',   cantidad: 20, stockMin: 10, ubicacion: 'D2-E1' },
  { codigo: 'PZ-018', nombre: 'Bomba hidráulica 10cc',      categoria: 'Hidráulica',   cantidad: 2,  stockMin: 2,  ubicacion: 'D2-E2' },
  { codigo: 'PZ-019', nombre: 'Tornillo M12 x 60mm',        categoria: 'Fijación',     cantidad: 100,stockMin: 40, ubicacion: 'E1-E1' },
  { codigo: 'PZ-020', nombre: 'Tuerca M12 galvanizada',     categoria: 'Fijación',     cantidad: 80, stockMin: 40, ubicacion: 'E1-E2' }
];

// Inicializar localStorage si no existe
function initStorage() {
  if (!localStorage.getItem('inv_piezas')) {
    localStorage.setItem('inv_piezas', JSON.stringify(PIEZAS_SEED));
  }
  if (!localStorage.getItem('inv_solicitudes')) {
    localStorage.setItem('inv_solicitudes', JSON.stringify([]));
  }
  if (!localStorage.getItem('inv_movimientos')) {
    localStorage.setItem('inv_movimientos', JSON.stringify([]));
  }
}
initStorage();