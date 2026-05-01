import { cookies } from "next/headers";
import en from "./dictionaries/en.json";
import uk from "./dictionaries/uk.json";
import pl from "./dictionaries/pl.json";

const dictionaries: any = { en, uk, pl };

export async function getServerTranslation() {
    const cookieStore = await cookies();
    const lang = cookieStore.get("migra_lang")?.value || "en";
    const dict = dictionaries[lang] || dictionaries.en;

    return {
        t: (key: string) => {
            const keys = key.split(".");
            let result = dict;
            for (const k of keys) {
                if (result[k]) {
                    result = result[k];
                } else {
                    return key;
                }
            }
            return typeof result === "string" ? result : key;
        },
        lang
    };
}
