import { siteSettingsSchema } from "./siteSettings";
import { wineSchema } from "./wine";
import { wineCategorySchema } from "./wineCategory";
import { orderSchema } from "./order";
import { couponSchema } from "./coupon";

export const schemaTypes = [wineSchema, wineCategorySchema, siteSettingsSchema, orderSchema, couponSchema];
