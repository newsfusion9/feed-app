import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import type { Article, Newsletter } from "@shared/schema";
import { BASE_URL } from "@/consts/general-const";

export default function Home() {
  const { data: response, isLoading: articlesLoading } = useQuery<{ articles: Article[] }>({
    queryKey: [`${BASE_URL}/api/articles/`],
  });

  const { data: newsletters, isLoading: newslettersLoading } = useQuery<Newsletter[]>({
    queryKey: [`${BASE_URL}/api/newsletters`],
  });

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-col items-center text-center space-y-3 md:space-y-4 py-8 md:py-12">
        <h1 className="text-3xl md:text-4xl font-bold">Newsletter Hub</h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl px-4">
          Your centralized platform for managing newsletters and transforming them
          into beautifully formatted articles.
        </p>
      </div>

      <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-lg md:text-xl">
              Recent Articles
              <Link href="/articles" className="text-sm font-normal text-muted-foreground hover:text-primary">
                View all <ArrowRight className="ml-1 h-4 w-4 inline" />
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {articlesLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ) : (
              <div className="space-y-2">
                {response?.articles?.slice(0, 5).map((article) => (
                  <Link 
                    key={article._id} 
                    href={`/articles/${article._id}`}
                    className="block hover:text-primary text-sm md:text-base"
                  >
                    {article.title}
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-lg md:text-xl">
              Active Newsletters
              <Link href="/newsletters" className="text-sm font-normal text-muted-foreground hover:text-primary">
                Manage <ArrowRight className="ml-1 h-4 w-4 inline" />
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {newslettersLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ) : (
              <div className="space-y-2">
                {newsletters
                  ?.filter((n) => n.active)
                  .map((newsletter) => (
                    <div key={newsletter.id} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                      <span className="font-medium text-sm md:text-base">{newsletter.name}</span>
                      <span className="text-xs md:text-sm text-muted-foreground">
                        ({newsletter.email})
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}