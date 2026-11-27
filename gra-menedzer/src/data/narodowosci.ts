// Narodowości zawodników (obcokrajowcy od Klasy B po Ekstraklasę). Dane generyczne (popularne imiona/nazwiska).
// ue = czy kraj jest w UE/EOG (brak limitu w PL); false = „spoza UE" (limit wg przepisów PZPN).

export interface Narodowosc {
  kraj: string;
  flaga: string; // emoji
  ue: boolean;
  waga: number;  // jak często pojawia się w polskich klubach
  imiona: string[];
  nazwiska: string[];
}

export const NARODOWOSCI: Narodowosc[] = [
  { kraj: "Ukraina", flaga: "🇺🇦", ue: false, waga: 10,
    imiona: ["Ołeh", "Wołodymyr", "Andrij", "Serhij", "Bohdan", "Jurij", "Taras", "Mykoła"],
    nazwiska: ["Kowalenko", "Szewczenko", "Bondarenko", "Melnyk", "Tkaczenko", "Kowalczuk", "Kowal", "Hrycenko"] },
  { kraj: "Brazylia", flaga: "🇧🇷", ue: false, waga: 7,
    imiona: ["Lucas", "Rafael", "Gabriel", "Matheus", "Bruno", "Thiago", "Felipe", "Diego"],
    nazwiska: ["Silva", "Santos", "Oliveira", "Souza", "Pereira", "Costa", "Almeida", "Ribeiro"] },
  { kraj: "Hiszpania", flaga: "🇪🇸", ue: true, waga: 4,
    imiona: ["Sergio", "Pablo", "Álvaro", "Javier", "Carlos", "Marc", "Adrián", "Rubén"],
    nazwiska: ["García", "Martínez", "López", "Sánchez", "Fernández", "Gómez", "Ruiz", "Moreno"] },
  { kraj: "Portugalia", flaga: "🇵🇹", ue: true, waga: 3,
    imiona: ["João", "Pedro", "Tiago", "Rui", "André", "Nuno", "Ricardo", "Miguel"],
    nazwiska: ["Ferreira", "Gonçalves", "Rodrigues", "Fonseca", "Carvalho", "Mendes", "Pinto", "Sousa"] },
  { kraj: "Francja", flaga: "🇫🇷", ue: true, waga: 3,
    imiona: ["Lucas", "Hugo", "Théo", "Enzo", "Nathan", "Maxime", "Antoine", "Kylian"],
    nazwiska: ["Martin", "Bernard", "Dubois", "Moreau", "Laurent", "Girard", "Lefèvre", "Rousseau"] },
  { kraj: "Niemcy", flaga: "🇩🇪", ue: true, waga: 3,
    imiona: ["Leon", "Max", "Niklas", "Jonas", "Tim", "Florian", "Lukas", "Felix"],
    nazwiska: ["Müller", "Schmidt", "Schneider", "Fischer", "Weber", "Wagner", "Becker", "Hoffmann"] },
  { kraj: "Czechy", flaga: "🇨🇿", ue: true, waga: 3,
    imiona: ["Jakub", "Tomáš", "Petr", "Martin", "Ondřej", "David", "Lukáš", "Vojtěch"],
    nazwiska: ["Novák", "Svoboda", "Dvořák", "Černý", "Procházka", "Kučera", "Veselý", "Horák"] },
  { kraj: "Słowacja", flaga: "🇸🇰", ue: true, waga: 2,
    imiona: ["Marek", "Matúš", "Juraj", "Peter", "Samuel", "Michal", "Patrik", "Dávid"],
    nazwiska: ["Horváth", "Kováč", "Varga", "Baláž", "Tóth", "Szabó", "Molnár", "Lukáč"] },
  { kraj: "Chorwacja", flaga: "🇭🇷", ue: true, waga: 2,
    imiona: ["Ivan", "Luka", "Marko", "Ante", "Josip", "Mateo", "Filip", "Domagoj"],
    nazwiska: ["Horvat", "Kovačević", "Marić", "Jurić", "Novak", "Babić", "Knežević", "Perić"] },
  { kraj: "Serbia", flaga: "🇷🇸", ue: false, waga: 3,
    imiona: ["Nikola", "Stefan", "Miloš", "Marko", "Luka", "Nemanja", "Aleksandar", "Dušan"],
    nazwiska: ["Jovanović", "Petrović", "Nikolić", "Ilić", "Marković", "Stojanović", "Pavlović", "Đorđević"] },
  { kraj: "Nigeria", flaga: "🇳🇬", ue: false, waga: 3,
    imiona: ["Emeka", "Chukwu", "Ifeanyi", "Samuel", "Daniel", "Emmanuel", "Victor", "Kelechi"],
    nazwiska: ["Okafor", "Okoye", "Eze", "Nwachukwu", "Adeyemi", "Obi", "Okonkwo", "Balogun"] },
  { kraj: "Argentyna", flaga: "🇦🇷", ue: false, waga: 2,
    imiona: ["Santiago", "Mateo", "Lautaro", "Nicolás", "Tomás", "Agustín", "Joaquín", "Franco"],
    nazwiska: ["González", "Rodríguez", "Fernández", "Díaz", "Romero", "Sosa", "Benítez", "Giménez"] },
  { kraj: "Senegal", flaga: "🇸🇳", ue: false, waga: 2,
    imiona: ["Moussa", "Ibrahima", "Cheikh", "Mamadou", "Ousmane", "Abdou", "Pape", "Lamine"],
    nazwiska: ["Diop", "Ndiaye", "Sarr", "Fall", "Gueye", "Diallo", "Faye", "Sow"] },
  { kraj: "Szwecja", flaga: "🇸🇪", ue: true, waga: 1,
    imiona: ["Oskar", "Erik", "Viktor", "Gustav", "Elias", "Axel", "William", "Hugo"],
    nazwiska: ["Andersson", "Johansson", "Karlsson", "Nilsson", "Larsson", "Olsson", "Lindberg", "Bergström"] },
  { kraj: "Litwa", flaga: "🇱🇹", ue: true, waga: 1,
    imiona: ["Tomas", "Mantas", "Lukas", "Dovydas", "Rokas", "Nerijus", "Edvinas", "Gediminas"],
    nazwiska: ["Kazlauskas", "Jankauskas", "Petrauskas", "Butkus", "Urbonas", "Stankevičius", "Žukauskas", "Vaitkus"] },
];

const SUMA_WAG = NARODOWOSCI.reduce((a, n) => a + n.waga, 0);

/** Losuje narodowość (ważona). */
export function losujNarodowosc(rnd: (min: number, max: number) => number): Narodowosc {
  let r = rnd(0, SUMA_WAG);
  for (const n of NARODOWOSCI) { if (r < n.waga) return n; r -= n.waga; }
  return NARODOWOSCI[0];
}


/** Pozostałe kraje (realni zawodnicy Ekstraklasa → II liga) — tylko flaga i status UE/EOG; nie są losowane (waga 0).
 *  Uwaga: Szwajcaria/Norwegia/Islandia (EFTA/EOG) traktowane jak UE wg przepisów o cudzoziemcach; Anglia/Walia/Irl. Płn. po brexicie — spoza UE. */
const KRAJE_POZOSTALE: Narodowosc[] = [
  { kraj: "Albania", flaga: "🇦🇱", ue: false, waga: 0, imiona: [], nazwiska: [] },
  { kraj: "Anglia", flaga: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", ue: false, waga: 0, imiona: [], nazwiska: [] },
  { kraj: "Angola", flaga: "🇦🇴", ue: false, waga: 0, imiona: [], nazwiska: [] },
  { kraj: "Armenia", flaga: "🇦🇲", ue: false, waga: 0, imiona: [], nazwiska: [] },
  { kraj: "Australia", flaga: "🇦🇺", ue: false, waga: 0, imiona: [], nazwiska: [] },
  { kraj: "Austria", flaga: "🇦🇹", ue: true, waga: 0, imiona: [], nazwiska: [] },
  { kraj: "Azerbejdżan", flaga: "🇦🇿", ue: false, waga: 0, imiona: [], nazwiska: [] },
  { kraj: "Belgia", flaga: "🇧🇪", ue: true, waga: 0, imiona: [], nazwiska: [] },
  { kraj: "Białoruś", flaga: "🇧🇾", ue: false, waga: 0, imiona: [], nazwiska: [] },
  { kraj: "Bośnia i Hercegowina", flaga: "🇧🇦", ue: false, waga: 0, imiona: [], nazwiska: [] },
  { kraj: "Burkina Faso", flaga: "🇧🇫", ue: false, waga: 0, imiona: [], nazwiska: [] },
  { kraj: "Bułgaria", flaga: "🇧🇬", ue: true, waga: 0, imiona: [], nazwiska: [] },
  { kraj: "Chile", flaga: "🇨🇱", ue: false, waga: 0, imiona: [], nazwiska: [] },
  { kraj: "Cypr", flaga: "🇨🇾", ue: true, waga: 0, imiona: [], nazwiska: [] },
  { kraj: "Czarnogóra", flaga: "🇲🇪", ue: false, waga: 0, imiona: [], nazwiska: [] },
  { kraj: "Dania", flaga: "🇩🇰", ue: true, waga: 0, imiona: [], nazwiska: [] },
  { kraj: "Demokratyczna Republika Kongo", flaga: "🇨🇩", ue: false, waga: 0, imiona: [], nazwiska: [] },
  { kraj: "Dominikana", flaga: "🇩🇴", ue: false, waga: 0, imiona: [], nazwiska: [] },
  { kraj: "Erytrea", flaga: "🇪🇷", ue: false, waga: 0, imiona: [], nazwiska: [] },
  { kraj: "Estonia", flaga: "🇪🇪", ue: true, waga: 0, imiona: [], nazwiska: [] },
  { kraj: "Finlandia", flaga: "🇫🇮", ue: true, waga: 0, imiona: [], nazwiska: [] },
  { kraj: "Gambia", flaga: "🇬🇲", ue: false, waga: 0, imiona: [], nazwiska: [] },
  { kraj: "Ghana", flaga: "🇬🇭", ue: false, waga: 0, imiona: [], nazwiska: [] },
  { kraj: "Grecja", flaga: "🇬🇷", ue: true, waga: 0, imiona: [], nazwiska: [] },
  { kraj: "Gruzja", flaga: "🇬🇪", ue: false, waga: 0, imiona: [], nazwiska: [] },
  { kraj: "Gwinea", flaga: "🇬🇳", ue: false, waga: 0, imiona: [], nazwiska: [] },
  { kraj: "Gwinea Bissau", flaga: "🇬🇼", ue: false, waga: 0, imiona: [], nazwiska: [] },
  { kraj: "Holandia", flaga: "🇳🇱", ue: true, waga: 0, imiona: [], nazwiska: [] },
  { kraj: "Honduras", flaga: "🇭🇳", ue: false, waga: 0, imiona: [], nazwiska: [] },
  { kraj: "Irak", flaga: "🇮🇶", ue: false, waga: 0, imiona: [], nazwiska: [] },
  { kraj: "Iran", flaga: "🇮🇷", ue: false, waga: 0, imiona: [], nazwiska: [] },
  { kraj: "Irlandia Północna", flaga: "🇬🇧", ue: false, waga: 0, imiona: [], nazwiska: [] },
  { kraj: "Islandia", flaga: "🇮🇸", ue: true, waga: 0, imiona: [], nazwiska: [] },
  { kraj: "Japonia", flaga: "🇯🇵", ue: false, waga: 0, imiona: [], nazwiska: [] },
  { kraj: "Kamerun", flaga: "🇨🇲", ue: false, waga: 0, imiona: [], nazwiska: [] },
  { kraj: "Kanada", flaga: "🇨🇦", ue: false, waga: 0, imiona: [], nazwiska: [] },
  { kraj: "Kenia", flaga: "🇰🇪", ue: false, waga: 0, imiona: [], nazwiska: [] },
  { kraj: "Kolumbia", flaga: "🇨🇴", ue: false, waga: 0, imiona: [], nazwiska: [] },
  { kraj: "Komory", flaga: "🇰🇲", ue: false, waga: 0, imiona: [], nazwiska: [] },
  { kraj: "Kongo", flaga: "🇨🇬", ue: false, waga: 0, imiona: [], nazwiska: [] },
  { kraj: "Kosowo", flaga: "🇽🇰", ue: false, waga: 0, imiona: [], nazwiska: [] },
  { kraj: "Macedonia Północna", flaga: "🇲🇰", ue: false, waga: 0, imiona: [], nazwiska: [] },
  { kraj: "Mali", flaga: "🇲🇱", ue: false, waga: 0, imiona: [], nazwiska: [] },
  { kraj: "Martynika", flaga: "🇲🇶", ue: true, waga: 0, imiona: [], nazwiska: [] },
  { kraj: "Mauretania", flaga: "🇲🇷", ue: false, waga: 0, imiona: [], nazwiska: [] },
  { kraj: "Mołdawia", flaga: "🇲🇩", ue: false, waga: 0, imiona: [], nazwiska: [] },
  { kraj: "Norwegia", flaga: "🇳🇴", ue: true, waga: 0, imiona: [], nazwiska: [] },
  { kraj: "Republika Zielonego Przylądka", flaga: "🇨🇻", ue: false, waga: 0, imiona: [], nazwiska: [] },
  { kraj: "Rosja", flaga: "🇷🇺", ue: false, waga: 0, imiona: [], nazwiska: [] },
  { kraj: "Rumunia", flaga: "🇷🇴", ue: true, waga: 0, imiona: [], nazwiska: [] },
  { kraj: "Salwador", flaga: "🇸🇻", ue: false, waga: 0, imiona: [], nazwiska: [] },
  { kraj: "Stany Zjednoczone", flaga: "🇺🇸", ue: false, waga: 0, imiona: [], nazwiska: [] },
  { kraj: "Surinam", flaga: "🇸🇷", ue: false, waga: 0, imiona: [], nazwiska: [] },
  { kraj: "Szwajcaria", flaga: "🇨🇭", ue: true, waga: 0, imiona: [], nazwiska: [] },
  { kraj: "Słowenia", flaga: "🇸🇮", ue: true, waga: 0, imiona: [], nazwiska: [] },
  { kraj: "Tunezja", flaga: "🇹🇳", ue: false, waga: 0, imiona: [], nazwiska: [] },
  { kraj: "Turcja", flaga: "🇹🇷", ue: false, waga: 0, imiona: [], nazwiska: [] },
  { kraj: "Uganda", flaga: "🇺🇬", ue: false, waga: 0, imiona: [], nazwiska: [] },
  { kraj: "Uzbekistan", flaga: "🇺🇿", ue: false, waga: 0, imiona: [], nazwiska: [] },
  { kraj: "Walia", flaga: "🏴󠁧󠁢󠁷󠁬󠁳󠁿", ue: false, waga: 0, imiona: [], nazwiska: [] },
  { kraj: "Wenezuela", flaga: "🇻🇪", ue: false, waga: 0, imiona: [], nazwiska: [] },
  { kraj: "Wybrzeże Kości Słoniowej", flaga: "🇨🇮", ue: false, waga: 0, imiona: [], nazwiska: [] },
  { kraj: "Wyspy Świętego Tomasza i Książęca", flaga: "🇸🇹", ue: false, waga: 0, imiona: [], nazwiska: [] },
  { kraj: "Węgry", flaga: "🇭🇺", ue: true, waga: 0, imiona: [], nazwiska: [] },
  { kraj: "Włochy", flaga: "🇮🇹", ue: true, waga: 0, imiona: [], nazwiska: [] },
  { kraj: "Łotwa", flaga: "🇱🇻", ue: true, waga: 0, imiona: [], nazwiska: [] },
  { kraj: "Polska", flaga: "🇵🇱", ue: true, waga: 0, imiona: [], nazwiska: [] },
];

/** Kraj → dane narodowości (do flagi/UE w UI i przepisach). */
export function narodowoscKraju(kraj?: string): Narodowosc | undefined {
  return kraj ? (NARODOWOSCI.find((n) => n.kraj === kraj) ?? KRAJE_POZOSTALE.find((n) => n.kraj === kraj)) : undefined;
}
