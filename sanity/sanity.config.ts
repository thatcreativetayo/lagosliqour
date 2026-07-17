import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./schemas";

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
            ...S.documentTypeListItems().filter((item) => item.getId() !== "order"),
          ]),
    }),
    visionTool(),
  ],
  schema: {
    types: schemaTypes,
  },
});
