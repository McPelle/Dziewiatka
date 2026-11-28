// Dobór oryginalnego logo rozgrywek po nazwie ligi/pucharu (bez zależności od React Native — testowalne).
import { wojLigi } from "../engine/regiony";

export type KluczLogo = "ekstraklasa" | "l1" | "l2" | "l3" | "superpuchar" | "pucharpolski" | "lm" | "le" | "lk" | "zpnPom" | "zpnKp" | "zpnZach" | "zpnMal" | "l4Kp" | "l4Zach" | "zpnWm" | "zpnPod" | "l4Wm" | "ppWm" | "l4Mal" | "zpnLub" | "zpnOpo" | "l4Opo" | "okrOpo" | "aOpo" | "bOpo";
export function kluczLogoLigi(nazwa: string, poziom?: number): KluczLogo | null {
  if (/Liga Mistrz|Champions|\bLM\b|UCL/i.test(nazwa)) return "lm";
  if (/Liga Europy|Europa League|\bLE\b|UEL/i.test(nazwa)) return "le";
  if (/Liga Konferencji|Conference|\bLK\b|UECL/i.test(nazwa)) return "lk";
  if (/Superpuchar/i.test(nazwa)) return "superpuchar";
  if (/Puchar/i.test(nazwa) && /warmi[ńn]sko|WMZPN/i.test(nazwa)) return "ppWm"; // WMZPN ma własne logo pucharu wojewódzkiego (WPP)
  if (/Puchar Polski/i.test(nazwa)) return "pucharpolski";
  if (/Ekstraklasa/i.test(nazwa) || poziom === 1) return "ekstraklasa";
  if (/(^|\s)1\.?\s*Liga|^I liga/i.test(nazwa) || poziom === 2) return "l1";
  if (/(^|\s)2\.?\s*Liga|^II liga/i.test(nazwa) || poziom === 3) return "l2";
  if (/(^|\s)3\.?\s*Liga|^III liga/i.test(nazwa) || poziom === 4) return "l3";
  if (/Superpuchar/i.test(nazwa)) return "superpuchar";
  if (/Puchar Polski/i.test(nazwa) && !/ZPN|wojewódz|regional/i.test(nazwa)) return "pucharpolski";
  // IV liga → klasa B (i puchary wojewódzkie): rozgrywki wojewódzkich ZPN — oryginalne logo ligi albo herb związku
  const w = wojLigi(nazwa)?.[0] ?? (/warmi[ńn]sko|WMZPN/i.test(nazwa) ? "warmińsko-mazurskie" : /podlask/i.test(nazwa) ? "podlaskie" : /lubusk|LZPN/i.test(nazwa) ? "lubuskie" : /(^|[^łl])opolsk|OZPN/i.test(nazwa) ? "opolskie" : /zachodniopomorsk|ZZPN/i.test(nazwa) ? "zachodniopomorskie" : /kujawsko|K-PZPN/i.test(nazwa) ? "kujawsko-pomorskie" : /pomorsk|Pomorski ZPN/i.test(nazwa) ? "pomorskie" : /małopol|MZPN|Krak/i.test(nazwa) ? "małopolskie" : undefined);
  const iv = /\bIV liga/i.test(nazwa);
  if (w === "kujawsko-pomorskie") return iv ? "l4Kp" : "zpnKp";
  if (w === "zachodniopomorskie") return iv ? "l4Zach" : "zpnZach";
  if (w === "warmińsko-mazurskie") return /Puchar/i.test(nazwa) ? "ppWm" : iv ? "l4Wm" : "zpnWm";
  if (w === "podlaskie") return "zpnPod"; // IV liga podlaska i puchar Podlaskiego ZPN nie mają własnego logo — herb związku
  if (w === "lubuskie") return "zpnLub"; // KEEZA IV liga/okręgowa/A/B nie mają własnego logo (tylko sponsor) — herb LZPN
  if (w === "opolskie") return /Puchar/i.test(nazwa) ? "zpnOpo" : iv ? "l4Opo" : /okręgow/i.test(nazwa) ? "okrOpo" : /klasa A/i.test(nazwa) ? "aOpo" : /klasa B/i.test(nazwa) ? "bOpo" : "zpnOpo";
  if (w === "pomorskie") return "zpnPom";
  if (w === "małopolskie") return iv ? "l4Mal" : "zpnMal"; // TEXOM Małopolska 4. Liga — własne logo
  return null;
}
