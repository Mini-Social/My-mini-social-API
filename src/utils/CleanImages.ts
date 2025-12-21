import path from 'path'
import fs from 'fs'
export const CleanImages = (images: string[]) => {
  if (images && images.length > 0) {
    images.forEach((image: string) => {
      const filePath = path.join(__dirname, '../../public/img/posts', image)
      fs.unlink(filePath, (err) => {
        if (err) {
          console.log('Could not remove junk files')
        } else {
          console.log(`Cleaned: ${image}`)
        }
      })
    })
  }
}
