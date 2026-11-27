import { Platform } from "react-native";

/** Zwraca data URI wybranego zdjęcia (pomniejszonego), null gdy anulowano, "BRAK_PICKERA" gdy natywny picker niedostępny. */
export async function wybierzZdjecie(): Promise<string | null | "BRAK_PICKERA"> {
  if (Platform.OS === "web") return wybierzWeb();
  try {
    // Dynamiczny import — działa, gdy użytkownik doda `npx expo install expo-image-picker`.
    const ImagePicker = require("expo-image-picker");
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return null;
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions?.Images ?? "images",
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.6,
      base64: true,
    });
    if (res.canceled) return null;
    const a = res.assets?.[0];
    if (!a) return null;
    return a.base64 ? `data:image/jpeg;base64,${a.base64}` : (a.uri as string);
  } catch {
    return "BRAK_PICKERA";
  }
}

/** Web: ukryty input pliku + pomniejszenie przez canvas do ~160 px (mały data URI). */
function wybierzWeb(): Promise<string | null> {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = () => {
      const f = input.files && input.files[0];
      if (!f) return resolve(null);
      const r = new FileReader();
      r.onload = () => {
        const img = new Image();
        img.onload = () => {
          const max = 160;
          const sk = Math.min(max / img.width, max / img.height, 1);
          const w = Math.max(1, Math.round(img.width * sk));
          const h = Math.max(1, Math.round(img.height * sk));
          const c = document.createElement("canvas");
          c.width = w; c.height = h;
          const ctx = c.getContext("2d");
          if (!ctx) return resolve(null);
          ctx.drawImage(img, 0, 0, w, h);
          resolve(c.toDataURL("image/jpeg", 0.7));
        };
        img.onerror = () => resolve(null);
        img.src = r.result as string;
      };
      r.onerror = () => resolve(null);
      r.readAsDataURL(f);
    };
    input.click();
  });
}
