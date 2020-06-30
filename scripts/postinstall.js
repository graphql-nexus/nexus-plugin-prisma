if (process.env.INIT_CWD) {
  // necessary, because npm chooses __dirname as process.cwd() in the postinstall hook
  process.chdir(process.env.INIT_CWD)
}

require('./prisma-deps-check')
