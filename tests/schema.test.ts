import { objectType } from '@prisma/nexus';
import { printSchema } from 'graphql';
import { generateSchema } from './utils';

jest.setTimeout(20000);

describe('schema generation', () => {
  /**
   * /!\ Do not remove this test. For some reason, the first test always fail.
   * /!\ TODO: Fix this ugly mess
   */
  test('warmup', async () => {
    const datamodel = 'model User { id Int @id }';

    try {
      await generateSchema(datamodel, []);
    } catch {}
  });

  test('simple schema', async () => {
    const User = objectType({
      name: 'User',
      definition(t: any) {
        t.model.id();
        t.model.name();
      }
    });
    const datamodel = `
    model User {
      id    Int @id
      name  String
    }
    `;

    const schema = await generateSchema(datamodel, [User]);

    expect(printSchema(schema)).toMatchSnapshot();
  });

  test('it exposes only pagination on relations by default', async () => {
    const datamodel = `
    model User {
      id    Int @id
      posts Post[]
    }

    model Post {
      id    Int @id
    }
    `;
    const User = objectType({
      name: 'User',
      definition(t: any) {
        t.model.id();
        t.model.posts();
      }
    });
    const Post = objectType({
      name: 'Post',
      definition(t: any) {
        t.model.id();
      }
    });

    const schema = await generateSchema(datamodel, [User, Post]);

    expect(printSchema(schema)).toMatchSnapshot();
  });

  test('it exposes filtering only if filtering: true', async () => {
    const datamodel = `
    model User {
      id    Int @id
      posts Post[]
    }

    model Post {
      id    Int @id
    }
    `;
    const User = objectType({
      name: 'User',
      definition(t: any) {
        t.model.id();
        t.model.posts({ filtering: true });
      }
    });
    const Post = objectType({
      name: 'Post',
      definition(t: any) {
        t.model.id();
      }
    });

    const schema = await generateSchema(datamodel, [User, Post]);

    expect(printSchema(schema)).toMatchSnapshot();
  });

  test('it exposes only id filters', async () => {
    const datamodel = `
    model User {
      id    Int @id
      posts Post[]
    }

    model Post {
      id    Int     @id
      name  String
    }
    `;
    const User = objectType({
      name: 'User',
      definition(t: any) {
        t.model.id();
        t.model.posts({ filtering: { id: true } });
      }
    });

    const Post = objectType({
      name: 'Post',
      definition(t: any) {
        t.model.id();
        t.model.name();
      }
    });

    const schema = await generateSchema(datamodel, [User, Post]);

    expect(printSchema(schema)).toMatchSnapshot();
  });

  // TODO: The generated snapshot is wrong because photon has a bug in its generated DMMF
  // Regenerate snapshot once its fixed. The OrderByInput should have `id` and `name` as field
  test('it exposes ordering only if ordering: true', async () => {
    const datamodel = `
    model User {
      id    Int @id
      posts Post[]
    }

    model Post {
      id    Int     @id
      name  String
    }
    `;
    const User = objectType({
      name: 'User',
      definition(t: any) {
        t.model.id();
        t.model.posts({ ordering: true });
      }
    });

    const Post = objectType({
      name: 'Post',
      definition(t: any) {
        t.model.id();
        t.model.name();
      }
    });

    const schema = await generateSchema(datamodel, [User, Post]);

    expect(printSchema(schema)).toMatchSnapshot();
  });

  test('it exposes id ordering', async () => {
    const datamodel = `
    model User {
      id    Int @id
      posts Post[]
    }

    model Post {
      id    Int     @id
      name  String
    }
    `;
    const User = objectType({
      name: 'User',
      definition(t: any) {
        t.model.id();
        t.model.posts({ ordering: { id: true } });
      }
    });

    const Post = objectType({
      name: 'Post',
      definition(t: any) {
        t.model.id();
        t.model.name();
      }
    });

    const schema = await generateSchema(datamodel, [User, Post]);

    expect(printSchema(schema)).toMatchSnapshot();
  });

  test('it exposes findOne and findMany', async () => {
    const datamodel = `
    model User {
      id    Int @id
    }
    `;
    const Query = objectType({
      name: 'Query',
      definition(t: any) {
        t.crud.user();
        t.crud.users();
      }
    });
    const User = objectType({
      name: 'User',
      definition(t: any) {
        t.model.id();
      }
    });

    const schema = await generateSchema(datamodel, [User, Query]);

    expect(printSchema(schema)).toMatchSnapshot();
  });
});
