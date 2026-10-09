// GET /api/ —— gitignore.io help（对齐 APIHandlers.createHelp）
export default defineEventHandler((event) => text(event, `gitignore.io help:
  list    - lists the operating systems, programming languages and IDE input types
  :types: - creates .gitignore files for types of operating systems, programming languages or IDEs`))
