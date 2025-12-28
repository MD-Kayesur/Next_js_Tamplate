"use client";

import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import PageLoader from "@/components/AdminPage/Shared/PageLoader";
import { useGetCourseByIdQuery } from "@/redux/features/auth/courseApi";

export default function CoursePreview() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const {
    data: course,
    isLoading,
    isError,
  } = useGetCourseByIdQuery(id, {
    skip: !id, // skip query if no id yet (safety)
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <PageLoader />
      </div>
    );
  }

  if (isError || !course) {
    return (
      <div className="flex flex-col items-center justify-center h-screen space-y-4">
        <div className="text-red-500 text-lg">
          {isError
            ? "Failed to load course. Please try again later."
            : "Course not found."}
        </div>
        <Button
          variant="outline"
          onClick={() => router.push("/admin/course-management")}
        >
          Back to Courses
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto space-y-6">
      <Button
        variant="outline"
        size="sm"
        className="bg-[var(--color-blueOne)] hover:bg-[var(--color-accent)] hover:text-white text-white transition-colors duration-200 mb-6 cursor-pointer"
        onClick={() => router.back()}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Course Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Text Section */}
            <div className="md:col-span-2 space-y-6">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold">{course.title}</h1>
                <div className="flex flex-wrap gap-2">
                  {course.category.map((cat: string) => (
                    <Badge key={cat} variant="secondary" className="capitalize">
                      {cat}
                    </Badge>
                  ))}
                  <Badge
                    className={`px-2 py-1 text-xs font-medium rounded-md ${
                      course.isPaid
                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {course.isPaid ? "Paid" : "Free"}
                  </Badge>
                </div>
              </div>

              <div className="prose max-w-none">
                <p className="text-lg whitespace-pre-line">
                  {course.description}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Created At
                  </p>
                  <p className="text-sm text-gray-700">
                    {new Date(course.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Last Updated
                  </p>
                  <p className="text-sm text-gray-700">
                    {new Date(course.updatedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Thumbnail + Buttons */}
            <div className="space-y-4">
              <div className="rounded-lg overflow-hidden border aspect-video relative">
                <Image
                  src={course.thumbnail}
                  alt={course.title}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="space-y-2">
                {/* <Button className="w-full bg-[var(--color-blueOne)] hover:bg-[var(--color-accent)] hover:text-white text-white transition-colors duration-200 cursor-pointer">
                  Enroll Now
                </Button>

                {course.isPaid && (
                  <Button
                    variant="outline"
                    className="w-full border-[#156EF0] text-[#156EF0] hover:bg-[#156EF0] hover:text-white transition-colors duration-200"
                  >
                    Purchase Options
                  </Button>
                )} */}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// // src/app/admin/course-management/[id]/preview/page.tsx
// "use client";

// import { useRouter } from "next/navigation";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { ArrowLeft } from "lucide-react";
// import Image from "next/image";
// import { Badge } from "@/components/ui/badge";
// import PageLoader from "@/components/AdminPage/Shared/PageLoader";
// import { useGetCourseByIdQuery } from "@/redux/features/auth/courseApi";

// interface CoursePreviewProps {
//   params: {
//     id: string;
//   };
// }

// export default function CoursePreview({ params }: CoursePreviewProps) {
//   const router = useRouter();
//   const { data: course, isLoading, isError } = useGetCourseByIdQuery(params.id);

//   if (isLoading) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <PageLoader />
//       </div>
//     );
//   }

//   if (isError || !course) {
//     return (
//       <div className="flex flex-col items-center justify-center h-screen space-y-4">
//         <div className="text-red-500 text-lg">
//           {isError
//             ? "Failed to load course. Please try again later."
//             : "Course not found."}
//         </div>
//         <Button
//           variant="outline"
//           onClick={() => router.push("/admin/course-management")}
//         >
//           Back to Courses
//         </Button>
//       </div>
//     );
//   }

//   return (
//     <div className="w-full  mx-auto  space-y-6">
//       <Button
//         variant="outline"
//         size="sm"
//         className="bg-[var(--color-blueOne)] hover:bg-[var(--color-accent)] hover:text-white text-white transition-colors duration-200 mb-6 cursor-pointer"
//         onClick={() => router.back()}
//       >
//         <ArrowLeft className="h-4 w-4 mr-2" />
//         Back
//       </Button>

//       <Card>
//         <CardHeader>
//           <CardTitle>Course Preview</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//             {/* Text Section */}
//             <div className="md:col-span-2 space-y-6">
//               <div className="space-y-2">
//                 <h1 className="text-3xl font-bold">{course.title}</h1>
//                 <div className="flex flex-wrap gap-2">
//                   {course.category.map((cat) => (
//                     <Badge key={cat} variant="secondary" className="capitalize">
//                       {cat}
//                     </Badge>
//                   ))}
//                   <Badge
//                     className={`px-2 py-1 text-xs font-medium rounded-md ${
//                       course.isPaid
//                         ? "bg-green-100 text-green-700 hover:bg-green-200"
//                         : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//                     }`}
//                   >
//                     {course.isPaid ? "Paid" : "Free"}
//                   </Badge>
//                 </div>
//               </div>

//               <div className="prose max-w-none">
//                 <p className="text-lg whitespace-pre-line">
//                   {course.description}
//                 </p>
//               </div>

//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
//                 <div>
//                   <p className="text-sm text-muted-foreground mb-1">
//                     Created At
//                   </p>
//                   <p className="text-sm text-gray-700">
//                     {new Date(course.createdAt).toLocaleDateString("en-US", {
//                       year: "numeric",
//                       month: "long",
//                       day: "numeric",
//                     })}
//                   </p>
//                 </div>
//                 <div>
//                   <p className="text-sm text-muted-foreground mb-1">
//                     Last Updated
//                   </p>
//                   <p className="text-sm text-gray-700">
//                     {new Date(course.updatedAt).toLocaleDateString("en-US", {
//                       year: "numeric",
//                       month: "long",
//                       day: "numeric",
//                     })}
//                   </p>
//                 </div>
//               </div>
//             </div>

//             {/* Thumbnail + Buttons */}
//             <div className="space-y-4">
//               <div className="rounded-lg overflow-hidden border aspect-video relative">
//                 <Image
//                   src={course.thumbnail}
//                   alt={course.title}
//                   fill
//                   className="object-cover"
//                 />
//               </div>

//               <div className="space-y-2">
//                 <Button className="w-full bg-[var(--color-blueOne)] hover:bg-[var(--color-accent)] hover:text-white text-white transition-colors duration-200 cursor-pointer">
//                   Enroll Now
//                 </Button>

//                 {course.isPaid && (
//                   <Button
//                     variant="outline"
//                     className="w-full border-[#156EF0] text-[#156EF0] hover:bg-[#156EF0] hover:text-white transition-colors duration-200"
//                   >
//                     Purchase Options
//                   </Button>
//                 )}
//               </div>
//             </div>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
