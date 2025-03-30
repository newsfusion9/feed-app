import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { queryClient } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";
import { BASE_URL } from "@/consts/general-const";

export default function OpmlImport() {
  const [file, setFile] = useState<File | null>(null);
  const { toast } = useToast();

  const importMutation = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error("No file selected");

      toast({
        title: "Process is running in the background...",
      });

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${BASE_URL}/api/newsletters/import-opml`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to import OPML file");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`${BASE_URL}/api/newsletters`],
      });
      setFile(null);
    },
    onError: (error) => {
      toast({
        title: "Import Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Import from Feedly</h3>
      <p className="text-sm text-muted-foreground">
        Export your feeds from Feedly (Organize → OPML Export) and upload the
        file here.
      </p>
      <div className="flex gap-2">
        <Input
          type="file"
          accept=".opml,.xml"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="max-w-xs"
        />
        <Button
          onClick={() => importMutation.mutate()}
          disabled={!file || importMutation.isPending}
        >
          {importMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Importing...
            </>
          ) : (
            "Import"
          )}
        </Button>
      </div>
    </div>
  );
}
