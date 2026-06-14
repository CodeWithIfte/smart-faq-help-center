import {
    useFetcher,
    useNavigate,
    useLoaderData,
    type ActionFunctionArgs,
    type HeadersFunction,
    type LoaderFunctionArgs,
} from "react-router";
import { authenticate } from "app/shopify.server";
import { boundary } from "@shopify/shopify-app-react-router/server";
import prisma from "app/db.server";
import { useEffect, useState } from "react";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = session?.shop;

  const categories = await prisma.category.findMany({
    where: { shop },
    orderBy: { position: "asc" },
  });

  const lastFaq = await prisma.faq.findFirst({
    where: { shop },
    orderBy: { position: "desc" },
  });

  return { categories, nextPosition: (lastFaq?.position ?? 0) + 1 };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = session?.shop;

  const formData = await request.formData();
  const question = formData.get("question") as string;
  const answer = formData.get("answer") as string;
  const categoryId = formData.get("categoryId") as string;
  const position = parseInt(formData.get("position") as string, 10);
  const status = formData.get("status") === "on";

  await prisma.faq.create({
    data: {
      question,
      answer,
      position: isNaN(position) ? 0 : position,
      status,
      shop: shop!,
      categoryId: categoryId || null,
    },
  });

  return { message: "FAQ created successfully" };
};

const NewFAQPage = () => {
  const { categories, nextPosition } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const navigate = useNavigate();
  const saveBarId = "settings-save-bar";
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [position, setPosition] = useState(nextPosition);
  const [status, setStatus] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    if (fetcher.data?.message) {
      window.shopify.toast.show(fetcher.data.message);
      window.shopify.saveBar.hide(saveBarId);
      navigate("/app");
    }
  }, [fetcher.data, navigate]);

  const markUnsaved = () => {
    if (!hasUnsavedChanges) {
      setHasUnsavedChanges(true);
      window.shopify.saveBar.show(saveBarId);
    }
  };

  const handleDiscard = () => {
    setQuestion("");
    setAnswer("");
    setCategoryId("");
    setPosition(nextPosition);
    setStatus(true);
    setHasUnsavedChanges(false);
    window.shopify.saveBar.hide(saveBarId);
  };

  const handleSave = () => {
    const formData = new FormData();
    formData.append("question", question);
    formData.append("answer", answer);
    formData.append("categoryId", categoryId);
    formData.append("position", String(position));
    formData.append("status", status ? "on" : "off");
    fetcher.submit(formData, { method: "post" });
    setHasUnsavedChanges(false);
  };

  return (
    <s-page heading="Create FAQ">
      <ui-save-bar id={saveBarId}>
        <button variant="primary" onClick={handleSave}>
          Save
        </button>
        <button onClick={handleDiscard}>Discard</button>
      </ui-save-bar>
      <s-link slot="breadcrumb-actions" href="/app">
        FAQs
      </s-link>
      <s-button slot="primary-action" variant="primary" onClick={handleSave}>
        Save
      </s-button>
      <s-section heading="FAQ details">
        <s-grid gap="base">
          <s-text-field
            label="Question"
            labelAccessibilityVisibility="visible"
            placeholder="Enter the FAQ question"
            required
            value={question}
            onInput={(e) => {
              setQuestion(e.currentTarget.value);
              markUnsaved();
            }}
          />
          <s-text-area
            label="Answer"
            labelAccessibilityVisibility="visible"
            placeholder="Enter the FAQ answer"
            required
            value={answer}
            onInput={(e) => {
              setAnswer(e.currentTarget.value);
              markUnsaved();
            }}
          />
        </s-grid>
      </s-section>
      <s-box slot="aside">
        <s-section heading="Organization">
          <s-grid gap="base">
            <s-select
              label="Category"
              value={categoryId}
              onChange={(e) => {
                setCategoryId(e.currentTarget.value);
                markUnsaved();
              }}
            >
              <s-option value="">No category</s-option>
              {categories.map((cat) => (
                <s-option key={cat.id} value={cat.id}>
                  {cat.name}
                </s-option>
              ))}
            </s-select>
            <s-number-field
              label="Position"
              labelAccessibilityVisibility="visible"
              value={String(position)}
              min={0}
              details="Display order for this FAQ"
              onChange={(e) => {
                setPosition(Number(e.currentTarget.value));
                markUnsaved();
              }}
            />
            <s-switch
              label="Active"
              checked={status}
              details="Toggle to enable or disable this FAQ"
              onChange={(e) => {
                setStatus(e.currentTarget.checked);
                markUnsaved();
              }}
            />
          </s-grid>
        </s-section>
      </s-box>
    </s-page>
  );
};

export default NewFAQPage;

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
