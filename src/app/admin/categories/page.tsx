
"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, addDoc, deleteDoc, doc, query, orderBy, where, writeBatch, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Trash2, PlusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { categories as staticCategories } from "@/lib/data";


interface Category {
  id: string;
  name: string;
}

export default function AdminCategoriesPage() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [loadingData, setLoadingData] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isDeleting, setIsDeleting] = useState<Record<string, boolean>>({});
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingData(true);
      try {
        const categoriesCollection = collection(db, "categories");
        const initialQuery = query(categoriesCollection, orderBy("name"));
        let querySnapshot = await getDocs(initialQuery);

        // If no categories, seed them from static data
        if (querySnapshot.empty) {
          const batch = writeBatch(db);
          staticCategories.forEach(categoryName => {
            // Don't add 'Other' as a permanent category
            if (categoryName !== 'Other') {
              const docRef = doc(categoriesCollection);
              batch.set(docRef, { name: categoryName });
            }
          });
          await batch.commit();
          
          // Re-fetch after seeding
          querySnapshot = await getDocs(initialQuery);
          
          toast({
            title: "Categories Seeded",
            description: "Your initial category list has been set up.",
          });
        }
        
        const categoriesData = querySnapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as Category)
        );
        setCategories(categoriesData);
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch categories.",
        });
      } finally {
        setLoadingData(false);
      }
    };

    fetchCategories();
  }, [toast]);

  const handleAddCategory = async () => {
    if (!newCategory.trim()) {
      toast({
        variant: "destructive",
        description: "Category name cannot be empty.",
      });
      return;
    }
    setIsAdding(true);

    // Check if category already exists (case-insensitive)
    const normalizedNewCategory = newCategory.trim().toLowerCase();
    const exists = categories.some(cat => cat.name.toLowerCase() === normalizedNewCategory);
    if (exists) {
        toast({
            variant: "destructive",
            description: `Category "${newCategory.trim()}" already exists.`,
        });
        setIsAdding(false);
        return;
    }

    try {
      const docRef = await addDoc(collection(db, "categories"), {
        name: newCategory.trim(),
      });
      toast({
        title: "Success!",
        description: "New category has been added.",
      });
      setCategories(prev => [...prev, { id: docRef.id, name: newCategory.trim() }].sort((a, b) => a.name.localeCompare(b.name)));
      setNewCategory("");
    } catch (error) {
      console.error("Error adding category:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not add the category. Please try again.",
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;
    const { id, name } = categoryToDelete;
    setIsDeleting(prev => ({ ...prev, [id]: true }));
    try {
      // Check if any business is using this category
      const listingsQuery = query(collection(db, "listings"), where("category", "==", name), limit(1));
      const listingsSnapshot = await getDocs(listingsQuery);

      if (!listingsSnapshot.empty) {
        toast({
          variant: "destructive",
          title: "Cannot Delete",
          description: `Category "${name}" is being used by one or more businesses.`,
        });
        setCategoryToDelete(null);
        setIsDeleting(prev => ({ ...prev, [id]: false }));
        return;
      }


      await deleteDoc(doc(db, "categories", id));
      toast({
        title: "Success!",
        description: `The category "${name}" has been deleted.`,
      });
      setCategories(prev => prev.filter(cat => cat.id !== id));
      setCategoryToDelete(null);
    } catch (error) {
      console.error("Error deleting category:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not delete the category. Please try again.",
      });
    } finally {
      setIsDeleting(prev => ({ ...prev, [id]: false }));
    }
  };

  return (
    <>
      <div className="flex-1 space-y-8">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Categories</h2>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Manage Categories</CardTitle>
            <CardDescription>Add or delete business categories.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              <Input
                placeholder="Enter new category name"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                disabled={isAdding}
              />
              <Button onClick={handleAddCategory} disabled={isAdding}>
                {isAdding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                Add
              </Button>
            </div>
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category Name</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingData ? (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center">
                        <div className="flex justify-center py-16">
                          <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : categories.length > 0 ? (
                    categories.map((category) => (
                      <TableRow key={category.id}>
                        <TableCell className="font-medium">{category.name}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setCategoryToDelete(category)}
                            disabled={isDeleting[category.id] || category.name === 'Other'}
                          >
                            {isDeleting[category.id] ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center py-16 text-muted-foreground">
                        No categories found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
      {categoryToDelete && (
        <AlertDialog open={!!categoryToDelete} onOpenChange={(open) => !open && setCategoryToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the category "{categoryToDelete.name}". This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteCategory}
                className="bg-destructive hover:bg-destructive/90"
                disabled={isDeleting[categoryToDelete.id]}
              >
                {isDeleting[categoryToDelete.id] && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
