import { Photon } from '@generated/photon'

const photon = new Photon()

type Context = {
  photon: Photon
}

function createContext(): Context {
  return {
    photon,
  }
}

export { Context, createContext }
