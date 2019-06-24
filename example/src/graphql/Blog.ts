import { objectType } from '@prisma/nexus';

export const Blog = objectType({
  name: 'Blog',
  definition(t) {
    t.model.id();
    t.model.name();
    t.model.posts({ type: 'CustomPost', pagination: false });
    t.model.viewCount();
    t.model.authors();
  }
});
