// Comprime una imagen en el navegador y la devuelve como data URL (webp).
// Se guarda directamente en Firestore, así no se necesita Firebase Storage
// (que requiere el plan de pago Blaze en proyectos nuevos).
export function compressImage(file, { maxSize = 900, quality = 0.8 } = {}) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('No se pudo leer la imagen'))
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('Archivo de imagen no válido'))
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(img.width * scale)
        canvas.height = Math.round(img.height * scale)
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        const dataUrl = canvas.toDataURL('image/webp', quality)
        // Límite de documento en Firestore: ~1MB. Reintenta con más compresión.
        if (dataUrl.length > 700_000) {
          const smaller = canvas.toDataURL('image/webp', 0.55)
          resolve(smaller)
        } else {
          resolve(dataUrl)
        }
      }
      img.src = reader.result
    }
    reader.readAsDataURL(file)
  })
}
