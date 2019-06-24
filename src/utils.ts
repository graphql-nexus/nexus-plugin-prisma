import { relative } from 'path';

export const keyBy: <T>(
  collection: T[],
  iteratee: (value: T) => string
) => Record<string, T> = (collection, iteratee) => {
  return collection.reduce<any>((acc, curr) => {
    acc[iteratee(curr)] = curr;
    return acc;
  }, {});
};

export const upperFirst = (s: string): string => {
  return s.replace(/^\w/, c => c.toUpperCase());
};

export function nexusOpts(param: {
  type: string;
  isList: boolean;
  isRequired: boolean;
}): {
  type: any;
  list: true | undefined;
  nullable: boolean;
} {
  return {
    type: param.type as any,
    list: param.isList ? true : undefined,
    nullable: !param.isRequired
  };
}

export function assertPhotonInContext(photon: any) {
  if (!photon) {
    throw new Error('Could not find photon in context');
  }
}

export function trimIfInNodeModules(path: string) {
  if (path.includes('node_modules')) {
    return path.substring(
      path.lastIndexOf('node_modules') + 'node_modules'.length + 1
    );
  }

  return path
}

export function getImportPathRelativeToOutput(
  from: string,
  to: string
): string {
  if (to.includes('node_modules')) {
    return trimIfInNodeModules(to)
  }

  let relativePath = relative(from, to);

  if (!relativePath.startsWith('.')) {
    relativePath = './' + relativePath;
  }

  // remove .ts or .js file extension
  relativePath = relativePath.replace(/\.(ts|js)$/, '');

  // remove /index
  relativePath = relativePath.replace(/\/index$/, '');

  // replace \ with /
  relativePath = relativePath.replace(/\\/g, '/');

  return relativePath;
}
