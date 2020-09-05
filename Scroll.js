import { View } from './View'

class Scroll extends View {
   constructor(frame, handler) {
      super(frame)
      this.onClick = this.onClick.bind(this)
      this.canvasMouseMove = this.canvasMouseMove.bind(this)
      this.canvasMouseUp = this.canvasMouseUp.bind(this)
      this.setHandleRatio = this.setHandleRatio.bind(this)
      window.addEventListener('mousemove', this.canvasMouseMove)
      window.addEventListener('mouseup', this.canvasMouseUp)
      this.handleLength = 50
      this.location = 0
      this.backgroundColor = "#ddd"
      this.activeColor = "gray"
      this.inactiveColor = "gray"

      this.cursor = { down: false, handleDist: 0 }
      this.handler = handler
      this.handle = new View(this.getHandleFrame(this.handleLength))
      this.handle.backgroundColor = this.getHandleBackgroundColor()
      this.addSubview(this.handle)
      this.hidden = false
   }
   reset() {
      this.canvas.domCanvas.removeEventListener('mousedown', this.canvasOnClick)
      window.removeEventListener('mousemove', this.canvasMouseMove)
      window.removeEventListener('mouseup', this.canvasMouseUp)
   }
   getLocationFromEvent(event) {
      console.error('abstract function')
   }
   getLength() {
      console.error('abstract function')
   }
   getHandleFrame() {
      console.error('abstract function')
   }
   setLocation(location) {
      this.location = location
   }
   setHandleLength(handleLength) {
      this.handleLength = handleLength
      this.handle.frame = this.getHandleFrame(handleLength)
      this.hidden = this.handleLength >= this.getLength()
   }
   setHandleRatio(ratio) {
      const length = this.getLength() * Math.max(Math.min(ratio, 1), 0.1)
      this.setHandleLength(length)
   }
   getHandleBackgroundColor() {
      return this.cursor.down ? this.activeColor : this.inactiveColor
   }

   onClick(event) {
      if (event.button == 0) {
         this.cursor.down = true
         this.cursor.handleDist = this.location - this.getLocationFromEvent(event)
         this.handle.backgroundColor = this.getHandleBackgroundColor()
         this.repaint()
         event.preventDefault()
      }
   }

   canvasMouseMove(event) {
      if (!this.cursor.down || event.button != 0) {
         return
      }
      const cursorLoc = this.getLocationFromEvent(event)
      const delta = cursorLoc - (this.location - this.cursor.handleDist)
      const location = this.limitLocation(this.location + delta)
      this.setLocation(location)
      this.handler(this.getProgress(this.location))
      this.repaint()
      event.preventDefault()
   }


   canvasMouseUp(event) {
      if (event.button == 0) {
         this.cursor.down = false
         this.handle.backgroundColor = this.getHandleBackgroundColor()
         this.repaint()
         event.preventDefault()
      }
   }

   limitLocation(location) {
      const lowerLimit = Math.max(0, location)
      const upperLimit = Math.min(lowerLimit, this.getLength() - this.handleLength)
      return upperLimit
   }

   getProgress(pos) {
      if (this.getLength() === this.handleLength) {
         return 0
      }
      return pos / (this.getLength() - this.handleLength)
   }

   setProgress(y) {
      const location = ((this.getLength() - this.handleLength) * y)
      this.setLocation(location)
      // this.repaint()
   }
}

const HANDLE_MARGIN = 2
export class ScrollHorizontal extends Scroll {
   getLocationFromEvent(event) {
      return event.x
   }
   getLength() {
      return this.frame.width - (HANDLE_MARGIN * 2)
   }
   getHandleFrame(handleLength) {
      return { x: this.location + HANDLE_MARGIN, y: HANDLE_MARGIN, width: handleLength, height: this.frame.height - (HANDLE_MARGIN * 2) }
   }
   setLocation(location) {
      super.setLocation(location)
      this.handle.frame.x = location + HANDLE_MARGIN
   }
}
export class ScrollVertical extends Scroll {
   getLocationFromEvent(event) {
      return event.y
   }
   getLength() {
      return this.frame.height - (HANDLE_MARGIN * 2)
   }
   getHandleFrame(handleLength) {
      return { x: HANDLE_MARGIN, y: this.location + HANDLE_MARGIN, width: this.frame.width - (HANDLE_MARGIN * 2), height: handleLength }
   }
   setLocation(location) {
      super.setLocation(location)
      this.handle.frame.y = location + HANDLE_MARGIN
   }
}
