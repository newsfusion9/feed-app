import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Article } from "@shared/schema";
import { Link } from "wouter";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { ImageIcon, Calendar, Archive, ArchiveRestore, Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { BASE_URL } from "@/consts/general-const";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { useState } from "react";

interface ArticleCardProps {
  article: Article;
}

export default function ArticleCard({ article }: ArticleCardProps) {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    article.publishUntil ? new Date(article.publishUntil) : undefined
  );
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const publishMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest(
        "POST",
        `/api/articles/${article._id}/publish`
      );
      return res.json();
    },
    onSuccess: (data) => {
      console.log(data);
      article.published = data.published;
      toast({
        title: article.published ? "Article published" : "Article unpublished",
        description: `The article has been ${article.published ? "published" : "unpublished"
          } successfully.`,
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

  const updatePublishUntilMutation = useMutation({
    mutationFn: async (date: Date | undefined) => {
      const res = await apiRequest("PATCH", `/api/articles/${article._id}`, {
        publishUntil: date?.toISOString() || null,
      });
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Date updated",
        description: "The publish until date has been updated successfully.",
      });
      article.publishUntil = data.publishUntil;
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const archiveMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest(
        "POST",
        `/api/articles/${article._id}/archive`
      );
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: data.archived ? "Article archived" : "Article unarchived",
        description: `The article has been ${data.archived ? "archived" : "unarchived"
          } successfully.`,
      });
      article.archived = data.archived;
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    updatePublishUntilMutation.mutate(date);
    setIsCalendarOpen(false);
  };

  const navigation = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    // Check if the click originated from the calendar button or dialog
    if (
      (e.target as HTMLElement).closest(".calendar-button") ||
      (e.target as HTMLElement).closest('[role="dialog"]')
    ) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    e.preventDefault();
    e.stopPropagation();
    if (article.externalId) {
      window.open(article.externalId, "_blank");
    } else {
      window.location.href = `/articles/${article._id}`;
    }
  };

  const handlePublishToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    publishMutation.mutate();
  };

  const handleArchive = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    archiveMutation.mutate();
  };

  return (
    <Link href="" onClick={navigation} className="block cursor-pointer">
      <Card className="h-full transition-shadow hover:shadow-md overflow-hidden flex flex-col">
        <div className="relative">
          <AspectRatio ratio={16 / 9} className="bg-muted">
            {article.thumbnailUrl ? (
              <img
                src={article.thumbnailUrl}
                alt={article.title}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full">
                <ImageIcon className="h-12 w-12 text-muted-foreground opacity-50" />
              </div>
            )}
          </AspectRatio>
        </div>
        <CardHeader>
          <div className="flex items-start justify-between">
            <CardTitle className="line-clamp-2">{article.title}</CardTitle>
            <div onClick={handlePublishToggle} className="ml-2">
              {publishMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Switch
                  checked={article.published}
                  disabled={publishMutation.isPending}
                />
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-2">
            <Dialog open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 calendar-button"
                >
                  <Calendar className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Set Publish Until Date</DialogTitle>
                </DialogHeader>
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  initialFocus
                />
              </DialogContent>
            </Dialog>
            <span>
              {article.publishUntil
                ? `Until ${format(article.publishUntil, "MMM d, yyyy")}`
                : "Lifetime"}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-4 w-4 p-0"
              onClick={handleArchive}
            >
              {article.archived ?
                <ArchiveRestore
                  className={`h-4 w-4 text-primary`}
                />
                :
                <Archive
                  className={`h-4 w-4 `}
                />}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-between">
          <p
            className="line-clamp-3 text-muted-foreground"
          >{ article.content}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
