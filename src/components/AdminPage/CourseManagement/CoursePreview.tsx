// components/AdminPage/CourseManagement/CoursePreview.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Course } from "@/type/course";

interface CoursePreviewProps {
  course: Course;
}

export const CoursePreview = ({ course }: CoursePreviewProps) => {
  const router = useRouter();

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
            <div className="md:col-span-2 space-y-6">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold">{course.title}</h1>
                <div className="flex flex-wrap gap-2">
                  {course.category.map((cat) => (
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
                <p className="text-lg">{course.description}</p>
              </div>
            </div>

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
                {/* Primary Button */}
                <Button className="w-full bg-[var(--color-blueOne)] hover:bg-[var(--color-accent)] hover:text-white text-white transition-colors duration-200 cursor-pointer">
                  Enroll Now
                </Button>

                {/* Conditional Outline Button */}
                {course.isPaid && (
                  <Button
                    variant="outline"
                    className="w-full border-[#156EF0] text-[#156EF0] hover:bg-[#156EF0] hover:text-white cursor-pointer transition-colors duration-200"
                  >
                    Purchase Options
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
