# 🎨 Guía de Generación y Sincronización con Figma Desktop

Este documento detalla cómo visualizar y editar el diseño de **Yanbal Prestige** directamente en tu aplicación **Figma Desktop** con Auto-Layout nativo y fidelidad 1:1.

---

## ⚡ Método 1: Importación Directa en 1 Clic desde el Servidor Local (Recomendado)

El servidor de desarrollo de React + Vite está corriendo en tu máquina en:
```
http://localhost:5173/
```

### Pasos en Figma Desktop:
1. Abre **Figma Desktop** y crea un nuevo lienzo o abre tu archivo de diseño.
2. Presiona `Ctrl + P` (o ve al menú de **Plugins**) y busca:
   👉 **"html.to.design"** (o *"Builder.io - Figma to Code"*).
3. Selecciona la pestaña **"Import via URL"**.
4. Ingresa la URL local:
   ```
   http://localhost:5173/
   ```
5. Elige los breakpoints que deseas generar:
   - **Desktop:** 1440px
   - **Tablet:** 768px
   - **Mobile:** 390px (iPhone 14/15)
6. Haz clic en **"Import"**.
7. En segundos, Figma Desktop construirá todos los frames vectoriales con las fuentes `Playfair Display`, `Plus Jakarta Sans`, imágenes en alta definición, botones con border-radius real y el Acordeón de Imágenes de Ultraprotección.

---

## 🎨 Método 2: Tokens de Diseño para Tokens Studio en Figma Desktop

Si utilizas el plugin **Tokens Studio for Figma (Figma Tokens)**:
1. Abre el plugin en Figma Desktop.
2. Selecciona **Load from JSON**.
3. Carga el archivo:
   `c:\Users\NITRO ACER\Desktop\proyectos con ia\yanbal-prestige\figma\figma_design_tokens.json`
4. Se importarán automáticamente los estilos de color (`Warm Apricot`, `Champagne Silk`, `Stone 900`), escalas tipográficas, sombras y radios de borde.
