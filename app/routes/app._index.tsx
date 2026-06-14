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

  const faqs = await prisma.faq.findMany({
    where: { shop },
    include: { category: { select: { id: true, name: true } } },
  });
  return { faqs };
};

export default function Index() {
  const { faqs } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  return (
    <s-page heading="FAQs">
      <s-button
        slot="primary-action"
        variant="primary"
        onClick={() => navigate("/app/faqs/new")}
      >
        Create FAQ
      </s-button>

      {faqs.length === 0 ? (
        <s-section accessibilityLabel="Empty state section">
          <s-grid gap="base" justifyItems="center" paddingBlock="large-400">
            <s-box maxInlineSize="200px" maxBlockSize="200px">
              {/* aspectRatio should match the actual image dimensions (width/height) */}
              <s-image
                aspectRatio="1/0.5"
                src="https://cdn.shopify.com/static/images/polaris/patterns/callout.png"
                alt="A stylized graphic of four characters, each holding a puzzle piece"
              />
            </s-box>
            <s-grid justifyItems="center" maxInlineSize="450px" gap="base">
              <s-stack alignItems="center">
                <s-heading>No FAQs created yet!</s-heading>
                <s-paragraph>
                  Create engaging FAQs to help your customers find the
                  information
                </s-paragraph>
              </s-stack>
              <s-button-group>
                <s-button
                  slot="primary-action"
                  accessibilityLabel="Add a new puzzle"
                >
                  {" "}
                  Create FQA{" "}
                </s-button>
              </s-button-group>
            </s-grid>
          </s-grid>
        </s-section>
      ) : (
        <s-section padding="none" accessibilityLabel="Puzzles table section">
          <s-table>
            <s-table-header-row>
              <s-table-header listSlot="primary">Title</s-table-header>
              <s-table-header format="numeric">Category</s-table-header>
              <s-table-header>Created</s-table-header>
              <s-table-header>Status</s-table-header>
            </s-table-header-row>
            <s-table-body>
              {faqs.map((faq) => (
                <s-table-row key={faq.id}>
                  <s-table-cell>
                    <s-stack direction="inline" gap="small" alignItems="center">
                      <s-link href={`/app/faqs/${faq.id}`}>{faq.question}</s-link>
                    </s-stack>
                  </s-table-cell>
                  <s-table-cell>{faq.category?.name}</s-table-cell>
                  <s-table-cell>
                    {new Date(faq.updatedAt).toLocaleDateString()}
                  </s-table-cell>
                  <s-table-cell>
                    <s-badge
                      color="base"
                      tone={faq.status ? "success" : "neutral"}
                    >
                      {faq.status ? "Active" : "Inactive"}
                    </s-badge>
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
