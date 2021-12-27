import { Config } from "../Storage/api"

interface Module {
    id: String; // Module ID
    shouldRun: RegExp; // A regular expression that is matched against window.location.href
    injectWithConfig: boolean; // Indicates whether the module will be injected with or without the config
    options: (config: Config) => JSX.Element | void; // JSX to render in the options page.
    inject: (config?: Config) => void; // the body of the module
}


export { Module }