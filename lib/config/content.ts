// ---------------------------------------------------------------------------
// Score fields
// ---------------------------------------------------------------------------

export const SCORE_FIELDS = [
  {
    key: "clarityScore" as const,
    label: "Jasność komunikacji",
    description: "Czy przekaz jest natychmiastowo czytelny dla odbiorcy?",
  },
  {
    key: "businessScore" as const,
    label: "Czy sekcja pokazuje wartość dla klienta?",
    description: "Czy odbiorca rozumie, dlaczego ta usługa jest wartościowa?",
  },
  {
    key: "trustScore" as const,
    label: "Wiarygodność",
    description: "Czy sekcja buduje zaufanie i wiarygodność marki?",
  },
  {
    key: "designScore" as const,
    label: "Jakość designu",
    description: "Czy design jest profesjonalny, spójny i czytelny?",
  },
  {
    key: "ctaScore" as const,
    label: "Czy sekcja zachęca do kontaktu lub dalszego działania?",
    description: "Czy użytkownik wie, co powinien zrobić dalej?",
  },
] as const;

export type ScoreKey = (typeof SCORE_FIELDS)[number]["key"];

// ---------------------------------------------------------------------------
// Feedback types
// ---------------------------------------------------------------------------

export const FEEDBACK_TYPES = [
  "Komunikacja",
  "Wygoda korzystania",
  "Treść",
  "Wizerunek",
  "Widoczność w Google",
  "Zachęta do kontaktu",
  "Wygląd",
  "Zaufanie",
  "Pozycja ekspercka",
  "Wizerunek pracodawcy",
  "Problemy techniczne",
] as const;

export type FeedbackType = (typeof FEEDBACK_TYPES)[number];

// ---------------------------------------------------------------------------
// Severity
// ---------------------------------------------------------------------------

export const SEVERITY_OPTIONS = [
  { value: "LOW", label: "Niski", description: "Drobna uwaga, która nie wpływa znacząco na odbiór strony." },
  { value: "MEDIUM", label: "Średni", description: "Może utrudniać zrozumienie lub odbiór sekcji." },
  { value: "HIGH", label: "Wysoki", description: "Wyraźnie obniża wiarygodność, czytelność lub skuteczność strony." },
  { value: "CRITICAL", label: "Krytyczny", description: "To problem, który warto poprawić w pierwszej kolejności." },
] as const;

export type SeverityValue = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

// ---------------------------------------------------------------------------
// Section preview configs
// ---------------------------------------------------------------------------

export type SectionPreviewConfig = {
  label: string;
  description: string;
  elements: string[];
  evaluationTips: string[];
  wireframeType: "hero" | "features" | "offer" | "cta" | "footer" | "generic";
  screenshotPath?: string;
};

export const SECTION_PREVIEWS: Record<string, SectionPreviewConfig> = {
  hero: {
    label: "Hero",
    description:
      "Główna sekcja powitalna - pierwsze wrażenie użytkownika. Decyduje o tym, czy odwiedzający zrozumie ofertę i zostanie na stronie. Czas decyzji: 5–8 sekund.",
    elements: [
      "Nagłówek H1 - core value proposition",
      "Podtytuł / Lead - rozwinięcie obietnicy",
      "Główne CTA - najważniejszy przycisk",
      "Visual element - zdjęcie, ilustracja lub video",
    ],
    evaluationTips: [
      "Czy odwiedzający rozumie ofertę w ciągu 5 sekund?",
      "Czy nagłówek mówi do właściwej grupy docelowej?",
      "Czy CTA jest wyraźnie widoczne i zachęcające?",
      "Czy visual wspiera przekaz, a nie tylko dekoruje?",
    ],
    wireframeType: "hero",
    screenshotPath: "/screenshots/hero.jpg",
  },
  "value-proposition": {
    label: "Value Proposition",
    description:
      "Sekcja uzasadnienia wyboru - dlaczego wybrać Profitia. Kluczowa dla konwersji. Musi operować konkretnymi korzyściami, nie ogólnikami.",
    elements: [
      "Nagłówek sekcji",
      "Lista korzyści lub funkcji z opisami",
      "Ikony lub ilustracje wspierające",
      "Opcjonalny subtext lub social proof",
    ],
    evaluationTips: [
      "Czy korzyści są konkretne i mierzalne?",
      "Czy odpowiadają na realne problemy klientów?",
      "Czy język jest zrozumiały dla niespecjalisty?",
      "Czy wyróżnia Profitia na tle konkurencji?",
    ],
    wireframeType: "features",
    screenshotPath: "/screenshots/value-proposition.jpg",
  },
  offer: {
    label: "Offer",
    description:
      "Sekcja ofertowa - konkretne usługi lub programy. Miejsce decyzji zakupowej lub kontaktowej. Powinna prowadzić do wyraźnego CTA.",
    elements: [
      "Karty usług lub ofert",
      "Opis zakresu i korzyści",
      "CTA per oferta lub wspólne",
      "Opcjonalnie: ceny, zakres, czas trwania",
    ],
    evaluationTips: [
      "Czy oferta jest czytelna i zrozumiała?",
      "Czy łatwo porównać opcje?",
      "Czy CTA prowadzi do właściwego następnego kroku?",
      "Czy brakuje ważnych informacji?",
    ],
    wireframeType: "offer",
    screenshotPath: "/screenshots/offer.jpg",
  },
  cta: {
    label: "CTA",
    description:
      "Dedykowana sekcja wezwania do działania - moment, w którym strona prosi odwiedzającego o podjęcie konkretnego kroku. Musi być prosta i bez barier.",
    elements: [
      "Nagłówek zachęcający do działania",
      "Krótki tekst wspierający decyzję",
      "Przycisk lub formularz kontaktowy",
      "Opcjonalnie: social proof (opinie, loga)",
    ],
    evaluationTips: [
      "Czy CTA jest jednoznaczne i konkretne?",
      "Czy przekaz jest na tyle motywujący?",
      "Czy następny krok jest jasny i bezpieczny?",
      "Czy nie ma barier (za dużo pól, niejasność)?",
    ],
    wireframeType: "cta",
    screenshotPath: "/screenshots/cta.jpg",
  },
  footer: {
    label: "Footer",
    description:
      "Stopka strony - nawigacja pomocnicza, dane kontaktowe i informacje prawne. Odwiedzana przez najbardziej zainteresowanych użytkowników.",
    elements: [
      "Logo i krótki opis firmy",
      "Linki nawigacyjne (usługi, blog, kontakt)",
      "Dane kontaktowe (email, telefon)",
      "Informacje prawne (RODO, regulamin, polityka)",
    ],
    evaluationTips: [
      "Czy zawiera wszystkie niezbędne linki?",
      "Czy dane kontaktowe są łatwe do znalezienia?",
      "Czy jest spójny wizualnie z resztą strony?",
      "Czy spełnia wymogi prawne (RODO, regulamin)?",
    ],
    wireframeType: "footer",
    screenshotPath: "/screenshots/footer.jpg",
  },
};

const PILLAR_SCREENSHOT_DIRS: Record<string, string> = {
  doradztwo: "/screenshots/doradztwo",
  edukacja: "/screenshots/edukacja",
  career: "/screenshots/career",
};

export function getSectionPreview(slug: string, pillarSlug?: string): SectionPreviewConfig {
  const base = SECTION_PREVIEWS[slug] ?? {
    label: slug,
    description:
      "Sekcja do oceny. Sprawdź jej jakość komunikacji, wiarygodność i skuteczność.",
    elements: ["Treść sekcji", "Elementy wizualne", "Wezwania do działania"],
    evaluationTips: [
      "Czy sekcja realizuje swój cel?",
      "Czy jest czytelna i zrozumiała?",
      "Czy design jest spójny z resztą strony?",
    ],
    wireframeType: "generic" as const,
  };

  if (pillarSlug && PILLAR_SCREENSHOT_DIRS[pillarSlug]) {
    return {
      ...base,
      screenshotPath: `${PILLAR_SCREENSHOT_DIRS[pillarSlug]}/${slug}.jpg`,
    };
  }

  return base;
}

// ---------------------------------------------------------------------------
// Architecture context content
// ---------------------------------------------------------------------------

export type ContentSection = {
  id: string;
  title: string;
  body: string[];
};

export const ARCHITECTURE_CONTEXT: ContentSection[] = [
  {
    id: "cel-strony",
    title: "Cel i przeznaczenie strony",
    body: [
      "Strona profitia.pl pełni funkcję głównego punktu konwersji dla firmy doradczej Profitia. Jej zadaniem jest przekształcenie odwiedzającego - osoby zainteresowanej rozwojem kariery, edukacją lub doradztwem - w świadomego leada lub klienta.",
      "Strona musi jednocześnie obsługiwać trzy różne grupy docelowe (filary), zachowując spójność wizualną i komunikacyjną całej marki. Kluczowym wyzwaniem jest personalizacja przekazu bez fragmentacji doświadczenia.",
      "Konwersja na stronie może oznaczać: wypełnienie formularza kontaktowego, zapis na bezpłatną konsultację, zakup programu lub pobranie materiału edukacyjnego - w zależności od filaru.",
    ],
  },
  {
    id: "filary",
    title: "Filary - struktura treści",
    body: [
      "Strona podzielona jest na trzy filary tematyczne, każdy z własną propozycją wartości i grupą docelową:",
      "Doradztwo - Usługi doradcze B2B i B2C. Skierowane do firm i osób poszukujących wsparcia eksperckiego w konkretnych obszarach biznesowych. Nacisk na kompetencje potwierdzone doświadczeniem i mierzalne wyniki.",
      "Edukacja - Programy szkoleniowe, warsztaty i kursy. Skierowane do profesjonalistów chcących rozwijać konkretne umiejętności. Nacisk na praktyczność, strukturę i efekty możliwe do zastosowania od razu.",
      "Career - Wsparcie w rozwoju kariery zawodowej. Skierowane do osób na etapie zmiany lub budowania ścieżki kariery. Nacisk na indywidualne podejście, konkretne narzędzia i osiągalne cele.",
    ],
  },
  {
    id: "sekcje",
    title: "Struktura sekcji - schemat dla każdego filaru",
    body: [
      "Każdy filar strony zbudowany jest z tych samych pięciu sekcji, dostosowanych treściowo do kontekstu danego filaru. Ta modularność zapewnia spójność doświadczenia i ułatwia iteracyjne ulepszanie.",
      "Hero - Pierwsze wrażenie. Musi natychmiast komunikować, do kogo jest skierowana oferta i co ją wyróżnia. Czas decyzji użytkownika: 5–8 sekund. Nagłówek, podtytuł, CTA i element wizualny.",
      "Value Proposition - Konkretne korzyści i powody wyboru Profitia. Nie lista funkcji - lista korzyści dla klienta. Operuje na realnych problemach i potrzebach grupy docelowej.",
      "Offer - Prezentacja konkretnej usługi lub programu z opisem zakresu. Prowadzi do CTA. Powinny być na tyle konkretne, żeby klient wiedział, czego się spodziewać.",
      "CTA - Wezwanie do działania. Musi być jednoznaczne, motywujące i wolne od barier. To moment decyzji - strona nie może go zmarnować niejasnością.",
      "Footer - Uzupełnienie nawigacyjne i prawne. Odwiedzany przez najbardziej zainteresowanych użytkowników. Ważny dla wiarygodności, dostępności i zgodności prawnej.",
    ],
  },
  {
    id: "ton",
    title: "Ton i styl komunikacji",
    body: [
      "Profitia komunikuje się w tonie profesjonalnym, ale ludzkim. Nie korporacyjnym. Nie nachalnie sprzedażowym. Konkretnym i opartym na faktach.",
      "Strona unika: abstrakcyjnego żargonu bez konkretu, obietnic bez pokrycia, generycznych fraz pasujących do każdej firmy, zwrotów w stylu \"rozwiązania szyte na miarę\" bez wyjaśnienia co to oznacza.",
      "Strona stawia na: jasność przekazu - jedno zdanie musi wystarczyć, konkretne korzyści i wyniki zamiast opisu procesu, wiarygodność potwierdzoną doświadczeniem a nie deklarowaną, partnerski ton zamiast sprzedażowego.",
    ],
  },
  {
    id: "grupy-docelowe",
    title: "Grupy docelowe i ich potrzeby",
    body: [
      "Skuteczna komunikacja wymaga precyzyjnego zrozumienia, do kogo strona mówi w danym filarze.",
      "Doradztwo: Manager lub właściciel firmy szukający konkretnego wsparcia. Potrzebuje dowodów kompetencji, przykładów podobnych projektów i czytelnego procesu współpracy.",
      "Edukacja: Profesjonalista chcący rozwinąć konkretną umiejętność. Potrzebuje jasnego opisu programu, oczekiwanych efektów i potwierdzenia, że czas jest dobrze zainwestowany.",
      "Career: Osoba na rozdrożu kariery. Potrzebuje poczucia bezpieczeństwa, że trafi do eksperta który rozumie jej sytuację, a nie sprzeda standardowy pakiet.",
    ],
  },
  {
    id: "cel-ankiety",
    title: "Cel tej ankiety",
    body: [
      "Celem tego przeglądu jest zebranie systematycznego feedbacku na temat każdej sekcji strony - ocenionej z perspektywy jasności komunikacji, wartości biznesowej, wiarygodności, jakości designu i skuteczności CTA.",
      "Każda ocena jest pomocna. Nie ma złych odpowiedzi - liczy się Twoja szczera perspektywa jako osoby zewnętrznej lub eksperta w danej dziedzinie. Perspektywa zewnętrzna widzi rzeczy, które właściciel projektu już dawno przestał zauważać.",
      "Feedback zostanie wykorzystany do iteracyjnego ulepszania strony. Priorytet poprawek wyznaczą severity i powtarzające się wzorce w odpowiedziach.",
    ],
  },
];
