import React, { useState, useEffect, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table';
import type {
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
} from '@tanstack/react-table';
import {
  Table as TableIcon,
  Loader2,
  Search,
  X,
  ChevronDown,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Minus,
  Plus,
  ShoppingCart,
} from 'lucide-react';
import type { Product } from '@/types/product';
import type { Category } from '@/types/category';
import { apiService } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Sidebar } from '@/components/Sidebar';
import { useCart } from '@/contexts/CartContext';
import CartDrawer from '@/components/cart/CartDrawer';

// Extended Product type with category name
interface ProductWithCategory extends Product {
  categoryName: string;
}

// Always-visible stock control component
interface StockControlProps {
  product: ProductWithCategory;
  onSave: (product: ProductWithCategory) => Promise<void>;
}

const StockControl: React.FC<StockControlProps> = ({ product, onSave }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastChange, setLastChange] = useState<number | null>(null);

  const handleAdjust = async (delta: number) => {
    const newCount = Math.max(0, product.count + delta);
    if (newCount === product.count) return;

    setIsSaving(true);
    setLastChange(delta);
    try {
      await onSave({ ...product, count: newCount });
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setLastChange(null);
      }, 1500);
    } catch (err) {
      console.error('Failed to save count:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Determine stock status for visual indicator
  const getStockStatus = () => {
    if (product.count === 0) return 'out';
    if (product.count <= 10) return 'low';
    if (product.count <= 25) return 'medium';
    return 'good';
  };

  const stockStatus = getStockStatus();
  const statusColors = {
    out: 'bg-red-500/20 border-red-500/50 text-red-400',
    low: 'bg-amber-500/20 border-amber-500/50 text-amber-400',
    medium: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400',
    good: 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400',
  };

  return (
    <div className="flex items-center gap-2">
      {/* Quick decrement buttons */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => handleAdjust(-10)}
          disabled={isSaving || product.count === 0}
          className="group relative flex items-center justify-center w-8 h-8 rounded-lg bg-gray-800 hover:bg-red-500/20 border border-gray-700 hover:border-red-500/50 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
          title="Remove 10"
        >
          <span className="text-xs font-medium text-gray-400 group-hover:text-red-400">-10</span>
        </button>
        <button
          onClick={() => handleAdjust(-5)}
          disabled={isSaving || product.count === 0}
          className="group relative flex items-center justify-center w-7 h-8 rounded-lg bg-gray-800 hover:bg-red-500/20 border border-gray-700 hover:border-red-500/50 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
          title="Remove 5"
        >
          <span className="text-xs font-medium text-gray-400 group-hover:text-red-400">-5</span>
        </button>
        <button
          onClick={() => handleAdjust(-1)}
          disabled={isSaving || product.count === 0}
          className="group flex items-center justify-center w-7 h-8 rounded-lg bg-gray-800 hover:bg-red-500/30 border border-gray-700 hover:border-red-500/50 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
          title="Remove 1"
        >
          <Minus className="w-3.5 h-3.5 text-gray-400 group-hover:text-red-400" />
        </button>
      </div>

      {/* Count display with status indicator */}
      <div
        className={`relative flex items-center justify-center min-w-[4.5rem] h-10 px-3 rounded-xl border-2 font-semibold text-lg transition-all duration-300 ${
          showSuccess
            ? 'bg-emerald-500/30 border-emerald-400 text-emerald-300 scale-105'
            : statusColors[stockStatus]
        }`}
      >
        {isSaving ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            <span>{product.count}</span>
            {/* Change indicator */}
            {showSuccess && lastChange !== null && (
              <span
                className={`absolute -top-2 -right-2 flex items-center justify-center min-w-[1.25rem] h-5 px-1 rounded-full text-xs font-bold ${
                  lastChange > 0
                    ? 'bg-emerald-500 text-white'
                    : 'bg-red-500 text-white'
                }`}
              >
                {lastChange > 0 ? `+${lastChange}` : lastChange}
              </span>
            )}
          </>
        )}
      </div>

      {/* Quick increment buttons */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => handleAdjust(1)}
          disabled={isSaving}
          className="group flex items-center justify-center w-7 h-8 rounded-lg bg-gray-800 hover:bg-emerald-500/30 border border-gray-700 hover:border-emerald-500/50 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
          title="Add 1"
        >
          <Plus className="w-3.5 h-3.5 text-gray-400 group-hover:text-emerald-400" />
        </button>
        <button
          onClick={() => handleAdjust(5)}
          disabled={isSaving}
          className="group relative flex items-center justify-center w-7 h-8 rounded-lg bg-gray-800 hover:bg-emerald-500/20 border border-gray-700 hover:border-emerald-500/50 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
          title="Add 5"
        >
          <span className="text-xs font-medium text-gray-400 group-hover:text-emerald-400">+5</span>
        </button>
        <button
          onClick={() => handleAdjust(10)}
          disabled={isSaving}
          className="group relative flex items-center justify-center w-8 h-8 rounded-lg bg-gray-800 hover:bg-emerald-500/20 border border-gray-700 hover:border-emerald-500/50 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
          title="Add 10"
        >
          <span className="text-xs font-medium text-gray-400 group-hover:text-emerald-400">+10</span>
        </button>
      </div>
    </div>
  );
};

const TableView: React.FC = () => {
  // State management
  const [products, setProducts] = useState<ProductWithCategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [addedProducts, setAddedProducts] = useState<Set<number>>(new Set());
  const { addItem, totalItems } = useCart();

  // Table state
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [countSortMode, setCountSortMode] = useState<'default' | 'asc' | 'desc'>('default');

  // Column visibility (persist to localStorage)
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(() => {
    const saved = localStorage.getItem('tableview-columns');
    return saved ? JSON.parse(saved) : {
      image: true,
      title: true,
      category: true,
      price: true,
      count: true,
    };
  });

  // Debounced search
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setGlobalFilter(searchInput);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Save column visibility to localStorage
  useEffect(() => {
    localStorage.setItem('tableview-columns', JSON.stringify(columnVisibility));
  }, [columnVisibility]);

  // Fetch data on mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const [productsData, categoriesData] = await Promise.all([
        apiService.products.getAll(),
        apiService.categories.getAll(),
      ]);

      // Map category names to products
      const productsWithCategories: ProductWithCategory[] = productsData.map((product) => {
        const category = categoriesData.find((cat) => cat.id === product.categoryId);
        return {
          ...product,
          categoryName: category?.title || 'Unknown',
        };
      });

      setProducts(productsWithCategories);
      setCategories(categoriesData);
    } catch (err) {
      setError('Failed to load data. Please try again.');
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveCount = async (product: ProductWithCategory) => {
    try {
      // Backend requires full product object for validation
      const productToUpdate: Product = {
        id: product.id,
        categoryId: product.categoryId,
        title: product.title,
        image: product.image,
        price: product.price,
        count: product.count,
      };
      await apiService.products.update(product.id!, productToUpdate);
      // Update local state
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, count: product.count } : p))
      );
    } catch (err) {
      throw new Error('Failed to update count');
    }
  };

  // Define columns
  const columns = useMemo<ColumnDef<ProductWithCategory>[]>(
    () => [
      {
        accessorKey: 'image',
        header: 'Image',
        cell: ({ row }) => (
          <img
            src={row.original.image}
            alt={row.original.title}
            className="w-12 h-12 object-cover rounded-lg"
          />
        ),
        enableSorting: false,
      },
      {
        accessorKey: 'title',
        header: 'Product Title',
        cell: ({ row }) => (
          <div className="font-medium text-white">{row.original.title}</div>
        ),
      },
      {
        accessorKey: 'categoryName',
        header: 'Category',
        cell: ({ row }) => (
          <div className="text-gray-300">{row.original.categoryName}</div>
        ),
      },
      {
        accessorKey: 'price',
        header: 'Price',
        cell: ({ row }) => (
          <div className="text-gray-300">
            ${row.original.price.toFixed(2)}
          </div>
        ),
      },
      {
        accessorKey: 'count',
        header: ({ column }) => {
          const getNextMode = () => {
            if (countSortMode === 'default') return 'asc';
            if (countSortMode === 'asc') return 'desc';
            return 'default';
          };

          const nextMode = getNextMode();

          return (
            <Button
              variant="ghost"
              onClick={() => {
                setCountSortMode(nextMode);
                if (nextMode === 'default') {
                  column.clearSorting();
                } else {
                  column.toggleSorting(nextMode === 'desc');
                }
              }}
              className="hover:bg-white/10"
            >
              Stock Control
              {countSortMode === 'default' && <ArrowUpDown className="ml-2 h-4 w-4" />}
              {countSortMode === 'asc' && <ArrowUp className="ml-2 h-4 w-4" />}
              {countSortMode === 'desc' && <ArrowDown className="ml-2 h-4 w-4" />}
            </Button>
          );
        },
        cell: ({ row }) => (
          <StockControl product={row.original} onSave={handleSaveCount} />
        ),
        size: 320, // Make column wider to fit controls
      },
      {
        id: 'addToCart',
        header: 'Add to Cart',
        cell: ({ row }) => {
          const [quantity, setQuantity] = useState(1);
          const product = row.original;
          const isAdded = addedProducts.has(product.id!);

          const handleAddToCart = () => {
            const productData: Product = {
              id: product.id,
              categoryId: product.categoryId,
              title: product.title,
              image: product.image,
              price: product.price,
              count: product.count,
            };
            addItem(productData, quantity);
            setAddedProducts((prev) => new Set(prev).add(product.id!));
            setTimeout(() => {
              setAddedProducts((prev) => {
                const next = new Set(prev);
                next.delete(product.id!);
                return next;
              });
            }, 2000);
          };

          return (
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="1"
                max={product.count}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Math.min(product.count, parseInt(e.target.value) || 1)))}
                className="w-16 bg-gray-800 border-gray-700 text-white text-center"
                disabled={product.count === 0}
              />
              <Button
                onClick={handleAddToCart}
                disabled={product.count === 0 || isAdded}
                size="sm"
                className={isAdded ? 'bg-green-600' : 'bg-blue-600 hover:bg-blue-700'}
              >
                {isAdded ? 'Added!' : <><ShoppingCart className="h-4 w-4 mr-1" />Add</>}
              </Button>
            </div>
          );
        },
        enableSorting: false,
        size: 200,
      },
    ],
    [countSortMode, addedProducts, addItem]
  );

  // Apply category filter
  const filteredProducts = useMemo(() => {
    if (categoryFilter === 'all') return products;
    return products.filter((p) => p.categoryId.toString() === categoryFilter);
  }, [products, categoryFilter]);

  // Table instance
  const table = useReactTable({
    data: filteredProducts,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      columnVisibility,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    globalFilterFn: (row, _columnId, filterValue) => {
      const searchValue = filterValue.toLowerCase();
      const title = row.original.title.toLowerCase();
      return title.includes(searchValue);
    },
  });

  const handleClearFilters = () => {
    setSearchInput('');
    setGlobalFilter('');
    setCategoryFilter('all');
    setCountSortMode('default');
    setSorting([]);
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 ml-64 overflow-auto">
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-8">
          <div className="max-w-[1600px] mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <TableIcon className="w-8 h-8 text-secondary-400" />
                  <h1 className="text-4xl font-bold text-white">Table View</h1>
                </div>
                <button
                  onClick={() => setCartDrawerOpen(true)}
                  className="relative bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 flex items-center gap-2 transition-colors"
                >
                  <ShoppingCart className="h-5 w-5" />
                  <span>Cart</span>
                  {totalItems > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </button>
              </div>
              <p className="text-gray-400">
                View and manage your inventory in a comprehensive table
              </p>
            </div>

            {/* Error Alert */}
            {error && (
              <Alert
                variant="destructive"
                className="mb-6 bg-error-500/20 border-error-400 backdrop-blur-sm"
              >
                <AlertDescription className="text-error-100">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {/* Filters */}
            <div className="bg-gray-900 rounded-xl p-6 mb-6 border border-gray-800">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                {/* Search */}
                <div className="md:col-span-4">
                  <label className="text-sm text-gray-400 mb-2 block">
                    Search Products
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search by product title..."
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-gray-500"
                    />
                  </div>
                </div>

                {/* Category Filter */}
                <div className="md:col-span-3">
                  <label className="text-sm text-gray-400 mb-2 block">
                    Category
                  </label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id!.toString()}>
                          {category.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Column Visibility */}
                <div className="md:col-span-3">
                  <label className="text-sm text-gray-400 mb-2 block">
                    Columns
                  </label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full bg-white/5 border-white/20 text-white hover:bg-white/10"
                      >
                        Columns
                        <ChevronDown className="ml-2 h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {table
                        .getAllColumns()
                        .filter((column) => column.getCanHide())
                        .map((column) => {
                          const isTitle = column.id === 'title';
                          return (
                            <DropdownMenuCheckboxItem
                              key={column.id}
                              className="capitalize"
                              checked={column.getIsVisible()}
                              onCheckedChange={(value) =>
                                !isTitle && column.toggleVisibility(!!value)
                              }
                              disabled={isTitle}
                            >
                              {column.id === 'categoryName' ? 'Category' : column.id}
                            </DropdownMenuCheckboxItem>
                          );
                        })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Clear Filters */}
                <div className="md:col-span-2">
                  <Button
                    variant="outline"
                    onClick={handleClearFilters}
                    className="w-full bg-white/5 border-white/20 text-white hover:bg-white/10"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Clear
                  </Button>
                </div>
              </div>
            </div>

            {/* Table */}
            {isLoading ? (
              <div className="flex items-center justify-center py-16 bg-gray-900 rounded-xl border border-gray-800">
                <Loader2 className="w-8 h-8 text-secondary-400 animate-spin" />
              </div>
            ) : table.getRowModel().rows.length === 0 ? (
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-12 text-center">
                <TableIcon className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  No products found
                </h3>
                <p className="text-gray-400 mb-4">
                  {globalFilter || categoryFilter !== 'all'
                    ? 'Try adjusting your filters'
                    : 'Add products to see them here'}
                </p>
                {(globalFilter || categoryFilter !== 'all') && (
                  <Button
                    onClick={handleClearFilters}
                    className="bg-gradient-to-r from-secondary-500 to-primary-600 hover:from-secondary-600 hover:to-primary-700 text-white font-medium rounded-xl"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            ) : (
              <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-gray-800/50 sticky top-0 z-10">
                      {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id} className="border-gray-700 hover:bg-transparent">
                          {headerGroup.headers.map((header) => (
                            <TableHead
                              key={header.id}
                              className="text-gray-300 font-semibold"
                            >
                              {header.isPlaceholder
                                ? null
                                : flexRender(
                                    header.column.columnDef.header,
                                    header.getContext()
                                  )}
                            </TableHead>
                          ))}
                        </TableRow>
                      ))}
                    </TableHeader>
                    <TableBody>
                      {table.getRowModel().rows.map((row, index) => (
                        <TableRow
                          key={row.id}
                          className={`border-gray-800 transition-colors ${
                            index % 2 === 0 ? 'bg-gray-900/50' : 'bg-gray-900'
                          } hover:bg-gray-800/70`}
                        >
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id} className="text-gray-300">
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Footer with count */}
                <div className="border-t border-gray-800 px-6 py-4">
                  <p className="text-sm text-gray-400">
                    Showing {table.getRowModel().rows.length} of {products.length}{' '}
                    product(s)
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <CartDrawer isOpen={cartDrawerOpen} onClose={() => setCartDrawerOpen(false)} />
    </div>
  );
};

export default TableView;
