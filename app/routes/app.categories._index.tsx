import {
  useLoaderData,
  useNavigate,
  type HeadersFunction,
  type LoaderFunctionArgs,
} from "react-router";
import { authenticate } from "../shopify.server";
import { boundary } from "@shopify/shopify-app-react-router/server";
import prisma from "app/db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = session?.shop;

  const categories = await prisma.category.findMany({
    where: { shop },
    orderBy: { position: "asc" },
    include: { _count: { select: { faqs: true } } },
  });
  return { categories };
};

export default function CategoriesIndex() {
  const { categories } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  return (
    <s-page heading="Categories">
      <s-button
        slot="primary-action"
        variant="primary"
        onClick={() => navigate("/app/categories/new")}
      >
        Create Category
      </s-button>

      {categories.length === 0 ? (
        <s-section accessibilityLabel="Empty state section">
          <s-grid gap="base" justifyItems="center" paddingBlock="large-400">
            <s-box maxInlineSize="200px" maxBlockSize="200px">
              <s-image
                aspectRatio="1/0.5"
                src="https://cdn.shopify.com/static/images/polaris/patterns/callout.png"
                alt="Empty state graphic"
              />
            </s-box>
            <s-grid justifyItems="center" maxInlineSize="450px" gap="base">
              <s-stack alignItems="center">
                <s-heading>No categories created yet!</s-heading>
                <s-paragraph>
                  Create categories to organize your FAQs into groups.
                </s-paragraph>
              </s-stack>
              <s-button-group>
                <s-button
                  slot="primary-action"
                  accessibilityLabel="Create a new category"
                >
                  Create Category
                </s-button>
              </s-button-group>
            </s-grid>
          </s-grid>
        </s-section>
      ) : (
        <s-section padding="none" accessibilityLabel="Categories table section">
          <s-table>
            <s-table-header-row>
              <s-table-header listSlot="primary">Name</s-table-header>
              <s-table-header>Position</s-table-header>
              <s-table-header format="numeric">FAQs</s-table-header>
              <s-table-header>Created</s-table-header>
            </s-table-header-row>
            <s-table-body>
              {categories.map((cat) => (
                <s-table-row key={cat.id}>
                  <s-table-cell>
                    <s-stack direction="inline" gap="small" alignItems="center">
                      <s-link href={`/app/categories/${cat.id}`}>{cat.name}</s-link>
                    </s-stack>
                  </s-table-cell>
                  <s-table-cell>{cat.position}</s-table-cell>
                  <s-table-cell>{cat._count.faqs}</s-table-cell>
                  <s-table-cell>
                    {new Date(cat.createdAt).toLocaleDateString()}
                  </s-table-cell>
                </s-table-row>
              ))}
            </s-table-body>
          </s-table>
        </s-section>
      )}
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
