"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import * as z from "zod";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { PlusCircle, File, Loader2, X } from "lucide-react";
import { Attachment, Course } from "@prisma/client";

interface AttachmentFormProps {
    initialData: Course & { attachments: Attachment[] };
    courseId: string;
}

const formSchema = z.object({
    url: z.string().min(1, { message: "URL is required" }).url({ message: "Enter a valid URL" }),
});

export const AttachmentForm = ({
    initialData,
    courseId,
}: AttachmentFormProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const toggleEdit = () => setIsEditing((current) => !current);
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { url: "" },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            await axios.post(`/api/courses/${courseId}/attachments`, values);
            toast.success("Attachment added");
            toggleEdit();
            router.refresh();
            reset();
        } catch {
            toast.error("Something went wrong");
        }
    };

    const onDelete = async (id: string) => {
        try {
            setDeletingId(id);
            await axios.delete(`/api/courses/${courseId}/attachments/${id}`);
            toast.success("Attachment deleted");
            router.refresh();
        } catch {
            toast.error("Something went wrong");
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="mt-6 border bg-slate-100 rounded-md p-4">
            <div className="font-medium flex items-center justify-between">
                Course attachments
                <Button onClick={toggleEdit} variant="ghost">
                    {isEditing ? <>Cancel</> : (
                        <>
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Add a link
                        </>
                    )}
                </Button>
            </div>

            {!isEditing && (
                <>
                    {initialData.attachments.length === 0 && (
                        <p className="text-sm mt-2 text-slate-500 italic">
                            No attachments yet.
                        </p>
                    )}
                    {initialData.attachments.length > 0 && (
                        <div className="space-y-2 mt-2">
                            {initialData.attachments.map((attachment) => (
                                <div
                                    key={attachment.id}
                                    className="flex items-center p-3 w-full bg-sky-100 border-sky-200 border text-sky-700 rounded-md"
                                >
                                    <File className="h-4 w-4 mr-2 flex-shrink-0" />
                                    <a
                                        href={attachment.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs line-clamp-1 underline"
                                    >
                                        {attachment.name || attachment.url}
                                    </a>
                                    <div className="ml-auto">
                                        {deletingId === attachment.id ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <button
                                                onClick={() => onDelete(attachment.id)}
                                                className="hover:opacity-75 transition"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {isEditing && (
                <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-2">
                    <input
                        type="text"
                        placeholder="Paste CloudFront URL here"
                        {...register("url")}
                        className="p-2 border rounded-md text-sm w-full"
                    />
                    {errors.url && (
                        <p className="text-xs text-red-500">{errors.url.message}</p>
                    )}
                    <Button type="submit" className="w-fit">
                        Save URL
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                        Add any public link your students might need (e.g., CloudFront, Dropbox, Google Drive with public access).
                    </p>
                </form>
            )}
        </div>
    );
};

export default AttachmentForm;
