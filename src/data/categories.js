import { toast } from "@/components/ui/use-toast";

const BASE_URL = import.meta.env.VITE_BASE_URL || "localhost:5000";
const notifyUpdate = () => {
  window.dispatchEvent(new Event("categoriesUpdated"));
};

export const getCategories = async () => {
  try {
    const response = await fetch(`${BASE_URL}/categories`);
    if (!response.ok) throw new Error("Failed to fetch categories");
    return await response.json();
  } catch (error) {
    console.error("Failed to get categories from API", error);
    toast({
      title: "ত্রুটি",
      description: "ক্যাটাগরি লোড করতে ব্যর্থ হয়েছে।",
      variant: "destructive",
    });
    return [];
  }
};

export const addCategory = async (category) => {
  try {
    const response = await fetch(`${BASE_URL}/categories`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...category,
        color: category.color || "bg-gray-100",
      }),
    });
    if (!response.ok) throw new Error("Failed to add category");
    const newCategory = await response.json();
    notifyUpdate();
    return newCategory;
  } catch (error) {
    console.error("Failed to add category to API", error);
    toast({
      title: "ত্রুটি",
      description: "নতুন ক্যাটাগরি যোগ করতে ব্যর্থ হয়েছে।",
      variant: "destructive",
    });
  }
};

export const updateCategory = async (updatedCategory) => {
  try {
    const response = await fetch(
      `${BASE_URL}/categories/${updatedCategory._id}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedCategory),
      }
    );
    if (!response.ok) throw new Error("Failed to update category");
    const result = await response.json();
    notifyUpdate();
    return result;
  } catch (error) {
    console.error("Failed to update category in API", error);
    toast({
      title: "ত্রুটি",
      description: "ক্যাটাগরি আপডেট করতে ব্যর্থ হয়েছে।",
      variant: "destructive",
    });
  }
};

export const deleteCategory = async (categoryId) => {
  try {
    const response = await fetch(`${BASE_URL}/categories/${categoryId}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete category");
    notifyUpdate();
    return await response.json();
  } catch (error) {
    console.error("Failed to delete category from API", error);
    toast({
      title: "ত্রুটি",
      description: "ক্যাটাগরি মুছে ফেলতে ব্যর্থ হয়েছে।",
      variant: "destructive",
    });
  }
};
