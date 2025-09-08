declare module '@editorjs/header' {
  import { BlockTool } from '@editorjs/editorjs'
  export default class Header implements BlockTool {
    constructor(config?: any)
    static get toolbox(): any
    render(): HTMLElement
    save(block: HTMLElement): any
  }
}

declare module '@editorjs/checklist' {
  import { BlockTool } from '@editorjs/editorjs'
  export default class Checklist implements BlockTool {
    constructor(config?: any)
    static get toolbox(): any
    render(): HTMLElement
    save(block: HTMLElement): any
  }
}

declare module '@editorjs/image' {
  import { BlockTool } from '@editorjs/editorjs'
  export default class Image implements BlockTool {
    constructor(config?: any)
    static get toolbox(): any
    render(): HTMLElement
    save(block: HTMLElement): any
  }
}

declare module '@editorjs/attaches' {
  import { BlockTool } from '@editorjs/editorjs'
  export default class AttachesTool implements BlockTool {
    constructor(config?: any)
    static get toolbox(): any
    render(): HTMLElement
    save(block: HTMLElement): any
  }
}