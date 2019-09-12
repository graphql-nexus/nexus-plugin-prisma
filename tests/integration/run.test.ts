import * as cp from 'child_process'
import * as path from 'path'

it('integrates together', () => {
  integrationTest()
})

function integrationTest() {
  cp.execSync('../../node_modules/.bin/prisma2 generate', {
    cwd: path.join(__dirname),
  })
  // 2. snapshot typegen
  // 3. snapshot graphql schema
  // 4. assert app Type check
  // 5. assert (manually) typegen snap
  // 6. assert (manually) graphql schema snap
}
