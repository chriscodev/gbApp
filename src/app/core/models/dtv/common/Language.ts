// Copyright (c) 2023-2025 Triveni Digital, Inc. All rights reserved.

export class Language {
  public constructor(public readable: string, public iso2Code: string, public iso3Code: string) {
  }
}

export enum LanguageCode {
  CHI = 'chi',
  DAN = 'dan',
  DUT = 'dut',
  ENG = 'eng',
  FIN = 'fin',
  FRE = 'fre',
  DEU = 'deu',
  ITA = 'ita',
  JAP = 'jap',
  KOR = 'kor',
  ENM = 'enm',
  FRM = 'frm',
  NOR = 'nor',
  POR = 'por',
  SPA = 'spa',
  SWE = 'swe',
  UND = 'und',
  WEL = 'wel'
}

export type LanguageType = {
  readable: string,
  iso2Code: string,
  iso3Code: string
};

export const LANGUAGE_TYPES: Record<LanguageCode, LanguageType> = {
  [LanguageCode.CHI]: {readable: 'Chinese', iso2Code: 'zh', iso3Code: 'chi'},
  [LanguageCode.DAN]: {readable: 'Danish', iso2Code: 'da', iso3Code: 'dan'},
  [LanguageCode.DUT]: {readable: 'Dutch', iso2Code: 'nl', iso3Code: 'dut'},
  [LanguageCode.ENG]: {readable: 'English', iso2Code: 'en', iso3Code: 'eng'},
  [LanguageCode.FIN]: {readable: 'Finnish', iso2Code: 'fi', iso3Code: 'fin'},
  [LanguageCode.FRE]: {readable: 'French', iso2Code: 'fr', iso3Code: 'fre'},
  [LanguageCode.DEU]: {readable: 'German', iso2Code: 'de', iso3Code: 'deu'},
  [LanguageCode.ITA]: {readable: 'Italian', iso2Code: 'it', iso3Code: 'ita'},
  [LanguageCode.JAP]: {readable: 'Japanese', iso2Code: 'ja', iso3Code: 'jap'},
  [LanguageCode.KOR]: {readable: 'Korean', iso2Code: 'ko', iso3Code: 'kor'},
  [LanguageCode.ENM]: {readable: 'Middle English', iso2Code: 'me', iso3Code: 'enm'},
  [LanguageCode.FRM]: {readable: 'Middle French', iso2Code: 'mf', iso3Code: 'frm'},
  [LanguageCode.NOR]: {readable: 'Norwegian', iso2Code: 'no', iso3Code: 'nor'},
  [LanguageCode.POR]: {readable: 'Portuguese', iso2Code: 'pt', iso3Code: 'por'},
  [LanguageCode.SPA]: {readable: 'Spanish', iso2Code: 'es', iso3Code: 'spa'},
  [LanguageCode.SWE]: {readable: 'Swedish', iso2Code: 'sv', iso3Code: 'swe'},
  [LanguageCode.UND]: {readable: 'Undetermined', iso2Code: 'zh', iso3Code: 'und'},
  [LanguageCode.WEL]: {readable: 'Welsh', iso2Code: 'cy', iso3Code: 'wel'}
};

export class DefaultLanguage extends Language {
    public constructor() {
        super('English', 'en', 'eng');
    }
}
