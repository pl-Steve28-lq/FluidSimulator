let floor = Math.floor
let IX = (x, y) => x + y*N
let array = size => new Float32Array(size)
let RGB = (r, g, b) => `rgb(${r}, ${g}, ${b})`

export { floor, IX, array, RGB }