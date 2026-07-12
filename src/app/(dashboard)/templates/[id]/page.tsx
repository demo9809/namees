import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { TemplateSlotEditor } from "@/components/templates/TemplateSlotEditor";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function EditTemplatePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const template = await db.template.findUnique({
    where: { id: resolvedParams.id }
  });

  if (!template) {
    return notFound();
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden">
      <div className="flex items-center justify-between border-b px-6 py-4 bg-white">
        <div className="flex items-center gap-4">
          <Link href="/templates" className="text-gray-500 hover:text-gray-700">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-xl font-semibold">Edit Template Slots: {template.name}</h1>
        </div>
      </div>
      
      <div className="flex-1 overflow-hidden bg-gray-100 relative">
        <TemplateSlotEditor template={template} />
      </div>
    </div>
  );
}
