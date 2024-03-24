import * as tsup from 'tsup'

declare const tsupDefuConfig:
  | tsup.Options
  | tsup.Options[]
  | ((
    overrideOptions: tsup.Options,
  ) => tsup.Options | tsup.Options[] | Promise<tsup.Options | tsup.Options[]>)

declare const appDefuConfig: typeof tsupDefuConfig
declare const cliDefuConfig: tsup.Options
declare const qlDefuConfig: tsup.Options

export { appDefuConfig, cliDefuConfig, qlDefuConfig, tsupDefuConfig }
