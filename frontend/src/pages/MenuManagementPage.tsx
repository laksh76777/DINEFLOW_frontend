import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UtensilsCrossed,
  Plus,
  Search,
  Filter,
  Sparkles,
  Flame,
  ChefHat,
  Clock,
  Edit2,
  Trash2,
  Upload,
  Image as ImageIcon,
  Check,
  X,
  AlertTriangle,
  FolderPlus,
  SlidersHorizontal,
} from 'lucide-react';
import {
  Button,
  Card,
  CardBody,
  Badge,
  Input,
  Select,
  Modal,
  Skeleton,
  PageHeader,
  EmptyState,
} from '../components/ui';
import { menuService, MenuItem, Category, FoodType } from '../services/menuService';
import { uploadService } from '../services/uploadService';
import { aiService } from '../services/aiService';
import { useAuthStore } from '../stores/useAuthStore';
import { toast } from '../stores/useToastStore';

export const MenuManagementPage: React.FC = () => {
  const { user } = useAuthStore();
  const isOwnerOrManager = user?.role === 'OWNER' || user?.role === 'MANAGER';

  // Data states
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFoodType, setSelectedFoodType] = useState<string>('ALL');
  const [selectedStation, setSelectedStation] = useState<string>('ALL');

  // Modals state
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  // Form states for item
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formPrice, setFormPrice] = useState<number>(250);
  const [formCategoryId, setFormCategoryId] = useState('');
  const [formImage, setFormImage] = useState('');
  const [formFoodType, setFormFoodType] = useState<FoodType>('VEG');
  const [formSpiceLevel, setFormSpiceLevel] = useState<number>(1);
  const [formAllergens, setFormAllergens] = useState('');
  const [formIngredients, setFormIngredients] = useState('');
  const [formCookingMethod, setFormCookingMethod] = useState('Wood-fired');
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [aiDraftDescription, setAiDraftDescription] = useState<string | null>(null);
  const [formPrepTime, setFormPrepTime] = useState<number>(15);
  const [formStation, setFormStation] = useState('Main Kitchen');
  const [formFeatured, setFormFeatured] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSavingItem, setIsSavingItem] = useState(false);

  // Form state for category
  const [catName, setCatName] = useState('');
  const [catDescription, setCatDescription] = useState('');
  const [catSortOrder, setCatSortOrder] = useState<number>(0);
  const [isSavingCategory, setIsSavingCategory] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load categories and items
  const loadMenuData = async () => {
    setIsLoading(true);
    try {
      const [cats, items] = await Promise.all([
        menuService.getCategories(),
        menuService.getMenuItems(),
      ]);
      setCategories(cats);
      setMenuItems(items);
      if (cats.length > 0 && !formCategoryId) {
        setFormCategoryId(cats[0]._id);
      }
    } catch (err: any) {
      toast.error('Failed to load menu data', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMenuData();
  }, []);

  // Open modal to add or edit item
  const openItemModal = (item?: MenuItem) => {
    if (item) {
      setEditingItem(item);
      setFormName(item.name);
      setFormDescription(item.description);
      setFormPrice(item.price);
      setFormCategoryId(
        typeof item.categoryId === 'string' ? item.categoryId : item.categoryId._id
      );
      setFormImage(item.image);
      setFormFoodType(item.foodType);
      setFormSpiceLevel(item.spiceLevel);
      setFormAllergens(item.allergens?.join(', ') || '');
      setFormIngredients(item.ingredients?.join(', ') || '');
      setFormPrepTime(item.preparationTime);
      setFormStation(item.kitchenStationId);
      setFormFeatured(item.featured);
    } else {
      setEditingItem(null);
      setFormName('');
      setFormDescription('');
      setFormPrice(350);
      setFormCategoryId(categories[0]?._id || '');
      setFormImage(
        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'
      );
      setFormFoodType('VEG');
      setFormSpiceLevel(1);
      setFormAllergens('');
      setFormIngredients('');
      setFormCookingMethod('Wood-fired');
      setFormPrepTime(15);
      setFormStation('Main Kitchen');
      setFormFeatured(false);
    }
    setAiDraftDescription(null);
    setIsItemModalOpen(true);
  };

  // Generate Menu Description with AI (Phase 15)
  const handleGenerateAiDescription = async () => {
    if (!formName.trim()) {
      toast.error('Dish Name Required', 'Please enter a dish name first before generating draft with AI.');
      return;
    }
    setIsGeneratingDescription(true);
    try {
      const res = await aiService.generateMenuDescription({
        foodName: formName.trim(),
        ingredients: formIngredients.trim() || 'Fresh aromatic herbs, spices, and seasonal reduction',
        cookingMethod: formCookingMethod || 'Wood-fired',
        category: categories.find((c) => c._id === formCategoryId)?.name,
        foodType: formFoodType,
        spiceLevel: formSpiceLevel,
      });
      setAiDraftDescription(res.draftDescription);
      toast.success('AI Draft Generated', 'Review the sensory description below before applying');
    } catch (err: any) {
      toast.error('AI Drafting Failed', err.message);
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  // Upload food image via Cloudinary
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const res = await uploadService.uploadImage(file, 'menu');
      setFormImage(res.url);
      toast.success('Food Image Uploaded', 'Cloudinary image synced successfully');
    } catch (err: any) {
      toast.error('Image Upload Failed', err.message);
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Save Item (Create or Update)
  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formCategoryId) {
      toast.error('Validation Error', 'Name and Category are required');
      return;
    }

    setIsSavingItem(true);
    try {
      const payload: Partial<MenuItem> = {
        name: formName.trim(),
        description: formDescription.trim(),
        price: Number(formPrice),
        categoryId: formCategoryId,
        image: formImage,
        foodType: formFoodType,
        spiceLevel: Number(formSpiceLevel),
        allergens: formAllergens
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        ingredients: formIngredients
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        preparationTime: Number(formPrepTime),
        kitchenStationId: formStation,
        featured: formFeatured,
      };

      if (editingItem) {
        const updated = await menuService.updateMenuItem(editingItem._id, payload);
        setMenuItems((prev) => prev.map((item) => (item._id === updated._id ? updated : item)));
        toast.success('Dish Updated', `${updated.name} has been updated.`);
      } else {
        const created = await menuService.createMenuItem(payload);
        setMenuItems((prev) => [created, ...prev]);
        toast.success('Dish Created', `${created.name} added to the menu.`);
      }
      setIsItemModalOpen(false);
    } catch (err: any) {
      toast.error('Failed to save dish', err.message);
    } finally {
      setIsSavingItem(false);
    }
  };

  // Toggle Availability (86 Item)
  const handleToggleAvailability = async (item: MenuItem) => {
    const newStatus = !item.available;
    // Optimistic update
    setMenuItems((prev) =>
      prev.map((i) => (i._id === item._id ? { ...i, available: newStatus } : i))
    );

    try {
      await menuService.toggleAvailability(item._id, newStatus);
      toast.info(
        item.name,
        newStatus ? 'Marked as Available' : "86'd (Marked as Sold Out for guests)"
      );
    } catch (err: any) {
      // Revert on error
      setMenuItems((prev) =>
        prev.map((i) => (i._id === item._id ? { ...i, available: !newStatus } : i))
      );
      toast.error('Failed to update availability', err.message);
    }
  };

  // Delete item
  const handleDeleteItem = async (item: MenuItem) => {
    if (!confirm(`Are you sure you want to remove "${item.name}" from the menu?`)) return;
    try {
      await menuService.deleteMenuItem(item._id);
      setMenuItems((prev) => prev.filter((i) => i._id !== item._id));
      toast.success('Dish Removed', `${item.name} has been deleted.`);
    } catch (err: any) {
      toast.error('Deletion Failed', err.message);
    }
  };

  // Create Category
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName) return;

    setIsSavingCategory(true);
    try {
      const created = await menuService.createCategory({
        name: catName.trim(),
        description: catDescription.trim(),
        sortOrder: Number(catSortOrder),
        active: true,
      });
      setCategories((prev) => [...prev, created]);
      toast.success('Category Created', `${created.name} added.`);
      setIsCategoryModalOpen(false);
      setCatName('');
      setCatDescription('');
    } catch (err: any) {
      toast.error('Failed to create category', err.message);
    } finally {
      setIsSavingCategory(false);
    }
  };

  // Filter items
  const filteredItems = menuItems.filter((item) => {
    // Category filter
    if (selectedCategory !== 'ALL') {
      const itemCatId =
        typeof item.categoryId === 'string' ? item.categoryId : item.categoryId?._id;
      if (itemCatId !== selectedCategory) return false;
    }
    // Food type filter
    if (selectedFoodType !== 'ALL' && item.foodType !== selectedFoodType) return false;
    // Station filter
    if (selectedStation !== 'ALL' && item.kitchenStationId !== selectedStation) return false;
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = item.name.toLowerCase().includes(q);
      const matchDesc = item.description?.toLowerCase().includes(q);
      const matchIngredient = item.ingredients?.some((ing) => ing.toLowerCase().includes(q));
      if (!matchName && !matchDesc && !matchIngredient) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-16 max-w-7xl mx-auto">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleImageFileChange}
      />

      {/* Header */}
      <PageHeader
        badge={
          <Badge variant="brand" size="sm" dot>
            Phase 4 • Menu Management
          </Badge>
        }
        title="Artisanal Culinary Menu"
        description="Craft, price, organize, and toggle availability for dishes and categories."
        actions={
          <div className="flex items-center gap-2">
            {isOwnerOrManager && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<FolderPlus className="w-4 h-4 text-amber-400" />}
                  onClick={() => setIsCategoryModalOpen(true)}
                >
                  New Category
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Plus className="w-4 h-4" />}
                  onClick={() => openItemModal()}
                >
                  Add Dish
                </Button>
              </>
            )}
          </div>
        }
      />

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-stone-800 scrollbar-none">
        <button
          onClick={() => setSelectedCategory('ALL')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            selectedCategory === 'ALL'
              ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-md shadow-orange-950/40'
              : 'bg-stone-900/80 text-stone-400 hover:text-white border border-stone-800'
          }`}
        >
          <span>All Categories</span>
          <span
            className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono ${
              selectedCategory === 'ALL' ? 'bg-black/20 text-white' : 'bg-stone-800 text-stone-300'
            }`}
          >
            {menuItems.length}
          </span>
        </button>

        {categories.map((cat) => {
          const count = menuItems.filter(
            (i) => (typeof i.categoryId === 'string' ? i.categoryId : i.categoryId?._id) === cat._id
          ).length;
          return (
            <button
              key={cat._id}
              onClick={() => setSelectedCategory(cat._id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                selectedCategory === cat._id
                  ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-md shadow-orange-950/40'
                  : 'bg-stone-900/80 text-stone-400 hover:text-white border border-stone-800'
              }`}
            >
              <span>{cat.name}</span>
              <span
                className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono ${
                  selectedCategory === cat._id ? 'bg-black/20 text-white' : 'bg-stone-800 text-stone-300'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-stone-900/60 border border-stone-800">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search dishes, spices, ingredients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Food Type Dietary Filter */}
          <Select
            value={selectedFoodType}
            onChange={(e) => setSelectedFoodType(e.target.value)}
            className="text-xs py-2"
          >
            <option value="ALL">All Dietary Types</option>
            <option value="VEG">🌱 Vegetarian</option>
            <option value="NON_VEG">🍗 Non-Vegetarian</option>
            <option value="VEGAN">🌿 Pure Vegan</option>
            <option value="EGG">🍳 Contains Egg</option>
          </Select>

          {/* Station Filter */}
          <Select
            value={selectedStation}
            onChange={(e) => setSelectedStation(e.target.value)}
            className="text-xs py-2"
          >
            <option value="ALL">All Stations</option>
            <option value="Main Kitchen">Main Kitchen</option>
            <option value="Grill">Grill & Tandoor</option>
            <option value="Beverage">Beverage Bar</option>
            <option value="Dessert">Dessert & Pastry</option>
          </Select>
        </div>
      </div>

      {/* Food Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <Card key={n} variant="default" className="h-72">
              <Skeleton className="h-44 w-full" />
              <CardBody className="p-4 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </CardBody>
            </Card>
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <EmptyState
          title="No Dishes Match Your Filters"
          description="Try clearing your search query or switching category tabs."
          action={
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSelectedCategory('ALL');
                setSearchQuery('');
                setSelectedFoodType('ALL');
                setSelectedStation('ALL');
              }}
            >
              Reset Filters
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <motion.div
              key={item._id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <Card
                variant="default"
                isHoverable
                className={`group flex flex-col justify-between h-full relative transition-all border ${
                  item.available ? 'border-stone-800' : 'border-rose-950/60 bg-stone-950/60'
                }`}
              >
                <div>
                  {/* Food Image with Zoom on Hover */}
                  <div className="relative h-48 w-full overflow-hidden bg-stone-950">
                    <img
                      src={item.image}
                      alt={item.name}
                      className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${
                        !item.available ? 'filter grayscale contrast-125 opacity-40' : ''
                      }`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/20 to-transparent" />

                    {/* Top Left: Dietary Badge */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <Badge
                        variant={
                          item.foodType === 'VEG'
                            ? 'veg'
                            : item.foodType === 'NON_VEG'
                            ? 'non-veg'
                            : 'vegan'
                        }
                        size="sm"
                        dot
                      >
                        {item.foodType}
                      </Badge>

                      {item.featured && (
                        <Badge variant="brand" size="sm" className="bg-orange-500 text-white">
                          ★ Chef's Special
                        </Badge>
                      )}
                    </div>

                    {/* Top Right: Station Badge */}
                    <div className="absolute top-3 right-3">
                      <Badge variant="station" size="sm">
                        {item.kitchenStationId}
                      </Badge>
                    </div>

                    {/* Sold out overlay banner */}
                    {!item.available && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-xs">
                        <span className="px-3 py-1 rounded-full bg-rose-600 text-white text-xs font-black tracking-widest uppercase shadow-lg shadow-rose-950">
                          86'd • Sold Out
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <CardBody className="p-4 space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-base font-bold text-white group-hover:text-orange-400 transition-colors line-clamp-1 font-serif">
                        {item.name}
                      </h3>
                      <div className="text-base font-black text-amber-400 font-mono shrink-0">
                        ₹{item.price}
                      </div>
                    </div>

                    <p className="text-xs text-stone-400 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>

                    {/* Nutritional / Flavor Specs */}
                    <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-stone-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-stone-500" />
                        {item.preparationTime} mins
                      </span>

                      {item.spiceLevel > 0 && (
                        <span className="flex items-center gap-0.5 text-rose-400 font-semibold">
                          <Flame className="w-3 h-3" />
                          <span>Level {item.spiceLevel}</span>
                        </span>
                      )}

                      {item.allergens?.length > 0 && (
                        <span className="text-stone-500 truncate max-w-[130px]">
                          Contains: {item.allergens.join(', ')}
                        </span>
                      )}
                    </div>
                  </CardBody>
                </div>

                {/* Footer Controls: Availability Toggle & Edit/Delete */}
                <div className="p-3 bg-stone-950/60 border-t border-stone-800/80 flex items-center justify-between">
                  {/* Availability Toggle Switch */}
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={item.available}
                        onChange={() => handleToggleAvailability(item)}
                        className="sr-only"
                      />
                      <div
                        className={`w-9 h-5 rounded-full transition-colors ${
                          item.available ? 'bg-emerald-500' : 'bg-stone-700'
                        }`}
                      />
                      <div
                        className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                          item.available ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </div>
                    <span
                      className={`text-xs font-semibold ${
                        item.available ? 'text-emerald-400' : 'text-stone-500'
                      }`}
                    >
                      {item.available ? 'Available' : 'Unavailable'}
                    </span>
                  </label>

                  {/* Edit & Delete actions (Owner & Manager) */}
                  {isOwnerOrManager && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openItemModal(item)}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
                        title="Edit Dish Details"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item)}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                        title="Delete Dish"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add / Edit Dish Modal */}
      <Modal
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        size="lg"
        title={editingItem ? `Edit "${editingItem.name}"` : 'Add New Culinary Dish'}
        description="Configure dish presentation, ingredients, kitchen station routing, and pricing."
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setIsItemModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSaveItem}
              isLoading={isSavingItem}
            >
              {editingItem ? 'Save Changes' : 'Publish Dish to Menu'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveItem} className="space-y-4">
          {/* Image Upload Area */}
          <div>
            <label className="text-xs font-semibold text-stone-300 mb-1.5 block">
              Dish Photography (Cloudinary)
            </label>
            <div className="flex items-center gap-4">
              <div className="relative w-24 h-24 rounded-2xl overflow-hidden border border-stone-800 bg-stone-950 shrink-0">
                <img src={formImage} alt="Dish Preview" className="w-full h-full object-cover" />
                {isUploadingImage && (
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                    <span className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
              <div className="space-y-2 flex-1">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  leftIcon={<Upload className="w-3.5 h-3.5 text-orange-400" />}
                  onClick={() => fileInputRef.current?.click()}
                  isLoading={isUploadingImage}
                >
                  Upload New Photo
                </Button>
                <Input
                  placeholder="Or paste direct image URL"
                  value={formImage}
                  onChange={(e) => setFormImage(e.target.value)}
                  className="text-xs py-1.5"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Dish Name"
              placeholder="e.g. Tandoori Bhatti Murgh"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              required
            />

            <div>
              <label className="text-xs font-semibold text-stone-300 mb-1.5 block">
                Price (₹ INR) {!isOwnerOrManager && '(Locked for Staff)'}
              </label>
              <Input
                type="number"
                min="0"
                step="5"
                placeholder="350"
                value={formPrice}
                onChange={(e) => setFormPrice(Number(e.target.value))}
                disabled={!isOwnerOrManager}
                required
              />
            </div>
          </div>

          {/* AI-Assisted Culinary Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Input
                label="Cooking Method / Technique"
                placeholder="e.g. Wood-fired, Slow-braised, Pan-seared"
                value={formCookingMethod}
                onChange={(e) => setFormCookingMethod(e.target.value)}
              />
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {['Wood-fired', 'Slow-braised', 'Charcoal-grilled', 'Pan-seared', 'Sous-vide', 'Tandoor-roasted'].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setFormCookingMethod(m)}
                    className={`text-[10px] px-2 py-0.5 rounded-md border transition-all ${
                      formCookingMethod === m
                        ? 'bg-orange-500/20 border-orange-500 text-orange-300'
                        : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <Input
              label="Key Ingredients (comma separated)"
              placeholder="e.g. Kashmiri Morels, Saffron Cream, Pistachio"
              value={formIngredients}
              onChange={(e) => setFormIngredients(e.target.value)}
            />
          </div>

          {/* Dish Description with Gemini AI Assistant */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-stone-300 block">
                Dish Description
              </label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="border-orange-500/40 text-orange-400 hover:bg-orange-500/10 text-xs py-1 px-2.5 h-auto"
                onClick={handleGenerateAiDescription}
                isLoading={isGeneratingDescription}
                leftIcon={<Sparkles className="w-3 h-3 text-orange-400" />}
              >
                Draft with AI
              </Button>
            </div>

            {/* AI Draft Review Card */}
            {aiDraftDescription && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-xl bg-orange-950/40 border border-orange-500/50 space-y-2 shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-orange-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                    AI Draft (Review before applying)
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      size="sm"
                      variant="primary"
                      className="text-xs py-1 px-2.5 h-auto"
                      onClick={() => {
                        setFormDescription(aiDraftDescription);
                        setAiDraftDescription(null);
                        toast.success('Draft Applied', 'You can review and edit before saving dish.');
                      }}
                      leftIcon={<Check className="w-3 h-3" />}
                    >
                      Apply to Description
                    </Button>
                    <button
                      type="button"
                      onClick={() => setAiDraftDescription(null)}
                      className="p-1 text-stone-400 hover:text-stone-200"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-stone-200 italic leading-relaxed bg-black/30 p-2 rounded-lg border border-stone-800">
                  "{aiDraftDescription}"
                </p>
              </motion.div>
            )}

            <textarea
              rows={2}
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="Sensory description of taste, texture, and culinary craft..."
              className="w-full bg-stone-900 border border-stone-800 text-stone-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-500/60 focus:ring-2 focus:ring-orange-500/20"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              label="Category"
              value={formCategoryId}
              onChange={(e) => setFormCategoryId(e.target.value)}
            >
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </Select>

            <Select
              label="Dietary Food Type"
              value={formFoodType}
              onChange={(e) => setFormFoodType(e.target.value as FoodType)}
            >
              <option value="VEG">🌱 Vegetarian</option>
              <option value="NON_VEG">🍗 Non-Vegetarian</option>
              <option value="VEGAN">🌿 Pure Vegan</option>
              <option value="EGG">🍳 Contains Egg</option>
            </Select>

            <Select
              label="Kitchen Station"
              value={formStation}
              onChange={(e) => setFormStation(e.target.value)}
            >
              <option value="Main Kitchen">Main Kitchen</option>
              <option value="Grill">Grill & Tandoor</option>
              <option value="Beverage">Beverage Bar</option>
              <option value="Dessert">Dessert & Pastry</option>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Spice Level"
              value={formSpiceLevel}
              onChange={(e) => setFormSpiceLevel(Number(e.target.value))}
            >
              <option value={0}>Level 0: Mild / Non-Spicy</option>
              <option value={1}>Level 1: Gentle Warmth</option>
              <option value={2}>Level 2: Medium Kashmiri Spice</option>
              <option value={3}>Level 3: Extra Hot (Guntur Chili)</option>
            </Select>

            <Input
              label="Preparation Time (minutes)"
              type="number"
              min="1"
              value={formPrepTime}
              onChange={(e) => setFormPrepTime(Number(e.target.value))}
            />
          </div>

          <div>
            <Input
              label="Allergen Warnings (comma separated)"
              placeholder="e.g. Dairy, Peanuts, Gluten"
              value={formAllergens}
              onChange={(e) => setFormAllergens(e.target.value)}
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer pt-2">
            <input
              type="checkbox"
              checked={formFeatured}
              onChange={(e) => setFormFeatured(e.target.checked)}
              className="w-4 h-4 rounded text-orange-500 focus:ring-orange-500/30 bg-stone-900 border-stone-800"
            />
            <span className="text-xs font-semibold text-white">
              Mark as Chef's Special / Featured Dish (Displayed prominently)
            </span>
          </label>
        </form>
      </Modal>

      {/* Add Category Modal */}
      <Modal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        title="Create New Menu Category"
        description="Organize your dining catalog with distinct culinary groupings."
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setIsCategoryModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleCreateCategory}
              isLoading={isSavingCategory}
            >
              Save Category
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateCategory} className="space-y-4">
          <Input
            label="Category Name"
            placeholder="e.g. Handcrafted Cocktails"
            value={catName}
            onChange={(e) => setCatName(e.target.value)}
            required
          />

          <Input
            label="Short Description"
            placeholder="e.g. Artisanal tonics and botanical infusions"
            value={catDescription}
            onChange={(e) => setCatDescription(e.target.value)}
          />

          <Input
            label="Display Sort Order"
            type="number"
            value={catSortOrder}
            onChange={(e) => setCatSortOrder(Number(e.target.value))}
            helperText="Lower numbers appear first in the customer menu"
          />
        </form>
      </Modal>
    </div>
  );
};
