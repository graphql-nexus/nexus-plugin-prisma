import { Photon } from '@prisma/photon'

const photon = new Photon()

export type Context = {
  photon: Photon
}

export const createContext = (): Context => ({
  photon,
})
