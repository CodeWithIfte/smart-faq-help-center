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

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = session?.shop;
  const { id } = params;

  const faq = await prisma.faq.findFirst({
    where: { id, shop },
    include: { category: { select: { id: true, name: true } } },
  });

  if (!faq) {
    throw new Response("FAQ not found", { status: 404 });
  }

  const categories = await prisma.category.findMany({
    where: { shop },
    orderBy: { position: "asc" },
  });

  return { faq, categories };
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const { id } = params;

  const formData = await request.formData();
  const _action = formData.get("_action") as string;

  if (_action === "delete") {
    await prisma.faq.delete({ where: { id } });
    return { message: "FAQ deleted successfully" };
  }

  const question = formData.get("question") as string;
  const answer = formData.get("answer") as string;
  const categoryId = formData.get("categoryId") as string;
  const position = parseInt(formData.get("position") as string, 10);
  const status = formData.get("status") === "on";

  await prisma.faq.update({
    where: { id },
    data: {
      question,
      answer,
      position: isNaN(position) ? 0 : position,
      status,
      categoryId: categoryId || null,
    },
  });

  return { message: "FAQ updated successfully" };
};

const EditFAQPage = () => {
  const { faq, categories } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const navigate = useNavigate();
  const saveBarId = "settings-save-bar";
  const [question, setQuestion] = useState(faq.question);
  const [answer, setAnswer] = useState(faq.answer);
  const [categoryId, setCategoryId] = useState(faq.categoryId ?? "");
  const [position, setPosition] = useState(faq.position);
  const [status, setStatus] = useState(faq.status);
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
    setQuestion(faq.question);
    setAnswer(faq.answer);
    setCategoryId(faq.categoryId ?? "");
    setPosition(faq.position);
    setStatus(faq.status);
    setHasUnsavedChanges(false);
    window.shopify.saveBar.hide(saveBarId);
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this FAQ?")) {
      const formData = new FormData();
      formData.append("_action", "delete");
      fetcher.submit(formData, { method: "post" });
    }
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
    <s-page heading="Edit FAQ">
      <ui-save-bar id={saveBarId}>
        <button variant="primary" onClick={handleSave}>
          Save
        </button>
        <button onClick={handleDiscard}>Discard</button>
      </ui-save-bar>
      <s-link slot="breadcrumb-actions" href="/app">
        FAQs
      </s-link>
      <s-button
        slot="secondary-actions"
        variant="secondary"
        onClick={handleDelete}
      >
        Delete
      </s-button>
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

export default EditFAQPage;

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
