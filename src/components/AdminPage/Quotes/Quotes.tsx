"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Quote } from "@/type/quotes";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import React, { useState } from "react";
import Title from "@/components/reuseabelComponents/Title";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";

import {
  useAddQuoteMutation,
  useDeleteQuoteMutation,
  useGetQuotesQuery,
} from "@/redux/features/auth/quoteApi";
import PageLoader from "../Shared/PageLoader";

const Quotes: React.FC = () => {
  const { data: quotes = [], isLoading, isError } = useGetQuotesQuery();
  const [addQuote] = useAddQuoteMutation();
  const [deleteQuote] = useDeleteQuoteMutation();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(8); // You can make this configurable if needed

  const [newQuote, setNewQuote] = useState<Omit<Quote, "id" | "createdAt">>({
    quote: "",
    author: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [quoteToDelete, setQuoteToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Calculate pagination values
  const totalMessages = quotes.length;
  const totalPages = Math.ceil(totalMessages / pageSize);
  const paginatedQuotes = quotes.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewQuote((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuote.quote.trim() || !newQuote.author.trim()) {
      toast.warning("Please fill in both quote and author fields");
      return;
    }

    setIsSubmitting(true);

    try {
      if (editingId) {
        toast.warning("Editing quotes is not supported yet");
      } else {
        await addQuote(newQuote).unwrap();
        toast.success("Quote added successfully");
        // Reset to first page when adding a new quote
        setCurrentPage(1);
      }
      resetForm();
    } catch (_) {
      toast.error("Failed to add quote");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!quoteToDelete) return;

    setIsDeleting(true);
    try {
      await deleteQuote(quoteToDelete).unwrap();
      toast.success("Quote deleted successfully");
      setDeleteDialogOpen(false);
      setQuoteToDelete(null);

      // Adjust current page if we deleted the last item on the page
      if (paginatedQuotes.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (_) {
      toast.error("Failed to delete quote");
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const openDeleteDialog = (id: string) => {
    setQuoteToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleEdit = (quote: Quote) => {
    setNewQuote({ quote: quote.quote, author: quote.author });
    setEditingId(quote.id.toString());
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setNewQuote({ quote: "", author: "" });
    setEditingId(null);
    setIsDialogOpen(false);
  };

  if (isLoading) return <PageLoader />;
  if (isError) return <div className="text-red-500">Error loading quotes</div>;

  return (
    <div className="w-full mx-auto">
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the quote. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer" disabled={isDeleting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90 focus-visible:ring-destructive cursor-pointer"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Quote"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex flex-col space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <Title title="Quotes Management" />
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={resetForm}
                className="bg-[var(--color-blueOne)] hover:bg-[var(--color-accent)] text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200 flex items-center cursor-pointer"
              >
                <FiPlus className="h-4 w-4 mr-2" />
                Add Quote
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>
                  {editingId ? "Edit Quote" : "Add New Quote"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <label htmlFor="quote" className="block text-sm font-medium">
                    Quote
                  </label>
                  <Textarea
                    id="quote"
                    name="quote"
                    rows={4}
                    placeholder="Enter your inspirational quote..."
                    value={newQuote.quote}
                    onChange={handleInputChange}
                    required
                    className="min-h-[120px]"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="author" className="block text-sm font-medium">
                    Author
                  </label>
                  <Input
                    type="text"
                    id="author"
                    name="author"
                    placeholder="Author name"
                    value={newQuote.author}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    className="border border-[var(--color-blueOne)] text-[var(--color-blueOne)] font-medium px-4 py-2 rounded-lg transition-colors duration-200 hover:bg-[var(--color-blueOne)/10] cursor-pointer"
                    type="button"
                    onClick={resetForm}
                    disabled={isSubmitting}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-[var(--color-blueOne)] hover:bg-[var(--color-accent)] cursor-pointer"
                  >
                    {isSubmitting
                      ? editingId
                        ? "Saving..."
                        : "Adding..."
                      : editingId
                      ? "Save Changes"
                      : "Add Quote"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="bg-background rounded-lg border shadow-sm">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-xl">
                Quotes Collection{" "}
                <span className="text-muted-foreground font-normal">
                  ({quotes.length})
                </span>
              </h2>
              <p className="text-sm text-muted-foreground">
                {quotes.length === 0
                  ? "No quotes available"
                  : `Total ${quotes.length} quotes`}
              </p>
            </div>
          </div>

          {quotes.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <FiPlus className="h-5 w-5 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-sm font-medium">No quotes yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Get started by adding your first quote.
              </p>
              <Button className="mt-6" onClick={() => setIsDialogOpen(true)}>
                <FiPlus className="h-4 w-4 mr-2" />
                Add Quote
              </Button>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader className="bg-gray-100 text-gray-700 uppercase text-sm tracking-wider">
                  <TableRow>
                    <TableHead className="w-[60%] px-4 py-3">Quote</TableHead>
                    <TableHead className="px-4 py-3">Author</TableHead>
                    <TableHead className="px-4 py-3 text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedQuotes.map((quote) => (
                    <TableRow key={quote.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium py-4 font-sans">
                        <p>{quote.quote}</p>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {quote.author}
                      </TableCell>
                      <TableCell className="text-right p-4 pr-8">
                        <Button
                          variant="outline"
                          size="sm"
                          title="Delete"
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                          onClick={() => openDeleteDialog(quote.id.toString())}
                        >
                          <FiTrash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalMessages > 0 && (
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing{" "}
                    <span className="font-medium">
                      {(currentPage - 1) * pageSize + 1}
                    </span>{" "}
                    to{" "}
                    <span className="font-medium">
                      {Math.min(currentPage * pageSize, totalMessages)}
                    </span>{" "}
                    of <span className="font-medium">{totalMessages}</span>{" "}
                    messages
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#2D0954] hover:text-white cursor-pointer"
                      style={{
                        backgroundColor: currentPage === 1 ? "white" : "white",
                        color: "#2D0954",
                        borderColor: "#2D0954",
                      }}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages || totalPages === 0}
                      className="disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#2D0954] hover:text-white cursor-pointer"
                      style={{
                        backgroundColor:
                          currentPage === totalPages ? "white" : "white",
                        color: "#2D0954",
                        borderColor: "#2D0954",
                      }}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Quotes;

// "use client";

// import { Button } from "@/components/ui/button";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { Quote } from "@/type/quotes";
// import { FiPlus, FiTrash2, FiEdit } from "react-icons/fi";
// import React, { useState } from "react";
// import Title from "@/components/reuseabelComponents/Title";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { toast } from "sonner";

// import {
//   useAddQuoteMutation,
//   useDeleteQuoteMutation,
//   useGetQuotesQuery,
// } from "@/redux/features/auth/quoteApi";
// import PageLoader from "../Shared/PageLoader";

// const Quotes: React.FC = () => {
//   const { data: quotes = [], isLoading, isError } = useGetQuotesQuery();
//   const [addQuote] = useAddQuoteMutation();
//   const [deleteQuote] = useDeleteQuoteMutation();

//   const [newQuote, setNewQuote] = useState<Omit<Quote, "id" | "createdAt">>({
//     quote: "",
//     author: "",
//   });
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [isDialogOpen, setIsDialogOpen] = useState(false);
//   const [editingId, setEditingId] = useState<string | null>(null);

//   const handleInputChange = (
//     e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
//   ) => {
//     const { name, value } = e.target;
//     setNewQuote((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!newQuote.quote.trim() || !newQuote.author.trim()) {
//       toast.warning("Please fill in both quote and author fields");
//       return;
//     }

//     setIsSubmitting(true);

//     try {
//       if (editingId) {
//         toast.warning("Editing quotes is not supported yet");
//       } else {
//         await addQuote(newQuote).unwrap();
//         toast.success("Quote added successfully");
//       }
//       resetForm();
//     } catch (_) {
//       toast.error("Failed to add quote");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const handleDelete = async (id: string) => {
//     try {
//       await deleteQuote(id).unwrap();
//       toast.success("Quote deleted successfully");
//     } catch (_) {
//       toast.error("Failed to delete quote");
//     }
//   };

//   const handleEdit = (quote: Quote) => {
//     setNewQuote({ quote: quote.quote, author: quote.author });
//     setEditingId(quote.id.toString());
//     setIsDialogOpen(true);
//   };

//   const resetForm = () => {
//     setNewQuote({ quote: "", author: "" });
//     setEditingId(null);
//     setIsDialogOpen(false);
//   };

//   if (isLoading) return <PageLoader />;
//   if (isError) return <div className="text-red-500">Error loading quotes</div>;

//   return (
//     <div className="w-full mx-auto">
//       <div className="flex flex-col space-y-6">
//         <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//           <Title title="Quotes Management" />
//           <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
//             <DialogTrigger asChild>
//               <Button
//                 onClick={resetForm}
//                 className="bg-[var(--color-blueOne)] hover:bg-[var(--color-accent)] text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200 flex items-center cursor-pointer"
//               >
//                 <FiPlus className="h-4 w-4 mr-2" />
//                 Add Quote
//               </Button>
//             </DialogTrigger>
//             <DialogContent className="sm:max-w-[600px]">
//               <DialogHeader>
//                 <DialogTitle>
//                   {editingId ? "Edit Quote" : "Add New Quote"}
//                 </DialogTitle>
//               </DialogHeader>
//               <form onSubmit={handleSubmit} className="space-y-4 mt-4">
//                 <div className="space-y-2">
//                   <label htmlFor="quote" className="block text-sm font-medium">
//                     Quote
//                   </label>
//                   <Textarea
//                     id="quote"
//                     name="quote"
//                     rows={4}
//                     placeholder="Enter your inspirational quote..."
//                     value={newQuote.quote}
//                     onChange={handleInputChange}
//                     required
//                     className="min-h-[120px]"
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <label htmlFor="author" className="block text-sm font-medium">
//                     Author
//                   </label>
//                   <Input
//                     type="text"
//                     id="author"
//                     name="author"
//                     placeholder="Author name"
//                     value={newQuote.author}
//                     onChange={handleInputChange}
//                     required
//                   />
//                 </div>
//                 <div className="flex justify-end gap-2 pt-4">
//                   <Button
//                     className="border border-[var(--color-blueOne)] text-[var(--color-blueOne)] font-medium px-4 py-2 rounded-lg transition-colors duration-200 hover:bg-[var(--color-blueOne)/10] cursor-pointer"
//                     type="button"
//                     onClick={resetForm}
//                     disabled={isSubmitting}
//                     variant="outline"
//                   >
//                     Cancel
//                   </Button>
//                   <Button
//                     type="submit"
//                     disabled={isSubmitting}
//                     className="bg-[var(--color-blueOne)] hover:bg-[var(--color-accent)] cursor-pointer"
//                   >
//                     {isSubmitting
//                       ? editingId
//                         ? "Saving..."
//                         : "Adding..."
//                       : editingId
//                       ? "Save Changes"
//                       : "Add Quote"}
//                   </Button>
//                 </div>
//               </form>
//             </DialogContent>
//           </Dialog>
//         </div>

//         <div className="bg-background rounded-lg border shadow-sm">
//           <div className="p-6 border-b">
//             <div className="flex items-center justify-between">
//               <h2 className="text-xl">
//                 Quotes Collection{" "}
//                 <span className="text-muted-foreground font-normal">
//                   ({quotes.length})
//                 </span>
//               </h2>
//               <p className="text-sm text-muted-foreground">
//                 {quotes.length === 0
//                   ? "No quotes available"
//                   : `Total ${quotes.length} quotes`}
//               </p>
//             </div>
//           </div>

//           {quotes.length === 0 ? (
//             <div className="p-12 text-center">
//               <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
//                 <FiPlus className="h-5 w-5 text-muted-foreground" />
//               </div>
//               <h3 className="mt-4 text-sm font-medium">No quotes yet</h3>
//               <p className="mt-1 text-sm text-muted-foreground">
//                 Get started by adding your first quote.
//               </p>
//               <Button className="mt-6" onClick={() => setIsDialogOpen(true)}>
//                 <FiPlus className="h-4 w-4 mr-2" />
//                 Add Quote
//               </Button>
//             </div>
//           ) : (
//             <Table>
//               <TableHeader className="bg-gray-100 text-gray-700 uppercase text-sm tracking-wider">
//                 <TableRow>
//                   <TableHead className="w-[60%] px-4 py-3">Quote</TableHead>
//                   <TableHead className="px-4 py-3">Author</TableHead>
//                   <TableHead className="px-4 py-3 text-right">
//                     Actions
//                   </TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {quotes.map((quote) => (
//                   <TableRow key={quote.id} className="hover:bg-muted/50">
//                     <TableCell className="font-medium py-4 font-sans">
//                       <p>{quote.quote}</p>
//                     </TableCell>
//                     <TableCell className="text-muted-foreground">
//                       {quote.author}
//                     </TableCell>
//                     <TableCell className="text-right space-x-2">
//                       <Button
//                         className="cursor-pointer text-gray-700 border-gray-300 hover:text-white hover:bg-gray-700 transition-colors duration-200"
//                         variant="outline"
//                         size="sm"
//                         title="Edit"
//                         onClick={() => handleEdit(quote)}
//                       >
//                         <FiEdit className="h-4 w-4" />
//                       </Button>

//                       <Button
//                         variant="outline"
//                         size="sm"
//                         title="Delete"
//                         className="text-red-500 hover:bg-red-100 hover:text-white cursor-pointer"
//                         onClick={() => handleDelete(quote.id.toString())}
//                       >
//                         <FiTrash2 className="h-4 w-4 text-destructive" />
//                       </Button>
//                     </TableCell>
//                   </TableRow>
//                 ))}
//               </TableBody>
//             </Table>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Quotes;
