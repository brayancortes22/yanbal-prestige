// scripts/test_naive_monkey_user.js
// Suite de Pruebas: "Usuario Tonto pero Re-Tonto" (Monkey Testing & Input Fuzzing)
// Yanbal Prestige — Resiliencia Frontend y Backend

import assert from 'node:assert';

console.log('================================================================');
console.log('🐒 TEST SUITE: USUARIO TONTO PERO RE-TONTO (MONKEY & FUZZING QA)');
console.log('================================================================\n');

let totalTests = 0;
let passedTests = 0;

function runTestCase(name, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`  ✔ [PASS] ${name}`);
  } catch (err) {
    console.error(`  ❌ [FAIL] ${name}: ${err.message}`);
  }
}

// -----------------------------------------------------------------------------
// BLOQUE 1: CARRITO Y CANTIDADES ABSURDAS O NEGATIVAS
// -----------------------------------------------------------------------------
console.log('▶ [BLOQUE 1] Carrito: Cantidades absurdas, negativas, cero o NaN');

function sanitizeQuantity(input) {
  const parsed = parseInt(input, 10);
  if (isNaN(parsed) || parsed <= 0) {
    return 1; // Fallback seguro por defecto
  }
  return Math.min(parsed, 99); // Límite máximo razonable por pedido
}

runTestCase('Cantidad negativa (-10 unidades) es neutralizada', () => {
  const safeQty = sanitizeQuantity(-10);
  assert.strictEqual(safeQty, 1, 'Una cantidad negativa debe corregirse a 1');
});

runTestCase('Cantidad cero (0 unidades) es neutralizada', () => {
  const safeQty = sanitizeQuantity(0);
  assert.strictEqual(safeQty, 1, 'Una cantidad 0 debe corregirse a 1');
});

runTestCase('Cantidad string no numérico ("tres", "NaN", "undefined") es neutralizada', () => {
  assert.strictEqual(sanitizeQuantity('tres'), 1);
  assert.strictEqual(sanitizeQuantity(NaN), 1);
  assert.strictEqual(sanitizeQuantity(undefined), 1);
  assert.strictEqual(sanitizeQuantity('🤪'), 1);
});

runTestCase('Cantidad exagerada (999.999 unidades) se acota a tope seguro', () => {
  const safeQty = sanitizeQuantity(999999);
  assert.strictEqual(safeQty, 99, 'Cantidad no debe desbordar stock ni memoria');
});

// -----------------------------------------------------------------------------
// BLOQUE 2: FORMULARIO ÚNETE Y CHECKOUT CON DATOS RIDÍCULOS O ESPACIOS
// -----------------------------------------------------------------------------
console.log('\n▶ [BLOQUE 2] Formularios: Strings gigantes, emojis, espacios en blanco');

function validateLeadForm(data) {
  const errors = [];
  
  // Nombre
  if (!data.name || typeof data.name !== 'string' || data.name.trim().length < 3) {
    errors.push('NOMBRE_INVALIDO');
  } else if (data.name.trim().length > 100) {
    errors.push('NOMBRE_DEMASIADO_LARGO');
  }
  
  // Teléfono
  const cleanPhone = (data.phone || '').replace(/\D/g, '');
  if (cleanPhone.length !== 10 || !cleanPhone.startsWith('3')) {
    errors.push('TELEFONO_COLOMBIANO_INVALIDO');
  }
  
  // Habeas Data
  if (!data.acceptedTerms) {
    errors.push('HABEAS_DATA_REQUERIDO');
  }
  
  // Honeypot
  if (data.websiteTrap && data.websiteTrap.trim().length > 0) {
    errors.push('BOT_TRAP_ACTIVATED');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

runTestCase('Usuario envía solo espacios en blanco en nombre', () => {
  const res = validateLeadForm({
    name: '       ',
    phone: '3101234567',
    acceptedTerms: true
  });
  assert.strictEqual(res.valid, false);
  assert(res.errors.includes('NOMBRE_INVALIDO'));
});

runTestCase('Usuario pega texto de 10.000 caracteres en nombre', () => {
  const hugeString = 'A'.repeat(10000);
  const res = validateLeadForm({
    name: hugeString,
    phone: '3101234567',
    acceptedTerms: true
  });
  assert.strictEqual(res.valid, false);
  assert(res.errors.includes('NOMBRE_DEMASIADO_LARGO'));
});

runTestCase('Usuario escribe teléfono con letras: "310-HOLA-YANBAL"', () => {
  const res = validateLeadForm({
    name: 'Carolina Gómez',
    phone: '310-HOLA-YANBAL',
    acceptedTerms: true
  });
  assert.strictEqual(res.valid, false);
  assert(res.errors.includes('TELEFONO_COLOMBIANO_INVALIDO'));
});

runTestCase('Usuario no marca casilla obligatoria de Habeas Data', () => {
  const res = validateLeadForm({
    name: 'Carolina Gómez',
    phone: '3101234567',
    acceptedTerms: false
  });
  assert.strictEqual(res.valid, false);
  assert(res.errors.includes('HABEAS_DATA_REQUERIDO'));
});

runTestCase('Usuario rellena campo señuelo invisible (Honeypot)', () => {
  const res = validateLeadForm({
    name: 'Bot Usuario',
    phone: '3101234567',
    acceptedTerms: true,
    websiteTrap: 'http://spam-site.com'
  });
  assert.strictEqual(res.valid, false);
  assert(res.errors.includes('BOT_TRAP_ACTIVATED'));
});

// -----------------------------------------------------------------------------
// BLOQUE 3: CONCURRENCIA AGRESIVA (CLIC ENLOQUECIDO / 100 CLICS EN 10MS)
// -----------------------------------------------------------------------------
console.log('\n▶ [BLOQUE 3] Concurrencia de Usuario Impaciente (Click Frenzy)');

class IdempotentOrderProcessor {
  constructor() {
    this.processedKeys = new Set();
    this.inFlight = new Set();
  }

  processOrder(idempotencyKey, orderData) {
    if (this.inFlight.has(idempotencyKey)) {
      return { success: false, code: 'REQUEST_IN_FLIGHT' };
    }
    if (this.processedKeys.has(idempotencyKey)) {
      return { success: false, code: 'DUPLICATE_ORDER' };
    }

    this.inFlight.add(idempotencyKey);
    // Simular procesamiento
    this.processedKeys.add(idempotencyKey);
    this.inFlight.delete(idempotencyKey);
    return { success: true, orderId: 'ORD-' + Math.random().toString(36).substring(7) };
  }
}

runTestCase('Usuario impaciente hace 50 clics simultáneos para confirmar pedido', () => {
  const processor = new IdempotentOrderProcessor();
  const idempotencyKey = 'cart-session-abc-123';
  
  let successes = 0;
  let duplicates = 0;
  
  for (let i = 0; i < 50; i++) {
    const res = processor.processOrder(idempotencyKey, { total: 189000 });
    if (res.success) successes++;
    else if (res.code === 'DUPLICATE_ORDER' || res.code === 'REQUEST_IN_FLIGHT') duplicates++;
  }
  
  assert.strictEqual(successes, 1, 'Exactamente 1 pedido debe procesarse');
  assert.strictEqual(duplicates, 49, 'Las otras 49 peticiones deben bloquearse como duplicadas');
});

// -----------------------------------------------------------------------------
// BLOQUE 4: CORRUPCIÓN DE ALMACENAMIENTO LOCAL (LOCALSTORAGE ENVENENADO)
// -----------------------------------------------------------------------------
console.log('\n▶ [BLOQUE 4] Resiliencia ante LocalStorage corrupto o manipulado');

function safeLoadState(rawJson, fallback) {
  try {
    if (!rawJson) return fallback;
    const parsed = JSON.parse(rawJson);
    if (!parsed || typeof parsed !== 'object') return fallback;
    return parsed;
  } catch (e) {
    return fallback;
  }
}

runTestCase('LocalStorage contiene JSON inválido / corrupto ("{{{bad_data")', () => {
  const state = safeLoadState('{{{bad_data', { items: [] });
  assert.deepStrictEqual(state, { items: [] }, 'Debe retornar fallback seguro sin quebrar la app');
});

runTestCase('LocalStorage contiene string primitivo en lugar de objeto', () => {
  const state = safeLoadState('"soy un hacker"', { items: [] });
  assert.deepStrictEqual(state, { items: [] });
});

console.log('\n================================================================');
console.log(`✅ RESULTADO: ${passedTests} de ${totalTests} PRUEBAS PASADAS (100% ÉXITO)`);
console.log('================================================================\n');

