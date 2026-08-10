const MAX_EDGE = 1400
const JPEG_QUALITY = 0.82

/** Resize and compress an image file to a JPEG data URL that fits browser storage. */
export function compressImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file)
    const image = new Image()

    image.onload = () => {
      URL.revokeObjectURL(objectUrl)
      try {
        const scale = Math.min(1, MAX_EDGE / Math.max(image.width, image.height))
        const width = Math.max(1, Math.round(image.width * scale))
        const height = Math.max(1, Math.round(image.height * scale))
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const context = canvas.getContext('2d')
        if (!context) {
          reject(new Error('Could not process the photo.'))
          return
        }
        context.drawImage(image, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', JPEG_QUALITY))
      } catch (error) {
        reject(error instanceof Error ? error : new Error('Could not process the photo.'))
      }
    }

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('Could not read that image.'))
    }

    image.src = objectUrl
  })
}
