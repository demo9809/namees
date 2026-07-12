"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

const campaignSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  status: z.enum(["DRAFT", "ACTIVE", "COMPLETED"]),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
});

type CampaignFormValues = z.infer<typeof campaignSchema>;

export default function NewCampaignPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CampaignFormValues>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      status: "DRAFT",
    },
  });

  const onSubmit = async (data: CampaignFormValues) => {
    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error("Failed to create campaign");
      }

      router.push("/campaigns");
      router.refresh();
    } catch (err) {
      setError("Something went wrong");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold leading-7 text-gray-900 -white">Create New Campaign</h1>
        <p className="mt-2 text-sm text-gray-700 -gray-300">
          Fill in the details to create a new poster campaign.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-900/5 -gray-800 -white/10">
        <div>
          <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900 -white">
            Campaign Name
          </label>
          <div className="mt-2">
            <input
              type="text"
              id="name"
              {...register("name")}
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 -gray-900 -white -gray-700"
            />
            {errors.name && <p className="mt-2 text-sm text-red-600">{errors.name.message}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium leading-6 text-gray-900 -white">
            Description <span className="text-gray-400">(Optional)</span>
          </label>
          <div className="mt-2">
            <textarea
              id="description"
              rows={3}
              {...register("description")}
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 -gray-900 -white -gray-700"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium leading-6 text-gray-900 -white">
              Start Date
            </label>
            <div className="mt-2">
              <input
                type="date"
                id="startDate"
                {...register("startDate")}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 -gray-900 -white -gray-700"
              />
              {errors.startDate && <p className="mt-2 text-sm text-red-600">{errors.startDate.message}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="endDate" className="block text-sm font-medium leading-6 text-gray-900 -white">
              End Date
            </label>
            <div className="mt-2">
              <input
                type="date"
                id="endDate"
                {...register("endDate")}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 -gray-900 -white -gray-700"
              />
              {errors.endDate && <p className="mt-2 text-sm text-red-600">{errors.endDate.message}</p>}
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium leading-6 text-gray-900 -white">
            Status
          </label>
          <div className="mt-2">
            <select
              id="status"
              {...register("status")}
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 -gray-900 -white -gray-700"
            >
              <option value="DRAFT">Draft</option>
              <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex items-center justify-end gap-x-6 border-t border-gray-900/10 pt-6 -white/10">
          <Link href="/campaigns" className="text-sm font-semibold leading-6 text-gray-900 -gray-300 hover:-white">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-70"
          >
            {isSubmitting ? "Creating..." : "Save Campaign"}
          </button>
        </div>
      </form>
    </div>
  );
}
