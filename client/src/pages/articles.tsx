import { useQuery } from "@tanstack/react-query";
import ArticleCard from "@/components/article-card";
import { Skeleton } from "@/components/ui/skeleton";
import { BASE_URL } from "@/consts/general-const";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { setupWebSocketConnection } from "@/services/websocket";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import type { Article } from "@shared/schema";
import { getAllArticles, storeArticles } from "@/lib/indexDB";

interface ArticlesResponse {
  articles: Article[];
  totalCount: number;
  hasMore: boolean;
}

export default function ArticlesPage() {
  const [page, setPage] = useState(1);
  const [allArticles, setAllArticles] = useState<Article[]>([]);
  const { toast } = useToast();

  const { data, isLoading, isFetching } = useQuery<ArticlesResponse>({
    queryKey: ["articles", page],
    queryFn: async () => {
      const response = await fetch(`${BASE_URL}/api/articles?page=${page}`);
      const newData = await response.json();

      storeArticles(newData.articles || []);
      return newData;
    },
  });

  const handleLoadMore = () => {
    setPage((prev) => prev + 1);
  };

  useEffect(() => {
    getAllArticles().then((articles) => {
      setAllArticles(articles);
    });

    const ws = setupWebSocketConnection({ queryClient, toast });
    ws.onmessage = async (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "NEW_ARTICLE") {
        // Show toast notification
        toast({
          title: "New Article Received",
          description: data.article.data.title,
        });
        setAllArticles((prev) => [...prev, data.article.data]);

        console.log("New article received:", data.article);
      }
    };
    return () => ws.close();
  }, [queryClient, toast, data]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Articles</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Browse through all articles from your newsletters.
        </p>
      </div>

      {isLoading && page === 1 ? (
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {[...allArticles]
              .reverse()
              .slice(0, page * 9)
              .map((article) => (
                <ArticleCard key={article._id} article={article} />
              ))}
          </div>
          {(data?.hasMore || allArticles.length > page * 9) && (
            <div className="flex justify-center mt-8">
              <Button
                onClick={handleLoadMore}
                disabled={isFetching}
                variant="outline"
              >
                {isFetching ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading more...
                  </>
                ) : (
                  "Load More"
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
