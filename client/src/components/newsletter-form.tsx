import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertNewsletterSchema } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { queryClient } from "@/lib/queryClient";
import { BASE_URL } from "@/consts/general-const";

export default function NewsletterForm() {
  const { toast } = useToast();
  const form = useForm({
    resolver: zodResolver(insertNewsletterSchema),
    defaultValues: {
      name: "",
      email: "",
      rssUrl: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: typeof form.getValues) => {
      const res = await apiRequest("POST", "/api/newsletters", values);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Newsletter added",
        description: "The newsletter has been successfully added.",
      });
      form.reset();
      queryClient.invalidateQueries({
        queryKey: [`${BASE_URL}/api/newsletters`],
      });
    },
    onError: (error) => {
      console.log(error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Newsletter Name</FormLabel>
              <FormControl>
                <Input placeholder="Daily Tech News" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Newsletter Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="newsletter@example.com"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="rssUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>RSS Feed URL (Optional)</FormLabel>
              <FormControl>
                <Input
                  type="url"
                  placeholder="https://example.com/feed.xml"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={mutation.isPending}>
          Add Newsletter
        </Button>
      </form>
    </Form>
  );
}
