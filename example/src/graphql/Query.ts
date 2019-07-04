import { objectType } from '@prisma/nexus';

export const Query = objectType({
  name: 'Query',
  definition(t) {
    t.crud.blogs({
      alias: 'blogs',
      pagination: false
    });

    t.crud.blog({ alias: 'blog' });
    t.crud.authors();
    t.crud.posts({ type: 'CustomPost', ordering: true });
  }
});
