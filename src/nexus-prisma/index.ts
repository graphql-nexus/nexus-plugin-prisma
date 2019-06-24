import { NexusPrismaBuilder } from './NexusPrismaBuilder';

export interface NexusPrismaParams {
  photon: (ctx: any) => any;
}

export function nexusPrismaMethod(params: NexusPrismaParams) {
  const builder = new NexusPrismaBuilder(params);

  return builder.getNexusPrismaMethod();
}
