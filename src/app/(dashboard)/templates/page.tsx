import { db } from "@/lib/db";
import { UploadTemplateModal } from "@/components/templates/upload-modal";
import Link from "next/link";
import { Sparkles, Edit3, Image as ImageIcon } from "lucide-react";

export default async function TemplatesPage() {
  const templates = await db.template.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50/50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 flex items-center gap-2">
              Templates <Sparkles className="h-6 w-6 text-indigo-500" />
            </h1>
            <p className="mt-2 text-sm text-gray-500 max-w-xl">
              Your foundation for stunning promotional graphics. Upload background templates and configure Smart Grid slots for automated campaign generation.
            </p>
          </div>
          <div className="flex-shrink-0">
            <UploadTemplateModal />
          </div>
        </div>
        
        {/* Gallery Grid */}
        {templates.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white/50 backdrop-blur-sm p-16 text-center shadow-sm">
            <ImageIcon className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-sm font-semibold text-gray-900">No templates found</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by uploading your first background graphic.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {templates.map((template) => (
              <div 
                key={template.id} 
                className="group relative flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-indigo-100 hover:-translate-y-1"
              >
                {/* Image Container with Hover Overlay */}
                <div className="aspect-[4/5] w-full overflow-hidden bg-gray-100 relative">
                  <img
                    src={template.imagePath}
                    alt={template.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  
                  {/* Glassmorphism Action Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                    <div className="flex gap-2 w-full">
                      <Link
                        href={`/editor/${template.id}`}
                        className="flex-1 bg-white/90 hover:bg-white backdrop-blur text-gray-900 text-sm font-semibold py-2.5 px-4 rounded-xl text-center shadow-lg transition-colors flex items-center justify-center gap-1.5"
                      >
                        Use Template
                      </Link>
                      <Link
                        href={`/templates/${template.id}`}
                        className="bg-indigo-600/90 hover:bg-indigo-600 backdrop-blur text-white text-sm font-semibold py-2.5 px-4 rounded-xl text-center shadow-lg transition-colors flex items-center justify-center gap-1.5"
                        title="Edit Smart Grid Slots"
                      >
                        <Edit3 className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Card Meta */}
                <div className="p-5 flex flex-col gap-1 bg-white relative z-10">
                  <h3 className="text-base font-bold text-gray-900 truncate">{template.name}</h3>
                  <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
                    <span>{template.width} × {template.height} px</span>
                    <span>{new Date(template.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
