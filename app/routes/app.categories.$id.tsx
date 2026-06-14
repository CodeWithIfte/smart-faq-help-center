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

  const category = await prisma.category.findFirst({
    where: { id, shop },
    include: { _count: { select: { faqs: true } } },
  });

  if (!category) {
    throw new Response("Category not found", { status: 404 });
  }

  return { category };
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const { id } = params;

  const formData = await request.formData();
  const _action = formData.get("_action") as string;

  if (_action === "delete") {
    await prisma.category.delete({ where: { id } });
    return { message: "Category deleted successfully" };
  }

  const name = formData.get("name") as string;
  const position = parseInt(formData.get("position") as string, 10);

  await prisma.category.update({
    where: { id },
    data: {
      name,
      position: isNaN(position) ? 0 : position,
    },
  });

  return { message: "Category updated successfully" };
};

const EditCategoryPage = () => {
  const { category } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const navigate = useNavigate();
  const saveBarId = "settings-save-bar";
  const [name, setName] = useState(category.name);
  const [position, setPosition] = useState(category.position);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    if (fetcher.data?.message) {
      window.shopify.toast.show(fetcher.data.message);
      window.shopify.saveBar.hide(saveBarId);
      navigate("/app/categories");
    }
  }, [fetcher.data, navigate]);

  const markUnsaved = () => {
    if (!hasUnsavedChanges) {
      setHasUnsavedChanges(true);
      window.shopify.saveBar.show(saveBarId);
    }
  };

  const handleDiscard = () => {
    setName(category.name);
    setPosition(category.position);
    setHasUnsavedChanges(false);
    window.shopify.saveBar.hide(saveBarId);
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      const formData = new FormData();
      formData.append("_action", "delete");
      fetcher.submit(formData, { method: "post" });
    }
  };

  const handleSave = () => {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("position", String(position));
    fetcher.submit(formData, { method: "post" });
    setHasUnsavedChanges(false);
  };

  return (
    <s-page heading="Edit Category">
      <ui-save-bar id={saveBarId}>
        <button variant="primary" onClick={handleSave}>
          Save
        </button>
        <button onClick={handleDiscard}>Discard</button>
      </ui-save-bar>
      <s-link slot="breadcrumb-actions" href="/app/categories">
        Categories
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
      <s-section heading="Category details">
        <s-grid gap="base">
          <s-text-field
            label="Name"
            labelAccessibilityVisibility="visible"
            placeholder="Enter category name"
            required
            value={name}
            onInput={(e) => {
              setName(e.currentTarget.value);
              markUnsaved();
            }}
          />
        </s-grid>
      </s-section>
      <s-box slot="aside">
        <s-section heading="Organization">
          <s-grid gap="base">
            <s-number-field
              label="Position"
              labelAccessibilityVisibility="visible"
              value={String(position)}
              min={0}
              details="Display order for this category"
              onChange={(e) => {
                setPosition(Number(e.currentTarget.value));
                markUnsaved();
              }}
            />
          </s-grid>
        </s-section>
      </s-box>
    </s-page>
  );
};

export default EditCategoryPage;

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
