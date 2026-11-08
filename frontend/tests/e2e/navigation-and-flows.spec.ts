import { test, expect } from '@playwright/test';

test.describe('Yanbal Prestige - E2E Core Flows & Accessibility', () => {

  test('1. Navegación Principal y Catálogo Botánico', async ({ page }) => {
    await page.goto('/');

    // Validar Header y Brand
    await expect(page.locator('header')).toBeVisible();
    await expect(page.getByText('YANBAL Prestige')).toBeVisible();

    // Navegar a Catálogo
    const catalogNav = page.getByRole('link', { name: 'Catálogo' }).first();
    await catalogNav.click();
    await expect(page).toHaveURL(/.*catalogo/);

    // Verificar que los productos se renderizan
    const productCards = page.locator('article, [data-testid="product-card"]');
    await expect(productCards.first()).toBeVisible({ timeout: 5000 });
  });

  test('2. Sección de Eventos y Masterclasses', async ({ page }) => {
    await page.goto('/eventos');
    await expect(page).toHaveURL(/.*eventos/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('3. Sección de Consejos y Tips de Belleza', async ({ page }) => {
    await page.goto('/tips');
    await expect(page).toHaveURL(/.*tips/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('4. Flujo de Postulación "Trabaja con Nosotros" (Lead)', async ({ page }) => {
    await page.goto('/unete');
    await expect(page).toHaveURL(/.*unete/);

    // Formulario de inscripción
    const nameInput = page.getByLabel(/Nombre/i).or(page.getByPlaceholder(/nombre/i)).first();
    const phoneInput = page.getByLabel(/Teléfono|WhatsApp/i).or(page.getByPlaceholder(/teléfono|celular/i)).first();

    await expect(nameInput).toBeVisible();
    await expect(phoneInput).toBeVisible();
  });

  test('5. Acceso al Panel Administrativo CMS y Facturación', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByLabel(/Correo/i).or(page.getByPlaceholder(/correo/i)).first()).toBeVisible();
    await expect(page.getByLabel(/Contraseña/i).or(page.getByPlaceholder(/contraseña/i)).first()).toBeVisible();
  });

});
