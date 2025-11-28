import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "raviger";
import { useEffect, useState } from "react";
import { Trans, useTranslation } from "react-i18next";

import CareIcon from "@/CAREUI/icons/CareIcon";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import ConfirmActionDialog from "@/components/Common/ConfirmActionDialog";
import Loading from "@/components/Common/Loading";

import mutate from "@/Utils/request/mutate";
import query from "@/Utils/request/query";
import plugConfigApi from "@/types/plugConfig/plugConfigApi";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

interface Props {
  slug: string;
}

const formSchema = z.object({
  slug: z.string().min(1, "Slug is required"),
  meta: z
    .string()
    .min(2, "Meta JSON is required")
    .refine(
      (val) => {
        try {
          JSON.parse(val);
          return true;
        } catch {
          return false;
        }
      },
      { message: "Meta must be valid JSON" },
    ),
});

export function PlugConfigEdit({ slug }: Props) {
  const navigate = useNavigate();
  const isNew = slug === "new";
  const { t } = useTranslation();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { data: existingConfig, isLoading } = useQuery({
    queryKey: ["plug-config", slug],
    queryFn: query(plugConfigApi.get, { pathParams: { slug } }),
    enabled: !isNew,
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      slug: "",
      meta: "{}",
    },
  });

  useEffect(() => {
    if (existingConfig) {
      form.reset({
        slug: existingConfig.slug,
        meta: JSON.stringify(existingConfig.meta, null, 2),
      });
    }
  }, [existingConfig]);

  const { mutate: upsertConfig } = useMutation({
    mutationFn: isNew
      ? mutate(plugConfigApi.create)
      : mutate(plugConfigApi.update, { pathParams: { slug } }),
    onSuccess: () => navigate("/admin/apps"),
  });

  const { mutate: deleteConfig } = useMutation({
    mutationFn: mutate(plugConfigApi.delete, {
      pathParams: { slug },
    }),
    onSuccess: () => navigate("/admin/apps"),
  });

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    const meta = JSON.parse(data.meta);
    const configPayload = { ...data, meta };
    upsertConfig(configPayload);
  };

  const handleDelete = () => {
    deleteConfig(undefined);
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          {isNew ? t("create_new_config") : t("edit_config")}
        </h1>
        {!isNew && (
          <Button
            variant="destructive"
            onClick={() => setShowDeleteDialog(true)}
          >
            <CareIcon icon="l-trash-alt" className="mr-2" />
            {t("delete_config")}
          </Button>
        )}
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("slug")}</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="meta"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("meta_json")}</FormLabel>
                <FormControl>
                  <Textarea {...field} rows={10} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex gap-2">
            <Button type="submit" disabled={!form.formState.isDirty}>
              {t("save")}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/admin/apps")}
            >
              {t("cancel")}
            </Button>
          </div>
        </form>
      </Form>
      <ConfirmActionDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title={t("are_you_sure")}
        description={
          <Trans
            i18nKey="delete_config_description"
            values={{ slug: form.watch("slug") }}
            components={{ strong: <strong /> }}
          />
        }
        confirmText={t("delete")}
        onConfirm={handleDelete}
        variant="destructive"
      />
    </div>
  );
}
