import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDistance } from "date-fns";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { ImageIcon } from "lucide-react";
import { BASE_URL } from "@/consts/general-const";

export default function Article() {
  const { id } = useParams();
  const { toast } = useToast();

  const { data: article, isLoading } = useQuery({
    queryKey: [`${BASE_URL}/api/articles`, id],
    queryFn: async ({ queryKey }) => {
      const res = await fetch(`${queryKey[0]}/${queryKey[1]}`);
      if (!res.ok) throw new Error("Article not found");
      return res.json();
    },
  });

  const publishMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/articles/${id}/publish`);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Article published",
        description: "The article has been published successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/articles", id] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[400px] w-full" /> {/* Skeleton for thumbnail */}
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-1/4" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    );
  }

  if (!article) {
    return <div>Article not found</div>;
  }

  return (
    <article className="max-w-3xl mx-auto prose prose-zinc dark:prose-invert">
      <div className="not-prose mb-8">
        <AspectRatio
          ratio={16 / 9}
          className="bg-muted rounded-lg overflow-hidden"
        >
          {article.thumbnailUrl ? (
            <img
              src={article.thumbnailUrl}
              alt={article.title}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full">
              <ImageIcon className="h-16 w-16 text-muted-foreground opacity-50" />
            </div>
          )}
        </AspectRatio>
      </div>

      <h1>{article.title}</h1>

      <div className="flex items-center gap-4 not-prose">
        {article.published ? (
          <p className="text-sm text-muted-foreground">
            Published{" "}
            {formatDistance(new Date(article.publishedAt!), new Date(), {
              addSuffix: true,
            })}
          </p>
        ) : (
          <Button
            onClick={() => publishMutation.mutate()}
            disabled={publishMutation.isPending}
          >
            Publish Article
          </Button>
        )}
      </div>

      <div
        dangerouslySetInnerHTML={{ __html: article.content }}
        className="mt-8"
      ></div>
    </article>
  );
}
