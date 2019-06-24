import { objectType } from '@prisma/nexus';

export const Author = objectType({
  name: 'Author',
  definition(t) {
    t.model.id();
    t.model.name();
    t.model.blog();
    t.model.posts({ type: "CustomPost" });
  }
});
