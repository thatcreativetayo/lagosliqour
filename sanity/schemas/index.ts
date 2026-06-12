import { siteSettingsSchema } from "./siteSettings";
import { wineSchema } from "./wine";
import { wineCategorySchema } from "./wineCategory";

export const schemaTypes = [wineSchema, wineCategorySchema, siteSettingsSchema];
