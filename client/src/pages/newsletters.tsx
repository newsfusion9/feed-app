import { useQuery } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import NewsletterForm from "@/components/newsletter-form";
import OpmlImport from "@/components/opml-import";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Rss } from "lucide-react";
import { FaTrash } from "react-icons/fa";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { BASE_URL } from "@/consts/general-const";
import { INewsletter } from "@/types/index.types";

export default function Newsletters() {
  const { toast } = useToast();
  const { data: newsletters, isLoading } = useQuery({
    queryKey: [`${BASE_URL}/api/newsletters`],
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const res = await apiRequest("PATCH", `/api/newsletters/${id}/status`, {
        active,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`${BASE_URL}/api/newsletters`],
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const fetchRSSMutation = useMutation({
    mutationFn: async (_id: string) => {
      const res = await apiRequest("POST", `/api/newsletters/${_id}/fetch-rss`);
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "RSS Articles Fetched",
        description: `Successfully fetched ${data.length} articles from the RSS feed.`,
      });
      queryClient.invalidateQueries({ queryKey: [`${BASE_URL}/api/articles`] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // remove newsletter
  const removeNewsletterMutation = useMutation({
    mutationFn: async (_id: string) => {
      const res = await apiRequest("DELETE", `/api/newsletters/${_id}`);
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Remove Newsletter",
        description: `Successfully removed newsletter.`,
      });
      queryClient.invalidateQueries({
        queryKey: [`${BASE_URL}/api/newsletters`],
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold mb-2">
          Manage Newsletters
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Add and manage your newsletter subscriptions.
        </p>
      </div>

      <div className="grid gap-6 md:gap-8 grid-cols-1 lg:grid-cols-2">
        <div className="space-y-6 md:space-y-8">
          <div>
            <h2 className="text-lg md:text-xl font-semibold mb-4">
              Add Newsletter
            </h2>
            <NewsletterForm />
          </div>

          <OpmlImport />
        </div>

        <div>
          <h2 className="text-lg md:text-xl font-semibold mb-4">
            Active Newsletters
          </h2>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden sm:table-cell">
                      Email
                    </TableHead>
                    <TableHead className="w-20">Status</TableHead>
                    <TableHead className="w-16">RSS</TableHead>
                    <TableHead className="w-16">Remove</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(newsletters as Array<INewsletter>)?.map((newsletter, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <div className="flex flex-col sm:flex-row">
                          <span>{newsletter.name}</span>
                          <span className="text-xs text-muted-foreground sm:hidden">
                            {newsletter.email}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {newsletter.email}
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={newsletter.active}
                          onCheckedChange={(checked) => {
                            statusMutation.mutate({
                              id: newsletter._id,
                              active: checked,
                            });
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        {newsletter.rssUrl && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              fetchRSSMutation.mutate(newsletter._id)
                            }
                            disabled={fetchRSSMutation.isPending}
                          >
                            <Rss className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            removeNewsletterMutation.mutate(newsletter._id)
                          }
                          disabled={removeNewsletterMutation.isPending}
                        >
                          <FaTrash />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
