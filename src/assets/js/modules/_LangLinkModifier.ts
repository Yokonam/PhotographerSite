type UrlExceptions = string[]

export class LangLinkModifier {
  private lang: string
  private exceptions: UrlExceptions
  private currentUrl: string
  private langTags = {
    ja: this.getAnchorElement('#lang-ja a'),
    en: this.getAnchorElement('#lang-en a')
  }

  constructor (lang: string, exceptions: UrlExceptions) {
    this.lang = lang
    this.exceptions = exceptions
    this.currentUrl = window.location.pathname
  }

  private getAnchorElement (selector: string): HTMLAnchorElement | null {
    return document.querySelector(selector) as HTMLAnchorElement
  }

  public modify (): void {
    if (this.isUrlException()) {
      this.modifyForExceptions()
    } else {
      this.modifyForLanguage()
    }
  }

  private isUrlException (): boolean {
    return this.exceptions.some(exception => this.currentUrl.includes(exception))
  }

  private modifyForExceptions (): void {
    this.setHrefForLangTags(this.currentUrl, '/en/index.html')
    this.setClassForCurrent('ja')
  }

  private modifyForLanguage (): void {
    const langMapping: Record<string, () => void> = {
      ja: () => this.modifyForJapanese(),
      en: () => this.modifyForEnglish()
    }

    langMapping[this.lang]?.()
  }

  private modifyForJapanese (): void {
    this.setHrefForLangTags(this.currentUrl, '/en' + this.currentUrl)
    this.setClassForCurrent('ja')
  }

  private modifyForEnglish (): void {
    const jaHref = this.currentUrl.startsWith('/en') ? this.currentUrl.substring(3) : this.currentUrl
    this.setHrefForLangTags(jaHref, this.currentUrl)
    this.setClassForCurrent('en')
  }

  private setHrefForLangTags (jaHref: string, enHref: string): void {
    if (this.langTags.ja) this.langTags.ja.href = jaHref
    if (this.langTags.en) this.langTags.en.href = enHref
  }

  private setClassForCurrent (lang: string): void {
    document.getElementById(`lang-${lang}`)?.classList.add('current')
  }
}
