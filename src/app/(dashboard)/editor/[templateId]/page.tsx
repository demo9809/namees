import { db } from "@/lib/db";
import { EditorWorkspace } from "@/components/editor/EditorWorkspace";
import { notFound } from "next/navigation";

export default async function EditorPage({
  params,
}: {
  params: Promise<{ templateId: string }>;
}) {
  const resolvedParams = await params;
  const templateId = resolvedParams.templateId;

  const template = await db.template.findUnique({
    where: { id: templateId },
  });

  if (!template) {
    notFound();
  }

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-64px)] -mx-4 -mt-6 sm:-mx-6 lg:-mx-8">
      {/* Editor extends to full available screen space */}
      <EditorWorkspace template={template} />
    </div>
  );
}
