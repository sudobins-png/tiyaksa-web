/**
 * Commercial pages and their «Смотрите также» links — contextual internal
 * links between related pages, which carry more weight than the site-wide
 * footer (see components/sections/RelatedLinks.tsx). The footer keeps only
 * the core page groups; service pages (electrics, plumbing and the rest of
 * wave 3) are linked from here and from the menu instead.
 *
 * Labels double as link anchors, so they name the service the way people
 * search for it.
 */
export const COMMERCIAL_PAGES = {
  '/price':                               'Цены на ремонт квартир',
  '/remont-novostroyki-spb':              'Ремонт квартиры в новостройке',
  '/remont-vtorichki-spb':                'Ремонт квартиры на вторичке',
  '/udalenny-remont-kvartir-spb':         'Удалённый ремонт квартиры',
  '/remont-kosmeticheskiy-spb':           'Косметический ремонт',
  '/remont-kapitalnyy-spb':               'Капитальный ремонт квартиры',
  '/remont-dizainerskiy-spb':             'Дизайнерский ремонт',
  '/remont-kvartiry-studii-spb':          'Ремонт квартиры-студии',
  '/remont-odnokomnatnoy-kvartiry-spb':   'Ремонт однокомнатной квартиры',
  '/remont-dvukhkomnatnoy-kvartiry-spb':  'Ремонт двухкомнатной квартиры',
  '/remont-trekhkomnatnoy-kvartiry-spb':  'Ремонт трёхкомнатной квартиры',
  '/remont-vannoy-spb':                   'Ремонт ванной комнаты',
  '/remont-kukhni-spb':                   'Ремонт кухни',
  '/remont-komnaty-spb':                  'Ремонт комнаты',
  '/remont-ofisa-spb':                    'Ремонт офиса',
  '/zamena-elektroprovodki-spb':          'Замена электропроводки',
  '/zamena-trub-santekhniki-spb':         'Замена труб и сантехники',
  '/demontazh-v-kvartire-spb':            'Демонтаж в квартире',
  '/pereplanirovka-kvartiry-spb':         'Перепланировка квартиры',
} as const;

export type CommercialPath = keyof typeof COMMERCIAL_PAGES;

export const RELATED_PAGES: Record<CommercialPath, readonly CommercialPath[]> = {
  '/price':                              ['/remont-kosmeticheskiy-spb', '/remont-kapitalnyy-spb', '/remont-dizainerskiy-spb', '/remont-odnokomnatnoy-kvartiry-spb'],
  '/remont-novostroyki-spb':             ['/remont-kvartiry-studii-spb', '/remont-odnokomnatnoy-kvartiry-spb', '/zamena-elektroprovodki-spb', '/udalenny-remont-kvartir-spb'],
  '/remont-vtorichki-spb':               ['/remont-kapitalnyy-spb', '/demontazh-v-kvartire-spb', '/zamena-elektroprovodki-spb', '/zamena-trub-santekhniki-spb', '/remont-vannoy-spb'],
  '/udalenny-remont-kvartir-spb':        ['/remont-novostroyki-spb', '/remont-kvartiry-studii-spb', '/remont-odnokomnatnoy-kvartiry-spb', '/price'],
  '/remont-kosmeticheskiy-spb':          ['/remont-komnaty-spb', '/remont-kukhni-spb', '/remont-odnokomnatnoy-kvartiry-spb', '/remont-kapitalnyy-spb'],
  '/remont-kapitalnyy-spb':              ['/demontazh-v-kvartire-spb', '/pereplanirovka-kvartiry-spb', '/zamena-elektroprovodki-spb', '/zamena-trub-santekhniki-spb', '/remont-vtorichki-spb'],
  '/remont-dizainerskiy-spb':            ['/remont-trekhkomnatnoy-kvartiry-spb', '/pereplanirovka-kvartiry-spb', '/remont-dvukhkomnatnoy-kvartiry-spb', '/remont-kapitalnyy-spb', '/udalenny-remont-kvartir-spb'],
  '/remont-kvartiry-studii-spb':         ['/remont-odnokomnatnoy-kvartiry-spb', '/remont-novostroyki-spb', '/pereplanirovka-kvartiry-spb', '/remont-kukhni-spb', '/udalenny-remont-kvartir-spb'],
  '/remont-odnokomnatnoy-kvartiry-spb':  ['/remont-kvartiry-studii-spb', '/remont-dvukhkomnatnoy-kvartiry-spb', '/pereplanirovka-kvartiry-spb', '/remont-kosmeticheskiy-spb', '/udalenny-remont-kvartir-spb'],
  '/remont-dvukhkomnatnoy-kvartiry-spb': ['/remont-odnokomnatnoy-kvartiry-spb', '/remont-trekhkomnatnoy-kvartiry-spb', '/pereplanirovka-kvartiry-spb', '/remont-komnaty-spb', '/remont-kapitalnyy-spb'],
  '/remont-trekhkomnatnoy-kvartiry-spb': ['/remont-dvukhkomnatnoy-kvartiry-spb', '/remont-dizainerskiy-spb', '/remont-kapitalnyy-spb', '/zamena-elektroprovodki-spb'],
  '/remont-vannoy-spb':                  ['/zamena-trub-santekhniki-spb', '/remont-kukhni-spb', '/remont-kapitalnyy-spb', '/remont-komnaty-spb'],
  '/remont-kukhni-spb':                  ['/zamena-elektroprovodki-spb', '/zamena-trub-santekhniki-spb', '/pereplanirovka-kvartiry-spb', '/remont-vannoy-spb', '/remont-kosmeticheskiy-spb'],
  '/remont-komnaty-spb':                 ['/remont-kosmeticheskiy-spb', '/remont-odnokomnatnoy-kvartiry-spb', '/remont-kvartiry-studii-spb', '/remont-dizainerskiy-spb'],
  '/remont-ofisa-spb':                   ['/zamena-elektroprovodki-spb', '/remont-kapitalnyy-spb', '/price'],
  '/zamena-elektroprovodki-spb':         ['/zamena-trub-santekhniki-spb', '/remont-kapitalnyy-spb', '/remont-vtorichki-spb', '/remont-kukhni-spb'],
  '/zamena-trub-santekhniki-spb':        ['/remont-vannoy-spb', '/zamena-elektroprovodki-spb', '/remont-kukhni-spb', '/remont-kapitalnyy-spb'],
  '/demontazh-v-kvartire-spb':           ['/pereplanirovka-kvartiry-spb', '/remont-kapitalnyy-spb', '/remont-vtorichki-spb', '/zamena-elektroprovodki-spb', '/zamena-trub-santekhniki-spb'],
  '/pereplanirovka-kvartiry-spb':        ['/remont-kukhni-spb', '/demontazh-v-kvartire-spb', '/remont-dizainerskiy-spb', '/remont-kapitalnyy-spb', '/remont-kvartiry-studii-spb'],
};

export function relatedLinksFor(path: string) {
  const related = RELATED_PAGES[path as CommercialPath] ?? [];
  return related.map((href) => ({ href, label: COMMERCIAL_PAGES[href] }));
}
