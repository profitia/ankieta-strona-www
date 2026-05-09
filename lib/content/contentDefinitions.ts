/**
 * Content definitions for the simplified Content Approval Workflow.
 *
 * Each pillar has pages; each page has content blocks.
 * Reviewers approve or suggest changes to each block independently.
 *
 * To update text: edit the `currentText` field for each block.
 * Block IDs must be globally unique and stable (they are stored in DB).
 */

export interface ContentBlock {
  id: string;
  section: string;
  label: string;
  currentText: string;
  context?: string;
}

export interface ContentPage {
  slug: string;
  title: string;
  url: string;
  blocks: ContentBlock[];
}

export interface ContentPillar {
  slug: string;
  name: string;
  description: string;
  pages: ContentPage[];
}

// ---------------------------------------------------------------------------
// FINAL QUESTIONS (shared across all pillars)
// ---------------------------------------------------------------------------

export const FINAL_QUESTIONS = [
  {
    id: "layout",
    question: "Czy zgadzasz się z układem informacji na stronie?",
    followUp: "Jak powinien wyglądać układ?",
  },
  {
    id: "visual",
    question: "Czy zgadzasz się z wyglądem strony?",
    followUp: "Co warto zmienić?",
  },
  {
    id: "brand",
    question: "Czy strona właściwie oddaje ideę Profitii?",
    followUp: "Czego brakuje lub co jest niezgodne z Twoją wizją?",
  },
] as const;

// ---------------------------------------------------------------------------
// WSPÓLNE
// ---------------------------------------------------------------------------

const WSPOLNE: ContentPillar = {
  slug: "wspolne",
  name: "Wspólne",
  description: "Strony wspólne dla całej witryny: strona główna, o nas, kontakt.",
  pages: [
    {
      slug: "home",
      title: "Strona główna",
      url: "https://profitia-pl.onrender.com/",
      blocks: [
        {
          id: "wspolne-home-hero-headline",
          section: "Hero",
          label: "Główny nagłówek",
          currentText:
            "Profitia — Doradztwo zakupowe i edukacja dla profesjonalistów.",
          context: "Pierwszy element widoczny po wejściu na stronę.",
        },
        {
          id: "wspolne-home-hero-subheadline",
          section: "Hero",
          label: "Podtytuł / lead",
          currentText:
            "Pomagamy firmom budować przewagę poprzez zakupy strategiczne, negocjacje i rozwój kompetencji.",
        },
        {
          id: "wspolne-home-hero-cta",
          section: "Hero",
          label: "Przycisk CTA",
          currentText: "Sprawdź ofertę",
        },
        {
          id: "wspolne-home-about-intro",
          section: "O nas — intro",
          label: "Wprowadzenie do sekcji O nas",
          currentText:
            "Profitia to firma doradcza specjalizująca się w obszarze zakupów i supply chain. Łączymy doradztwo, edukację i rekrutację pod jednym dachem.",
        },
        {
          id: "wspolne-home-services-intro",
          section: "Usługi — przegląd",
          label: "Nagłówek sekcji usług",
          currentText: "Co robimy",
        },
        {
          id: "wspolne-home-services-doradztwo",
          section: "Usługi — przegląd",
          label: "Kafelek: Doradztwo",
          currentText:
            "Projekty doradcze w obszarze zakupów, negocjacji i optymalizacji kosztów.",
        },
        {
          id: "wspolne-home-services-edukacja",
          section: "Usługi — przegląd",
          label: "Kafelek: Edukacja",
          currentText:
            "Szkolenia i programy rozwojowe dla kupców i menedżerów zakupów.",
        },
        {
          id: "wspolne-home-services-career",
          section: "Usługi — przegląd",
          label: "Kafelek: Kariera",
          currentText:
            "Rekrutacja i rozwój kariery dla specjalistów ds. zakupów.",
        },
        {
          id: "wspolne-home-footer-cta",
          section: "CTA końcowe",
          label: "Wezwanie do działania na dole strony",
          currentText:
            "Gotowy na rozmowę? Skontaktuj się z nami — odpowiemy w ciągu 24 godzin.",
        },
      ],
    },
    {
      slug: "about",
      title: "O nas",
      url: "https://profitia-pl.onrender.com/about",
      blocks: [
        {
          id: "wspolne-about-hero",
          section: "Hero",
          label: "Nagłówek strony O nas",
          currentText: "O Profitii",
        },
        {
          id: "wspolne-about-mission",
          section: "Misja",
          label: "Opis misji",
          currentText:
            "Naszą misją jest wspieranie firm i specjalistów w budowaniu silniejszych kompetencji zakupowych — przez doradztwo, wiedzę i właściwych ludzi.",
        },
        {
          id: "wspolne-about-story",
          section: "Historia / Opis",
          label: "Opis firmy",
          currentText:
            "Profitia powstała z przekonania, że zakupy strategiczne są jednym z najważniejszych źródeł przewagi konkurencyjnej. Od lat pracujemy z liderami rynku, pomagając im osiągać lepsze wyniki.",
        },
        {
          id: "wspolne-about-values",
          section: "Wartości",
          label: "Opis wartości / podejścia",
          currentText:
            "Działamy partnersko. Łączymy praktykę z wiedzą. Mówimy wprost. Nie sprzedajemy metod — dostarczamy rezultaty.",
        },
        {
          id: "wspolne-about-team",
          section: "Zespół",
          label: "Wprowadzenie do zespołu",
          currentText:
            "Za Profitią stoją praktycy z wieloletnim doświadczeniem w zakupach, konsultingu i edukacji.",
        },
      ],
    },
    {
      slug: "contact",
      title: "Kontakt",
      url: "https://profitia-pl.onrender.com/contact",
      blocks: [
        {
          id: "wspolne-contact-hero",
          section: "Hero",
          label: "Nagłówek strony kontaktu",
          currentText: "Skontaktuj się z nami",
        },
        {
          id: "wspolne-contact-intro",
          section: "Intro",
          label: "Tekst wprowadzający",
          currentText:
            "Chętnie porozmawiamy o Twoich potrzebach. Napisz lub zadzwoń — odpowiadamy szybko.",
        },
        {
          id: "wspolne-contact-cta",
          section: "CTA formularza",
          label: "Tekst na przycisku / zachęta do kontaktu",
          currentText: "Wyślij wiadomość",
        },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// DORADZTWO
// ---------------------------------------------------------------------------

const DORADZTWO: ContentPillar = {
  slug: "doradztwo",
  name: "Doradztwo",
  description: "Oferta doradcza: przegląd usług i opis projektów doradczych.",
  pages: [
    {
      slug: "services",
      title: "Usługi",
      url: "https://profitia-pl.onrender.com/services",
      blocks: [
        {
          id: "doradztwo-services-hero",
          section: "Hero",
          label: "Nagłówek strony usług",
          currentText: "Doradztwo zakupowe",
        },
        {
          id: "doradztwo-services-lead",
          section: "Hero",
          label: "Lead / opis ogólny",
          currentText:
            "Pomagamy organizacjom wdrażać zakupy strategiczne, poprawiać wyniki negocjacji i redukować koszty — bez utraty jakości i relacji z dostawcami.",
        },
        {
          id: "doradztwo-services-offer-1",
          section: "Lista usług",
          label: "Usługa 1 — nazwa i opis",
          currentText:
            "Audyt funkcji zakupowej — diagnoza dojrzałości zakupów i rekomendacje zmian.",
        },
        {
          id: "doradztwo-services-offer-2",
          section: "Lista usług",
          label: "Usługa 2 — nazwa i opis",
          currentText:
            "Wsparcie negocjacyjne — przygotowanie strategii, analiza BATNA, prowadzenie rozmów.",
        },
        {
          id: "doradztwo-services-offer-3",
          section: "Lista usług",
          label: "Usługa 3 — nazwa i opis",
          currentText:
            "Optymalizacja kategorii zakupowych — analiza spend, segmentacja dostawców, strategia kategorii.",
        },
        {
          id: "doradztwo-services-cta",
          section: "CTA",
          label: "Wezwanie do działania",
          currentText:
            "Porozmawiajmy o Twoim projekcie. Pierwsze spotkanie jest bezpłatne.",
        },
      ],
    },
    {
      slug: "projekty-doradcze",
      title: "Projekty doradcze",
      url: "https://profitia-pl.onrender.com/services/projekty-doradcze",
      blocks: [
        {
          id: "doradztwo-projekty-hero",
          section: "Hero",
          label: "Nagłówek",
          currentText: "Projekty doradcze",
        },
        {
          id: "doradztwo-projekty-intro",
          section: "Opis",
          label: "Opis podejścia projektowego",
          currentText:
            "Pracujemy projektowo — z jasnym zakresem, harmonogramem i mierzalnymi rezultatami. Nie zostawiamy bez działającego rozwiązania.",
        },
        {
          id: "doradztwo-projekty-process",
          section: "Metodologia",
          label: "Opis procesu / kroków",
          currentText:
            "1. Diagnoza i zakres. 2. Analiza danych i benchmarki. 3. Rekomendacje i plan wdrożenia. 4. Wsparcie podczas realizacji.",
        },
        {
          id: "doradztwo-projekty-results",
          section: "Rezultaty",
          label: "Przykładowe wyniki / case study intro",
          currentText:
            "Nasze projekty przynoszą średnio 8–15% oszczędności w kategorii oraz skrócenie czasu realizacji zakupów o 30%.",
          context: "Sprawdź czy te liczby są aktualne i czy możemy je podawać publicznie.",
        },
        {
          id: "doradztwo-projekty-cta",
          section: "CTA",
          label: "Wezwanie do działania",
          currentText: "Opowiedz nam o swoim wyzwaniu",
        },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// EDUKACJA
// ---------------------------------------------------------------------------

const EDUKACJA: ContentPillar = {
  slug: "edukacja",
  name: "Edukacja",
  description: "Oferta edukacyjna: programy, akademia zakupów.",
  pages: [
    {
      slug: "education",
      title: "Edukacja",
      url: "https://profitia-pl.onrender.com/education",
      blocks: [
        {
          id: "edukacja-education-hero",
          section: "Hero",
          label: "Nagłówek",
          currentText: "Edukacja zakupowa",
        },
        {
          id: "edukacja-education-lead",
          section: "Hero",
          label: "Lead",
          currentText:
            "Rozwijamy kompetencje kupców i menedżerów zakupów — przez praktyczne programy szkoleniowe, warsztaty i Akademię Zakupów.",
        },
        {
          id: "edukacja-education-offer-1",
          section: "Programy",
          label: "Program 1",
          currentText:
            "Warsztaty negocjacyjne — intensywny program rozwijający umiejętności negocjacyjne w kontekście zakupów.",
        },
        {
          id: "edukacja-education-offer-2",
          section: "Programy",
          label: "Program 2",
          currentText:
            "Akademia Zakupów — kompleksowy program dla specjalistów ds. zakupów, od podstaw do zaawansowanych strategii.",
        },
        {
          id: "edukacja-education-offer-3",
          section: "Programy",
          label: "Program 3",
          currentText:
            "Szkolenia dla zarządów — strategiczne zakupy z perspektywy C-level.",
        },
        {
          id: "edukacja-education-cta",
          section: "CTA",
          label: "Wezwanie do działania",
          currentText:
            "Dowiedz się więcej o naszych programach lub zapytaj o dedykowane szkolenie.",
        },
      ],
    },
    {
      slug: "akademia-zakupow",
      title: "Akademia Zakupów",
      url: "https://profitia-pl.onrender.com/education/akademia-zakupow",
      blocks: [
        {
          id: "edukacja-akademia-hero",
          section: "Hero",
          label: "Nagłówek",
          currentText: "Akademia Zakupów",
        },
        {
          id: "edukacja-akademia-intro",
          section: "Opis programu",
          label: "Opis czym jest Akademia",
          currentText:
            "Akademia Zakupów to wielomodułowy program dla profesjonalistów, którzy chcą systematycznie budować swoje kompetencje zakupowe i negocjacyjne.",
        },
        {
          id: "edukacja-akademia-for-whom",
          section: "Dla kogo",
          label: "Opis grupy docelowej",
          currentText:
            "Program jest dedykowany: kupcom, specjalistom ds. zakupów, menedżerom kategorii i osobom wchodzącym w rolę zakupową.",
        },
        {
          id: "edukacja-akademia-modules",
          section: "Moduły",
          label: "Opis struktury / modułów",
          currentText:
            "Program obejmuje: podstawy strategicznych zakupów, analizę spend, negocjacje, zarządzanie dostawcami i zakupy w praktyce.",
        },
        {
          id: "edukacja-akademia-benefits",
          section: "Korzyści",
          label: "Co uczestnik zyska",
          currentText:
            "Po ukończeniu programu: certyfikat Profitii, praktyczna wiedza, narzędzia do zastosowania od razu, sieć kontaktów w środowisku zakupowym.",
        },
        {
          id: "edukacja-akademia-cta",
          section: "CTA",
          label: "Wezwanie do działania",
          currentText: "Zapisz się na Akademię lub zapytaj o kolejną edycję",
        },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// CAREER
// ---------------------------------------------------------------------------

const CAREER: ContentPillar = {
  slug: "career",
  name: "Kariera",
  description: "Oferta kariery: kultura organizacyjna, oferty pracy, aplikacja.",
  pages: [
    {
      slug: "career",
      title: "Kariera",
      url: "https://profitia-pl.onrender.com/career",
      blocks: [
        {
          id: "career-career-hero",
          section: "Hero",
          label: "Nagłówek",
          currentText: "Pracuj z nami",
        },
        {
          id: "career-career-lead",
          section: "Hero",
          label: "Lead",
          currentText:
            "Szukamy praktyków z pasją do zakupów. Jeśli chcesz rozwijać się w środowisku, które łączy consulting, edukację i realne projekty — jesteś we właściwym miejscu.",
        },
        {
          id: "career-career-culture",
          section: "Kultura",
          label: "Opis kultury organizacyjnej",
          currentText:
            "Pracujemy w małym, zaangażowanym zespole. Cenimy samodzielność, ciekawość i odpowiedzialność. Nie ma tu korporacyjnych procedur — jest za to duże pole do działania.",
        },
        {
          id: "career-career-why",
          section: "Dlaczego Profitia",
          label: "Argumenty za dołączeniem",
          currentText:
            "Praca przy realnych projektach doradczych. Dostęp do sieci ekspertów. Możliwość tworzenia własnych programów. Praca z najciekawszymi wyzwaniami zakupowymi na rynku.",
        },
        {
          id: "career-career-positions",
          section: "Oferty pracy",
          label: "Nagłówek / intro sekcji ofert",
          currentText: "Otwarte rekrutacje",
        },
      ],
    },
    {
      slug: "procurement-consultant",
      title: "Procurement Consultant",
      url: "https://profitia-pl.onrender.com/career/procurement-consultant",
      blocks: [
        {
          id: "career-consultant-hero",
          section: "Hero",
          label: "Nagłówek roli",
          currentText: "Procurement Consultant",
        },
        {
          id: "career-consultant-intro",
          section: "Opis roli",
          label: "Opis stanowiska",
          currentText:
            "Szukamy doświadczonego konsultanta ds. zakupów, który dołączy do zespołu Profitii i będzie realizował projekty doradcze dla naszych klientów.",
        },
        {
          id: "career-consultant-responsibilities",
          section: "Zakres obowiązków",
          label: "Co będziesz robić",
          currentText:
            "Realizacja projektów doradczych, prowadzenie analiz zakupowych, wsparcie negocjacyjne klientów, tworzenie materiałów edukacyjnych, budowanie relacji z klientami.",
        },
        {
          id: "career-consultant-requirements",
          section: "Wymagania",
          label: "Czego szukamy",
          currentText:
            "Min. 3 lata doświadczenia w zakupach lub konsultingu zakupowym. Umiejętności analityczne. Doświadczenie negocjacyjne. Biegły angielski. Samodzielność i proaktywność.",
        },
        {
          id: "career-consultant-offer",
          section: "Oferujemy",
          label: "Co oferujemy",
          currentText:
            "Udział w ambitnych projektach. Elastyczność pracy. Rozwój w kierunku eksperckim lub menadżerskim. Atrakcyjne wynagrodzenie adekwatne do doświadczenia.",
        },
        {
          id: "career-consultant-cta",
          section: "CTA",
          label: "Wezwanie do aplikowania",
          currentText: "Aplikuj teraz",
        },
      ],
    },
    {
      slug: "apply",
      title: "Formularz aplikacyjny",
      url: "https://profitia-pl.onrender.com/career/apply?role=procurement-consultant",
      blocks: [
        {
          id: "career-apply-hero",
          section: "Hero",
          label: "Nagłówek formularza",
          currentText: "Aplikuj na stanowisko Procurement Consultant",
        },
        {
          id: "career-apply-intro",
          section: "Instrukcja",
          label: "Opis procesu rekrutacyjnego",
          currentText:
            "Wypełnij formularz, załącz CV i krótko opisz swoje doświadczenie zakupowe. Odpiszemy w ciągu 5 dni roboczych.",
        },
        {
          id: "career-apply-privacy",
          section: "RODO / zgoda",
          label: "Informacja o przetwarzaniu danych",
          currentText:
            "Administratorem Twoich danych jest Profitia sp. z o.o. Dane będą przetwarzane wyłącznie w celu przeprowadzenia procesu rekrutacyjnego.",
          context: "Sprawdź z prawnikiem czy klauzula jest aktualna.",
        },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// EXPORTS
// ---------------------------------------------------------------------------

export const ALL_PILLARS: ContentPillar[] = [WSPOLNE, DORADZTWO, EDUKACJA, CAREER];

export function getPillar(slug: string): ContentPillar | undefined {
  return ALL_PILLARS.find((p) => p.slug === slug);
}

export function getPage(pillarSlug: string, pageSlug: string): ContentPage | undefined {
  return getPillar(pillarSlug)?.pages.find((p) => p.slug === pageSlug);
}

export function getBlock(blockId: string): ContentBlock | undefined {
  for (const pillar of ALL_PILLARS) {
    for (const page of pillar.pages) {
      const block = page.blocks.find((b) => b.id === blockId);
      if (block) return block;
    }
  }
  return undefined;
}

export function totalBlocks(pillarSlug: string): number {
  return getPillar(pillarSlug)?.pages.reduce((acc, p) => acc + p.blocks.length, 0) ?? 0;
}
