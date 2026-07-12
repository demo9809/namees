import Link from "next/link";
import { Plus, MoreVertical } from "lucide-react";
import { db } from "@/lib/db";
import { format } from "date-fns";

export default async function CampaignsPage() {
  const campaigns = await db.campaign.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold leading-7 text-gray-900 -white">Campaigns</h1>
          <p className="mt-2 text-sm text-gray-700 -gray-300">
            A list of all campaigns in your account including their name, status, and dates.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <Link
            href="/campaigns/new"
            className="flex items-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            <Plus className="h-4 w-4" />
            New Campaign
          </Link>
        </div>
      </div>
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg -white/10">
              <table className="min-w-full divide-y divide-gray-300 -gray-700">
                <thead className="bg-gray-50 -gray-800">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6 -white">
                      Name
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 -white">
                      Status
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 -white">
                      Duration
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white -gray-700 -gray-900">
                  {campaigns.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-3 py-8 text-center text-sm text-gray-500 -gray-400">
                        No campaigns found. Start by creating one.
                      </td>
                    </tr>
                  ) : (
                    campaigns.map((campaign) => (
                      <tr key={campaign.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 -white">
                          {campaign.name}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                          <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                            campaign.status === "ACTIVE" ? "bg-green-50 text-green-700 ring-green-600/20 -green-900/30 -green-400" :
                            campaign.status === "COMPLETED" ? "bg-gray-50 text-gray-600 ring-gray-500/10 -gray-800 -gray-400" :
                            "bg-yellow-50 text-yellow-800 ring-yellow-600/20 -yellow-900/30 -yellow-500"
                          }`}>
                            {campaign.status}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 -gray-400">
                          {format(new Date(campaign.startDate), "MMM d, yyyy")} - {format(new Date(campaign.endDate), "MMM d, yyyy")}
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <button className="text-gray-400 hover:text-gray-500 -gray-300">
                            <span className="sr-only">Options for {campaign.name}</span>
                            <MoreVertical className="h-5 w-5" aria-hidden="true" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
