import { PhysicsLoader } from 'enable3d'

export const physicsReady = new Promise((resolve) => {
  PhysicsLoader('/ammo', () => {
    resolve(undefined)
  })
})