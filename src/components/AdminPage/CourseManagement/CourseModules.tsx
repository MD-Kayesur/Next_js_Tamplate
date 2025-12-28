// components/AdminPage/CourseManagement/CourseModules.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Plus,
  Loader2,
  ChevronUp,
  ChevronDown,
  Trash2,
  Pencil,
} from "lucide-react";
import { toast } from "sonner";
import { Course, CourseModule, Lesson } from "@/type/course";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";

interface CourseModulesProps {
  course: Course;
}

export const CourseModules = ({ course }: CourseModulesProps) => {
  const router = useRouter();
  const [modules, setModules] = useState<CourseModule[]>(course.modules || []);
  const [isSaving, setIsSaving] = useState(false);
  const [editingModule, setEditingModule] = useState<CourseModule | null>(null);
  const [editingLesson, setEditingLesson] = useState<{
    moduleId: string;
    lesson: Lesson;
  } | null>(null);
  const [isAddingModule, setIsAddingModule] = useState(false);
  const [newModule, setNewModule] = useState<Partial<CourseModule>>({
    title: "",
    description: "",
  });

  // Reorder modules and lessons after drag and drop
  const onDragEnd = (result: DropResult) => {
    const { destination, source, type } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    if (type === "module") {
      const reorderedModules = [...modules];
      const [removed] = reorderedModules.splice(source.index, 1);
      reorderedModules.splice(destination.index, 0, removed);

      // Update order property based on new position
      const updatedModules = reorderedModules.map((module, index) => ({
        ...module,
        order: index + 1,
      }));

      setModules(updatedModules);
    } else if (type === "lesson") {
      const moduleId = source.droppableId;
      const moduleIndex = modules.findIndex((m) => m.id === moduleId);
      if (moduleIndex === -1) return;

      const module = modules[moduleIndex];
      const reorderedLessons = [...module.lessons];
      const [removed] = reorderedLessons.splice(source.index, 1);
      reorderedLessons.splice(destination.index, 0, removed);

      // Update order property based on new position
      const updatedLessons = reorderedLessons.map((lesson, index) => ({
        ...lesson,
        order: index + 1,
      }));

      const updatedModules = [...modules];
      updatedModules[moduleIndex] = {
        ...module,
        lessons: updatedLessons,
      };

      setModules(updatedModules);
    }
  };

  const handleAddModule = () => {
    setIsAddingModule(true);
    setNewModule({
      title: "",
      description: "",
    });
  };

  const handleSaveNewModule = () => {
    if (!newModule.title) {
      toast.error("Module title is required");
      return;
    }

    setModules([
      ...modules,
      {
        id: `temp-${Date.now()}`,
        title: newModule.title,
        description: newModule.description || "",
        order: modules.length + 1,
        lessons: [],
      },
    ]);
    setIsAddingModule(false);
    setNewModule({
      title: "",
      description: "",
    });
  };

  const handleUpdateModule = (id: string, updates: Partial<CourseModule>) => {
    setModules(
      modules.map((module) =>
        module.id === id ? { ...module, ...updates } : module
      )
    );
  };

  const handleDeleteModule = (id: string) => {
    setModules(modules.filter((module) => module.id !== id));
    if (editingModule?.id === id) {
      setEditingModule(null);
    }
  };

  const handleAddLesson = (moduleId: string) => {
    setEditingLesson({
      moduleId,
      lesson: {
        id: `temp-lesson-${Date.now()}`,
        title: "",
        duration: 0,
        content: "",
        order: modules.find((m) => m.id === moduleId)?.lessons.length || 0 + 1,
      },
    });
  };

  const handleSaveLesson = () => {
    if (!editingLesson) return;

    const { moduleId, lesson } = editingLesson;
    if (!lesson.title) {
      toast.error("Lesson title is required");
      return;
    }

    setModules(
      modules.map((module) => {
        if (module.id === moduleId) {
          const existingLessonIndex = module.lessons.findIndex(
            (l) => l.id === lesson.id
          );

          if (existingLessonIndex >= 0) {
            // Update existing lesson
            const updatedLessons = [...module.lessons];
            updatedLessons[existingLessonIndex] = lesson as Lesson;
            return { ...module, lessons: updatedLessons };
          } else {
            // Add new lesson
            return {
              ...module,
              lessons: [
                ...module.lessons,
                {
                  ...(lesson as Lesson),
                  order: module.lessons.length + 1,
                },
              ],
            };
          }
        }
        return module;
      })
    );

    setEditingLesson(null);
  };

  const handleDeleteLesson = (moduleId: string, lessonId: string) => {
    setModules(
      modules.map((module) => {
        if (module.id === moduleId) {
          return {
            ...module,
            lessons: module.lessons.filter((lesson) => lesson.id !== lessonId),
          };
        }
        return module;
      })
    );

    if (editingLesson?.lesson.id === lessonId) {
      setEditingLesson(null);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Here you would typically make an API call to save the modules
      // await api.saveCourseModules(course.id, modules);

      toast.success("Course modules saved successfully");
      router.push("/admin/course-management");
    } catch (error) {
      toast.error("Failed to save modules");
      console.error("Error saving modules:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full mx-auto space-y-6">
      <Button
        variant="outline"
        size="sm"
        className="mb-6"
        onClick={() => router.back()}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Courses
      </Button>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">{course.title} - Modules</h2>
          <Button onClick={handleAddModule}>
            <Plus className="h-4 w-4 mr-2" />
            Add Module
          </Button>
        </div>

        {isAddingModule && (
          <div className="border rounded-lg p-4 space-y-4 bg-gray-50">
            <div className="space-y-2">
              <Label htmlFor="module-title">Module Title</Label>
              <Input
                id="module-title"
                value={newModule.title}
                onChange={(e) =>
                  setNewModule({ ...newModule, title: e.target.value })
                }
                placeholder="Enter module title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="module-description">Description</Label>
              <Textarea
                id="module-description"
                value={newModule.description}
                onChange={(e) =>
                  setNewModule({ ...newModule, description: e.target.value })
                }
                placeholder="Enter module description"
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsAddingModule(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveNewModule}>Save Module</Button>
            </div>
          </div>
        )}

        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="modules" type="module">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-4"
              >
                {modules.map((module, moduleIndex) => (
                  <Draggable
                    key={module.id}
                    draggableId={module.id}
                    index={moduleIndex}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className="border rounded-lg p-4 space-y-4 bg-white"
                      >
                        {editingModule?.id === module.id ? (
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="edit-module-title">Title</Label>
                              <Input
                                id="edit-module-title"
                                value={editingModule.title}
                                onChange={(e) =>
                                  setEditingModule({
                                    ...editingModule,
                                    title: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="edit-module-description">
                                Description
                              </Label>
                              <Textarea
                                id="edit-module-description"
                                value={editingModule.description}
                                onChange={(e) =>
                                  setEditingModule({
                                    ...editingModule,
                                    description: e.target.value,
                                  })
                                }
                                rows={3}
                              />
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                onClick={() => setEditingModule(null)}
                              >
                                Cancel
                              </Button>
                              <Button
                                onClick={() => {
                                  handleUpdateModule(module.id, {
                                    title: editingModule.title,
                                    description: editingModule.description,
                                  });
                                  setEditingModule(null);
                                }}
                              >
                                Save Changes
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div
                              className="flex justify-between items-center"
                              {...provided.dragHandleProps}
                            >
                              <div>
                                <h3 className="text-lg font-semibold">
                                  {module.title}
                                </h3>
                                {module.description && (
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {module.description}
                                  </p>
                                )}
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setEditingModule(module)}
                                >
                                  <Pencil className="h-4 w-4 mr-2" />
                                  Edit
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteModule(module.id)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </Button>
                              </div>
                            </div>

                            <div className="space-y-3">
                              <div className="flex justify-between items-center">
                                <h4 className="font-medium">Lessons</h4>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleAddLesson(module.id)}
                                >
                                  <Plus className="h-4 w-4 mr-2" />
                                  Add Lesson
                                </Button>
                              </div>

                              <Droppable droppableId={module.id} type="lesson">
                                {(provided) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    className="space-y-2"
                                  >
                                    {module.lessons.map((lesson, index) => (
                                      <Draggable
                                        key={lesson.id}
                                        draggableId={lesson.id}
                                        index={index}
                                      >
                                        {(provided) => (
                                          <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            className="border rounded p-3 bg-gray-50"
                                          >
                                            {editingLesson?.lesson.id ===
                                            lesson.id ? (
                                              <div className="space-y-3">
                                                <div className="space-y-2">
                                                  <Label>Title</Label>
                                                  <Input
                                                    value={
                                                      editingLesson.lesson.title
                                                    }
                                                    onChange={(e) =>
                                                      setEditingLesson({
                                                        ...editingLesson,
                                                        lesson: {
                                                          ...editingLesson.lesson,
                                                          title: e.target.value,
                                                        },
                                                      })
                                                    }
                                                  />
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                  <div className="space-y-2">
                                                    <Label>
                                                      Duration (min)
                                                    </Label>
                                                    <Input
                                                      type="number"
                                                      value={
                                                        editingLesson.lesson
                                                          .duration
                                                      }
                                                      onChange={(e) =>
                                                        setEditingLesson({
                                                          ...editingLesson,
                                                          lesson: {
                                                            ...editingLesson.lesson,
                                                            duration: parseInt(
                                                              e.target.value
                                                            ),
                                                          },
                                                        })
                                                      }
                                                    />
                                                  </div>
                                                </div>
                                                <div className="space-y-2">
                                                  <Label>Content</Label>
                                                  <Textarea
                                                    value={
                                                      editingLesson.lesson
                                                        .content
                                                    }
                                                    onChange={(e) =>
                                                      setEditingLesson({
                                                        ...editingLesson,
                                                        lesson: {
                                                          ...editingLesson.lesson,
                                                          content:
                                                            e.target.value,
                                                        },
                                                      })
                                                    }
                                                    rows={4}
                                                  />
                                                </div>
                                                <div className="flex justify-end gap-2">
                                                  <Button
                                                    variant="outline"
                                                    onClick={() =>
                                                      setEditingLesson(null)
                                                    }
                                                  >
                                                    Cancel
                                                  </Button>
                                                  <Button
                                                    onClick={handleSaveLesson}
                                                  >
                                                    Save Lesson
                                                  </Button>
                                                </div>
                                              </div>
                                            ) : (
                                              <div className="flex justify-between items-center">
                                                <div>
                                                  <p className="font-medium">
                                                    {lesson.title}
                                                  </p>
                                                  <p className="text-sm text-muted-foreground">
                                                    {lesson.duration} min •{" "}
                                                    {lesson.content.substring(
                                                      0,
                                                      50
                                                    )}
                                                    {lesson.content.length > 50
                                                      ? "..."
                                                      : ""}
                                                  </p>
                                                </div>
                                                <div className="flex gap-1">
                                                  <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    {...provided.dragHandleProps}
                                                  >
                                                    <ChevronUp className="h-4 w-4" />
                                                  </Button>
                                                  <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    {...provided.dragHandleProps}
                                                  >
                                                    <ChevronDown className="h-4 w-4" />
                                                  </Button>
                                                  <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() =>
                                                      setEditingLesson({
                                                        moduleId: module.id,
                                                        lesson,
                                                      })
                                                    }
                                                  >
                                                    <Pencil className="h-4 w-4" />
                                                  </Button>
                                                  <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() =>
                                                      handleDeleteLesson(
                                                        module.id,
                                                        lesson.id
                                                      )
                                                    }
                                                  >
                                                    <Trash2 className="h-4 w-4" />
                                                  </Button>
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        )}
                                      </Draggable>
                                    ))}
                                    {provided.placeholder}
                                  </div>
                                )}
                              </Droppable>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      <div className="flex justify-end gap-4">
        <Button
          variant="outline"
          onClick={() => router.push("/admin/course-management")}
        >
          Cancel
        </Button>
        <Button
          className="bg-primary hover:bg-primary-dark text-white"
          onClick={handleSave}
          disabled={isSaving || modules.length === 0}
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </div>
  );
};

// // components/AdminPage/CourseManagement/CourseModules.tsx
// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { Label } from "@/components/ui/label";
// import {
//   ArrowLeft,
//   Plus,
//   Loader2,
//   ChevronUp,
//   ChevronDown,
//   Trash2,
//   Pencil,
// } from "lucide-react";
// import { toast } from "sonner";
// import { Course, CourseModule, Lesson } from "@/type/course";

// interface CourseModulesProps {
//   course: Course;
// }

// export const CourseModules = ({ course }: CourseModulesProps) => {
//   const router = useRouter();
//   const [modules, setModules] = useState<CourseModule[]>(course.modules || []);
//   const [isSaving, setIsSaving] = useState(false);
//   const [editingModule, setEditingModule] = useState<CourseModule | null>(null);
//   const [newLesson, setNewLesson] = useState<Partial<Lesson> | null>(null);

//   const handleAddModule = () => {
//     setModules([
//       ...modules,
//       {
//         id: `temp-${Date.now()}`,
//         title: "New Module",
//         description: "",
//         order: modules.length + 1,
//         lessons: [],
//       },
//     ]);
//   };

//   const handleUpdateModule = (id: string, updates: Partial<CourseModule>) => {
//     setModules(
//       modules.map((module) =>
//         module.id === id ? { ...module, ...updates } : module
//       )
//     );
//   };

//   const handleDeleteModule = (id: string) => {
//     setModules(modules.filter((module) => module.id !== id));
//   };

//   const handleAddLesson = (moduleId: string) => {
//     setModules(
//       modules.map((module) => {
//         if (module.id === moduleId) {
//           return {
//             ...module,
//             lessons: [
//               ...module.lessons,
//               {
//                 id: `temp-lesson-${Date.now()}`,
//                 title: "New Lesson",
//                 duration: 0,
//                 content: "",
//                 order: module.lessons.length + 1,
//               },
//             ],
//           };
//         }
//         return module;
//       })
//     );
//   };

//   const handleSave = async () => {
//     setIsSaving(true);
//     try {
//       // Simulate API call
//       await new Promise((resolve) => setTimeout(resolve, 1000));
//       toast.success("Course modules saved successfully");
//       router.push("/admin/course-management");
//     } catch (error) {
//       toast.error("Failed to save modules");
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   return (
//     <div className="w-full mx-auto space-y-6">
//       <Button
//         variant="outline"
//         size="sm"
//         className="mb-6 cursor-pointer"
//         onClick={() => router.back()}
//       >
//         <ArrowLeft className="h-4 w-4 mr-2" />
//         Back to Courses
//       </Button>

//       <div className="space-y-4">
//         <h2 className="text-2xl font-bold">{course.title} - Modules</h2>

//         <div className="space-y-6">
//           {modules.map((module) => (
//             <div key={module.id} className="border rounded-lg p-4 space-y-4">
//               <div className="flex justify-between items-center">
//                 <h3 className="text-lg font-semibold">{module.title}</h3>
//                 <div className="flex gap-2">
//                   <Button
//                     className="cursor-pointer"
//                     variant="outline"
//                     size="sm"
//                     onClick={() => setEditingModule(module)}
//                   >
//                     <Pencil className="h-4 w-4 mr-2" />
//                     Edit
//                   </Button>
//                   <Button
//                     className="cursor-pointer"
//                     variant="outline"
//                     size="sm"
//                     onClick={() => handleDeleteModule(module.id)}
//                   >
//                     <Trash2 className="h-4 w-4 mr-2" />
//                     Delete
//                   </Button>
//                 </div>
//               </div>

//               <p className="text-sm text-muted-foreground">
//                 {module.description}
//               </p>

//               <div className="space-y-2">
//                 <div className="flex justify-between items-center">
//                   <h4 className="font-medium">Lessons</h4>
//                   <Button
//                     className="cursor-pointer"
//                     variant="outline"
//                     size="sm"
//                     onClick={() => handleAddLesson(module.id)}
//                   >
//                     <Plus className="h-4 w-4 mr-2" />
//                     Add Lesson
//                   </Button>
//                 </div>

//                 <div className="space-y-2">
//                   {module.lessons.map((lesson) => (
//                     <div
//                       key={lesson.id}
//                       className="border rounded p-3 flex justify-between items-center"
//                     >
//                       <div>
//                         <p className="font-medium">{lesson.title}</p>
//                         <p className="text-sm text-muted-foreground">
//                           {lesson.duration} min •{" "}
//                           {lesson.content.substring(0, 50)}...
//                         </p>
//                       </div>
//                       <div className="flex gap-2">
//                         <Button
//                           variant="ghost"
//                           size="icon"
//                           className="cursor-pointer"
//                         >
//                           <ChevronUp className="h-4 w-4" />
//                         </Button>
//                         <Button
//                           variant="ghost"
//                           size="icon"
//                           className="cursor-pointer"
//                         >
//                           <ChevronDown className="h-4 w-4" />
//                         </Button>
//                         <Button
//                           variant="ghost"
//                           size="icon"
//                           className="cursor-pointer"
//                         >
//                           <Pencil className="h-4 w-4" />
//                         </Button>
//                         <Button
//                           variant="ghost"
//                           size="icon"
//                           className="cursor-pointer"
//                         >
//                           <Trash2 className="h-4 w-4" />
//                         </Button>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>

//         <Button className="cursor-pointer" onClick={handleAddModule}>
//           <Plus className="h-4 w-4 mr-2" />
//           Add Module
//         </Button>
//       </div>

//       <div className="flex justify-end">
//         <Button
//           className="bg-[var(--color-blueOne)] hover:bg-[var(--color-accent)] text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200 flex items-center cursor-pointer"
//           onClick={handleSave}
//           disabled={isSaving}
//         >
//           {isSaving ? (
//             <>
//               <Loader2 className="h-4 w-4 mr-2 animate-spin" />
//               Saving...
//             </>
//           ) : (
//             "Save Changes"
//           )}
//         </Button>
//       </div>
//     </div>
//   );
// };
