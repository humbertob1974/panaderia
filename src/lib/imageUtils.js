// Comprime una imagen en el navegador y la devuelve como data URL (webp).
// Se guarda directamente en Firestore, así no se necesita Firebase Storage
// (que requiere el plan de pago Blaze en proyectos nuevos).

// Firestore permite ~1MB por campo; dejamos margen de sobra.
const MAX_DATA_URL_LENGTH = 850_000

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('No se pudo leer la imagen'))
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('Archivo de imagen no válido'))
      img.onload = () => resolve(img)
      img.src = reader.result
    }
    reader.readAsDataURL(file)
  })
}

export async function compressImage(file, { maxSize = 900, quality = 0.8 } = {}) {
  const img = await loadImage(file)

  // Intenta con calidad/tamaño decrecientes hasta caber en el límite.
  const attempts = [
    { size: maxSize, q: quality },
    { size: maxSize, q: 0.6 },
    { size: maxSize * 0.75, q: 0.5 },
    { size: maxSize * 0.5, q: 0.5 },
    { size: maxSize * 0.35, q: 0.4 },
  ]

  for (const { size, q } of attempts) {
    const scale = Math.min(1, size / Math.max(img.width, img.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(img.width * scale))
    canvas.height = Math.max(1, Math.round(img.height * scale))
    const ctx = canvas.getContext('2d')
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    const dataUrl = canvas.toDataURL('image/webp', q)
    if (dataUrl.length <= MAX_DATA_URL_LENGTH) {
      return dataUrl
    }
  }

  throw new Error('La foto es demasiado pesada incluso después de comprimirla. Intenta con otra imagen.')
}
