import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { File } from "lucide-react";

import { getChapter } from "@/actions/get-chapter";
import { Banner } from "@/components/banner";
import { Separator } from "@/components/ui/separator";
import { Preview } from "@/components/preview";
import { CourseProgressButton } from './_components/course-progress-button'
import { CourseEnrollButton } from './_components/course-enroll-button'

const ChapterIdPage = async ({
    params
}: {
    params: { courseId: string; chapterId: string },
}) => {
    const { userId } = auth();

    if (!userId) {
        return redirect("/");
    }

    const {
        chapter,
        course,
        videoUrl,  // Assuming you now pass the video URL directly
        attachments,
        nextChapter,
        userProgress,
        purchase,
    } = await getChapter({
        userId,
        chapterId: params.chapterId,
        courseId: params.courseId,
    });

    if (!chapter || !course) {
        return redirect("/");
    }

    const isLocked = !chapter.isFree && !purchase;
    const completeOnEnd  = !!purchase && !userProgress?.isCompleted;

    return ( 
        <div>
            {userProgress?.isCompleted && (
                <Banner
                    variant="success"
                    label="You already completed this chapter."
                />
            )}
            {isLocked && (
                <Banner
                    variant="warning"
                    label="You need to purchase this course to watch this chapter."
                />
            )}
            <div className="flex flex-col max-w-4xl mx-auto pb-20">
                <div className="p-4">
                <div className="relative aspect-video mt-2">
  {videoUrl?.includes("youtube.com") || videoUrl?.includes("youtu.be") ? (() => {
      let videoId = "";
      let endTimeInSeconds = "";
      try {
          const url = new URL(videoUrl);

          if (videoUrl.includes("youtube.com")) {
              videoId = url.searchParams.get("v") ?? "";
          } else if (videoUrl.includes("youtu.be")) {
              videoId = url.pathname.slice(1);
          }

          endTimeInSeconds = url.searchParams.get("end") ?? "";
      } catch (e) {
          console.error("Invalid YouTube URL:", videoUrl);
      }
      let embedUrl = "";

      if (videoUrl === "https://youtu.be/OXGznpKZ_sA") {
          embedUrl = "https://www.youtube.com/embed/OXGznpKZ_sA?end=11560";
      } else {
          embedUrl = `https://www.youtube.com/embed/${videoId}${endTimeInSeconds ? `?end=${endTimeInSeconds}` : ""}`;
      }

      return (
          <iframe
              className="w-full h-full rounded-md"
              width="560"
              height="315"
              src={embedUrl}
              frameBorder="0"
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
          />
      );
  })() : videoUrl?.includes("vimeo.com") ? (() => {
      let videoId = "";
      try {
          const urlParts = videoUrl.split("/");
          videoId = urlParts.pop()?.split(/[?#]/)[0] ?? "";
      } catch (e) {
          console.error("Invalid Vimeo URL:", videoUrl);
      }

      const embedUrl = `https://player.vimeo.com/video/${videoId}`;

      return (
          <iframe
              className="w-full h-full rounded-md"
              width="560"
              height="315"
              src={embedUrl}
              frameBorder="0"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
          />
      );
  })() : (
      <video
          controls
          className="w-full h-full rounded-md"
          src={videoUrl ?? undefined}
      >
          Your browser does not support the video tag.
      </video>
  )}
</div>


                </div>
                <div className="p-4 flex flex-col md:flex-row items-center justify-between">
                    <h2 className="text-2xl font-semibold mb-2">
                        {chapter.title}
                    </h2>
                    {/* {purchase ? (
                        <CourseProgressButton
                            chapterId={params.chapterId}
                            courseId={params.courseId}
                            nextChapterId={nextChapter?.id}
                            isCompleted={!!userProgress?.isCompleted}
                        />
                    ): (
                        <CourseEnrollButton
                            courseId={params.courseId}
                            price={course.price!}
                        />
                    )} */}
                </div>
                <Separator />
                <div>
                    <Preview value={chapter.description!}/>
                </div>
                {!!attachments.length && (
                    <>
                        <Separator />
                        <div className="p-4">
                            {attachments.map((attachment) => (
                                <a 
                                    href={attachment.url}
                                    target="_blank"
                                    key={attachment.id}
                                    className="flex items-center p-3 w-full bg-sky-200 border text-sky-700 rounded-md hover:underline"
                                >
                                    <File />
                                    <p className="line-clamp-1">
                                        {attachment.name}
                                    </p>
                                </a>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default ChapterIdPage;
