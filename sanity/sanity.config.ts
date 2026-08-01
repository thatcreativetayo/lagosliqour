import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./schemas";
import { notifyStatusAction } from "./actions/notifyStatusAction";

const SINGLETON_TYPES = new Set(["siteSettings"]);
const SINGLETON_ACTIONS = new Set(["publish", "discardChanges", "restore"]);

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

const orderStatuses = [
  { title: "Pending", value: "pending" },
  { title: "Confirmed", value: "confirmed" },
  { title: "Processing", value: "processing" },
  { title: "Shipped", value: "shipped" },
  { title: "Delivered", value: "delivered" },
  { title: "Cancelled", value: "cancelled" },
  { title: "Failed", value: "failed" },
];

export default defineConfig({
  name: "lagos-liquor",
  title: "Lagos Liquor",
  projectId,
  dataset,
  basePath: "/studio",
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("Dashboard")
          .items([
            S.listItem()
              .title("Orders")
              .schemaType("order")
              .child(
                S.list()
                  .title("Orders")
                  .items([
                    S.listItem()
                      .title("All Orders")
                      .schemaType("order")
                      .child(
                        S.documentTypeList("order")
                          .title("All Orders")
                          .defaultOrdering([{ field: "orderDate", direction: "desc" }])
                      ),
                    ...orderStatuses.map((status) =>
                      S.listItem()
                        .title(status.title)
                        .schemaType("order")
                        .child(
                          S.documentTypeList("order")
                            .title(`${status.title} Orders`)
                            .filter('_type == "order" && status == $status')
                            .params({ status: status.value })
                            .defaultOrdering([{ field: "orderDate", direction: "desc" }])
                        )
                    ),
                  ])
              ),
            S.divider(),
            // Singleton: Site Settings (single editable document)
            S.listItem()
              .title("Site Settings")
              .id("siteSettings")
              .child(
                S.document()
                  .schemaType("siteSettings")
                  .documentId("siteSettings")
                  .title("Site Settings")
              ),
            S.divider(),
            ...S.documentTypeListItems().filter(
              (item) =>
                item.getId() !== "order" &&
                !SINGLETON_TYPES.has(item.getId() ?? "")
            ),
          ]),
    }),
    visionTool(),
  ],
  document: {
    actions: (prev, context) => {
      if (SINGLETON_TYPES.has(context.schemaType)) {
        // Singletons cannot be created, deleted, duplicated or unpublished.
        return prev.filter(
          (action) =>
            typeof action.action === "string" &&
            SINGLETON_ACTIONS.has(action.action)
        );
      }
      if (context.schemaType === "order") {
        return [...prev, notifyStatusAction];
      }
      return prev;
    },
  },
  schema: {
    types: schemaTypes,
    templates: (templates) =>
      templates.filter((t) => !SINGLETON_TYPES.has(t.schemaType)),
  },
});
