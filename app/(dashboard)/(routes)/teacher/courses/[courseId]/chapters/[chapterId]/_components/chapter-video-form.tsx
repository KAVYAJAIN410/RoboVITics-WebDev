"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import * as z from "zod";
import axios from "axios";
import MuxPlayer from "@mux/mux-player-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Pencil, PlusCircle, Video } from "lucide-react";
import { Chapter, MuxData } from "@prisma/client";

interface ChapterVideoFormProps {
    initialData: Chapter & { muxData?: MuxData | null };
    courseId: string;
    chapterId: string;
}

const formSchema = z.object({
    videoUrl: z.string().min(1, { message: "Video URL is required" }).url({ message: "Enter a valid URL" }),
});

export const ChapterVideoForm = ({
    initialData,
    courseId,
    chapterId,
}: ChapterVideoFormProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const toggleEdit = () => setIsEditing((current) => !current);

    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { videoUrl: "" },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            await axios.patch(`/api/courses/${courseId}/chapters/${chapterId}`, values);
            toast.success("Chapter updated");
            toggleEdit();
            router.refresh();
            reset();
        } catch {
            toast.error("Something went wrong");
        }
    };

    return (
        <div className="mt-6 border bg-slate-100 rounded-md p-4">
            <div className="font-medium flex items-center justify-between">
                Chapter video
                <Button onClick={toggleEdit} variant="ghost">
                    {isEditing && <>Cancel</>}
                    {!isEditing && !initialData.videoUrl && (
                        <>
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Add a video
                        </>
                    )}
                    {!isEditing && initialData.videoUrl && (
                        <>
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit video
                        </>
                    )}
                </Button>
            </div>

            {!isEditing && (
                !initialData.videoUrl ? (
                    <div className="flex items-center justify-center h-60 bg-slate-200 rounded-md">
                        <Video className="h-10 w-10 text-slate-500" />
                    </div>
                ) : (
                    <div className="relative aspect-video mt-2">
                        <MuxPlayer
                            playbackId={initialData?.muxData?.playbackId || ""}
                        />
                    </div>
                )
            )}

            {isEditing && (
                <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-2">
                    <input
                        type="text"
                        placeholder="Paste video URL (CloudFront, YouTube, etc.)"
                        {...register("videoUrl")}
                        className="p-2 border rounded-md text-sm w-full"
                    />
                    {errors.videoUrl && (
                        <p className="text-xs text-red-500">{errors.videoUrl.message}</p>
                    )}
                    <Button type="submit" className="w-fit">
                        Save URL
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                        Add a link to the video file or video platform (e.g., CloudFront, YouTube).
                    </p>
                </form>
            )}

            {initialData.videoUrl && !isEditing && (
                <div className="text-xs text-muted-foreground mt-2">
                    Videos may take a few minutes to process. Refresh if the video does not appear immediately.
                </div>
            )}
        </div>
    );
};

export default ChapterVideoForm;
