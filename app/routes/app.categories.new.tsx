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

  const lastCat = await prisma.category.findFirst({
    where: { shop },
    orderBy: { position: "desc" },
  });

  return { nextPosition: (lastCat?.position ?? 0) + 1 };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = session?.shop;

  const formData = await request.formData();
  const name = formData.get("name") as string;
  const position = parseInt(formData.get("position") as string, 10);

  await prisma.category.create({
    data: {
      name,
      position: isNaN(position) ? 0 : position,
      shop: shop!,
    },
  });

  return { message: "Category created successfully" };
};

const NewCategoryPage = () => {
  const { nextPosition } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const navigate = useNavigate();
  const saveBarId = "settings-save-bar";
  const [name, setName] = useState("");
  const [position, setPosition] = useState(nextPosition);
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
    setName("");
    setPosition(nextPosition);
    setHasUnsavedChanges(false);
    window.shopify.saveBar.hide(saveBarId);
  };

  const handleSave = () => {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("position", String(position));
    fetcher.submit(formData, { method: "post" });
    setHasUnsavedChanges(false);
  };

  return (
    <s-page heading="Create Category">
      <ui-save-bar id={saveBarId}>
        <button variant="primary" onClick={handleSave}>
          Save
        </button>
        <button onClick={handleDiscard}>Discard</button>
      </ui-save-bar>
      <s-link slot="breadcrumb-actions" href="/app/categories">
        Categories
      </s-link>
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

export default NewCategoryPage;

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
